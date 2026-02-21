import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import bs58 from "bs58";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import { addConfigLines, fetchCandyMachine, mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";

import { buildConfig } from "../src/config.js";
import { decryptTreasuryPrivateKey } from "../src/secret-key.js";

const CANDY_MACHINE = "CC3nsKDxKgkS5uZwoFLRaDkL4pCfSxLvVRNnFt8F8JWU";
const EGG_URI_SUFFIX = "hGVZjkwZuwdviN8FQhgaUmWFa2F2DdeNxPeb9Efs6oc";
const BATCH_SIZE = 5;

function decodeSecretKey(raw) {
  const text = String(raw ?? "").trim();
  if (!text) throw new Error("TREASURY_PRIVATE_KEY is empty");
  if (text.startsWith("[")) {
    return Uint8Array.from(JSON.parse(text));
  }
  return bs58.decode(text);
}

function nameSuffixForIndex(index) {
  const suffix = `${index + 1} - Egg`;
  if (suffix.length > 15) {
    throw new Error(`Name suffix too long for index ${index}: "${suffix}"`);
  }
  return suffix;
}

async function ensureBackupDirectory() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const backupDir = path.resolve(__dirname, "../data");
  await fs.mkdir(backupDir, { recursive: true });
  return backupDir;
}

async function main() {
  const { cfg, missing } = buildConfig();
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }

  const umi = createUmi(cfg.rpcUrl).use(mplCandyMachine());
  const secret = decodeSecretKey(decryptTreasuryPrivateKey(cfg));
  const keypair = umi.eddsa.createKeypairFromSecretKey(secret);
  umi.use(keypairIdentity(keypair));

  const candyMachine = publicKey(CANDY_MACHINE);
  const before = await fetchCandyMachine(umi, candyMachine);
  const authority = String(before.authority);
  const identity = String(umi.identity.publicKey);

  console.log(`identity=${identity}`);
  console.log(`authority=${authority}`);
  if (authority !== identity) {
    throw new Error("Identity does not match candy machine authority.");
  }

  const itemsAvailable = Number(before.data.itemsAvailable);
  const itemsRedeemed = Number(before.itemsRedeemed);
  console.log(`items_available=${itemsAvailable}`);
  console.log(`items_redeemed=${itemsRedeemed}`);

  const backupDir = await ensureBackupDirectory();
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
  const backupPath = path.join(backupDir, `candy-items-backup-${timestamp}.json`);
  await fs.writeFile(
    backupPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        candyMachine: CANDY_MACHINE,
        authority,
        itemsAvailable,
        itemsRedeemed,
        eggUriSuffix: EGG_URI_SUFFIX,
        items: before.items.map((item) => ({
          index: item.index,
          minted: item.minted,
          name: item.name,
          uri: item.uri
        }))
      },
      null,
      2
    ),
    "utf8"
  );
  console.log(`backup_written=${backupPath}`);

  const signatures = [];
  for (let start = 0; start < itemsAvailable; start += BATCH_SIZE) {
    const configLines = [];
    for (let offset = 0; offset < BATCH_SIZE; offset += 1) {
      const index = start + offset;
      if (index >= itemsAvailable) break;
      configLines.push({
        name: nameSuffixForIndex(index),
        uri: EGG_URI_SUFFIX
      });
    }

    const tx = addConfigLines(umi, {
      candyMachine,
      authority: umi.identity,
      index: start,
      configLines
    });
    const sent = await tx.sendAndConfirm(umi, {
      confirm: { commitment: "confirmed" }
    });
    const signature = bs58.encode(sent.signature);
    signatures.push(signature);
    console.log(`updated_batch_start=${start} size=${configLines.length} sig=${signature}`);
  }

  let after = null;
  let mismatches = [];
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const verifyUmi = createUmi(cfg.rpcUrl).use(mplCandyMachine());
    after = await fetchCandyMachine(verifyUmi, candyMachine);
    mismatches = after.items.filter(
      (item) =>
        !String(item.name).includes(" - Egg") ||
        !String(item.uri).endsWith(EGG_URI_SUFFIX)
    );
    if (mismatches.length === 0) break;
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  console.log(`verification_total_items=${after.items.length}`);
  console.log(`verification_mismatches=${mismatches.length}`);
  if (mismatches.length > 0) {
    console.log("mismatch_sample=", mismatches.slice(0, 5));
    throw new Error("Egg overwrite verification failed.");
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
