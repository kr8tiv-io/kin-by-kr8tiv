import "dotenv/config";

import bs58 from "bs58";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity, publicKey, some, sol } from "@metaplex-foundation/umi";
import { fetchCandyGuard, mplCandyMachine, updateCandyGuard } from "@metaplex-foundation/mpl-candy-machine";

import { buildConfig } from "../src/config.js";
import { decryptTreasuryPrivateKey } from "../src/secret-key.js";

const CANDY_MACHINE = "CC3nsKDxKgkS5uZwoFLRaDkL4pCfSxLvVRNnFt8F8JWU";
const CANDY_GUARD = "BnAUBBg7Un9iwg2S2hrdoRr8B6uEnRw2Bx2SUYH4jC99";
const TARGET_GROUPS = new Set(["egg", "hatch", "elder"]);

const PRESETS = {
  temp: {
    egg: 0.001,
    hatch: 0.001,
    elder: 0.001
  },
  prod: {
    egg: 2.5,
    hatch: 5.3,
    elder: 8.3
  }
};

function decodeSecretKey(raw) {
  const text = String(raw ?? "").trim();
  if (!text) throw new Error("TREASURY_PRIVATE_KEY is empty");
  if (text.startsWith("[")) return Uint8Array.from(JSON.parse(text));
  return bs58.decode(text);
}

function getMode() {
  const modeArg = process.argv.find((arg) => arg.startsWith("--mode="));
  const mode = (modeArg ? modeArg.split("=")[1] : "temp").trim().toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(PRESETS, mode)) {
    throw new Error(`Invalid mode "${mode}". Use --mode=temp or --mode=prod.`);
  }
  return mode;
}

function lamportsFromGuardOption(solPaymentOption) {
  if (!solPaymentOption || solPaymentOption.__option !== "Some") return null;
  const value = solPaymentOption.value?.lamports;
  if (!value) return null;
  if (typeof value === "object" && "basisPoints" in value) return String(value.basisPoints);
  if (typeof value === "bigint") return value.toString();
  return String(value);
}

function printGroups(prefix, guardAccount) {
  for (const group of guardAccount.groups) {
    const option = group.guards?.solPayment;
    const lamports = lamportsFromGuardOption(option);
    if (!lamports) {
      console.log(`${prefix} group=${group.label} solPayment=NONE`);
      continue;
    }
    console.log(`${prefix} group=${group.label} lamports=${lamports} destination=${String(option.value.destination)}`);
  }
}

async function main() {
  const mode = getMode();
  const prices = PRESETS[mode];

  const { cfg, missing } = buildConfig();
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }

  const umi = createUmi(cfg.rpcUrl).use(mplCandyMachine());
  const secret = decodeSecretKey(decryptTreasuryPrivateKey(cfg));
  const keypair = umi.eddsa.createKeypairFromSecretKey(secret);
  umi.use(keypairIdentity(keypair));

  const candyGuard = publicKey(CANDY_GUARD);
  const candyMachine = publicKey(CANDY_MACHINE);
  const before = await fetchCandyGuard(umi, candyGuard);

  if (String(before.authority) !== String(umi.identity.publicKey)) {
    throw new Error("Identity does not match candy guard authority.");
  }

  console.log(`mode=${mode}`);
  console.log(`identity=${umi.identity.publicKey}`);
  console.log(`authority=${before.authority}`);
  printGroups("before", before);

  const groupsOut = before.groups.map((group) => {
    if (!TARGET_GROUPS.has(group.label)) return group;
    const option = group.guards?.solPayment;
    if (!option || option.__option !== "Some") {
      throw new Error(`Group ${group.label} does not have a solPayment guard.`);
    }
    const targetSol = prices[group.label];
    if (typeof targetSol !== "number") {
      throw new Error(`No target price configured for group "${group.label}" in mode "${mode}".`);
    }

    return {
      label: group.label,
      guards: {
        ...group.guards,
        solPayment: some({
          ...option.value,
          lamports: sol(targetSol)
        })
      }
    };
  });

  const builder = updateCandyGuard(umi, {
    candyGuard,
    candyMachine,
    authority: umi.identity,
    guards: before.guards,
    groups: groupsOut
  });

  const sent = await builder.sendAndConfirm(umi, {
    confirm: { commitment: "confirmed" }
  });
  const signature = bs58.encode(sent.signature);
  console.log(`update_signature=${signature}`);

  const after = await fetchCandyGuard(umi, candyGuard);
  printGroups("after", after);
}

main().catch((error) => {
  const message = error?.stack || error?.message || String(error);
  console.error(message);
  process.exit(1);
});
