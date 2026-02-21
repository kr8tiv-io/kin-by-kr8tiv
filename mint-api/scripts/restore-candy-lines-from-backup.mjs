import "dotenv/config";

import fs from "node:fs/promises";
import bs58 from "bs58";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import { addConfigLines, fetchCandyMachine, mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";

import { buildConfig } from "../src/config.js";
import { decryptTreasuryPrivateKey } from "../src/secret-key.js";

const BATCH_SIZE = 5;

function decodeSecretKey(raw) {
  const text = String(raw ?? "").trim();
  if (!text) throw new Error("TREASURY_PRIVATE_KEY is empty");
  if (text.startsWith("[")) {
    return Uint8Array.from(JSON.parse(text));
  }
  return bs58.decode(text);
}

function requireArg(index, label) {
  const value = process.argv[index];
  if (!value) throw new Error(`Usage: node scripts/restore-candy-lines-from-backup.mjs <backup-json-path>`);
  return value;
}

function unwrapOption(value) {
  if (value && typeof value === "object" && "__option" in value) {
    return value.__option === "Some" ? value.value : null;
  }
  return value;
}

function toSuffix(value, prefix, maxLength, field) {
  let output = String(value ?? "");
  if (prefix && output.startsWith(prefix)) {
    output = output.slice(prefix.length);
  }
  if (output.length > maxLength) {
    throw new Error(`${field} too long after prefix removal: "${output}" (${output.length} > ${maxLength})`);
  }
  return output;
}

async function main() {
  const backupPath = requireArg(2, "backup-json-path");
  const backup = JSON.parse(await fs.readFile(backupPath, "utf8"));

  const { cfg, missing } = buildConfig();
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }

  const umi = createUmi(cfg.rpcUrl).use(mplCandyMachine());
  const secret = decodeSecretKey(decryptTreasuryPrivateKey(cfg));
  const keypair = umi.eddsa.createKeypairFromSecretKey(secret);
  umi.use(keypairIdentity(keypair));

  const candyMachinePk = publicKey(backup.candyMachine);
  const current = await fetchCandyMachine(umi, candyMachinePk);

  const authority = String(current.authority);
  const identity = String(umi.identity.publicKey);
  console.log(`identity=${identity}`);
  console.log(`authority=${authority}`);
  if (authority !== identity) {
    throw new Error("Identity does not match candy machine authority.");
  }

  const configLineSettings = unwrapOption(current.data.configLineSettings);
  if (!configLineSettings) {
    throw new Error("Candy machine configLineSettings not available.");
  }

  const prefixName = String(configLineSettings.prefixName ?? "");
  const prefixUri = String(configLineSettings.prefixUri ?? "");
  const nameLength = Number(configLineSettings.nameLength ?? 0);
  const uriLength = Number(configLineSettings.uriLength ?? 0);
  if (!nameLength || !uriLength) {
    throw new Error("Invalid config line length settings.");
  }

  const byIndex = [...backup.items].sort((a, b) => Number(a.index) - Number(b.index));
  const signatures = [];

  for (let start = 0; start < byIndex.length; start += BATCH_SIZE) {
    const slice = byIndex.slice(start, start + BATCH_SIZE);
    const index = Number(slice[0].index);
    const configLines = slice.map((item) => ({
      name: toSuffix(item.name, prefixName, nameLength, "name"),
      uri: toSuffix(item.uri, prefixUri, uriLength, "uri")
    }));

    const tx = addConfigLines(umi, {
      candyMachine: candyMachinePk,
      authority: umi.identity,
      index,
      configLines
    });
    const sent = await tx.sendAndConfirm(umi, {
      confirm: { commitment: "confirmed" }
    });
    const signature = bs58.encode(sent.signature);
    signatures.push(signature);
    console.log(`restored_batch_start=${index} size=${configLines.length} sig=${signature}`);
  }

  const after = await fetchCandyMachine(umi, candyMachinePk);
  const mismatches = byIndex.filter((item) => {
    const currentItem = after.items[Number(item.index)];
    return !currentItem || String(currentItem.name) !== String(item.name) || String(currentItem.uri) !== String(item.uri);
  });

  console.log(`verification_total=${byIndex.length}`);
  console.log(`verification_mismatches=${mismatches.length}`);
  if (mismatches.length > 0) {
    console.log("mismatch_sample=", mismatches.slice(0, 5));
    throw new Error("Restore verification failed.");
  }

  console.log(`batches_sent=${signatures.length}`);
  console.log("batch_signatures=");
  signatures.forEach((sig) => console.log(sig));
}

main().catch((error) => {
  const message = error?.stack || error?.message || String(error);
  console.error(message);
  process.exit(1);
});
