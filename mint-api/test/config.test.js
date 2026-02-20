import test from "node:test";
import assert from "node:assert/strict";

import { buildConfig } from "../src/config.js";

const ENV_KEYS = [
  "PORT",
  "SOLANA_RPC_URL",
  "SOLANA_COMMITMENT",
  "TREASURY_WALLET",
  "TREASURY_PRIVATE_KEY",
  "TREASURY_PRIVATE_KEY_ENCRYPTED",
  "TREASURY_KEY_PASSPHRASE",
  "COLLECTION_ADDRESS",
  "MERKLE_TREE_ADDRESS",
  "INTENT_TTL_SECONDS",
  "CORS_ORIGIN",
  "MINT_STATE_PATH"
];

function withEnv(patch, fn) {
  const previous = {};
  for (const key of ENV_KEYS) {
    previous[key] = process.env[key];
    delete process.env[key];
  }

  Object.assign(process.env, patch);

  try {
    fn();
  } finally {
    for (const key of ENV_KEYS) {
      if (previous[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    }
  }
}

test("buildConfig accepts encrypted treasury key when passphrase is provided", () => {
  withEnv(
    {
      TREASURY_WALLET: "7BLHKsHRGjsTKQdZYaC3tRDeUChJ9E2XsMPpg2Tv23cf",
      TREASURY_PRIVATE_KEY_ENCRYPTED: "v1:aaa:bbb:ccc:ddd",
      TREASURY_KEY_PASSPHRASE: "passphrase",
      COLLECTION_ADDRESS: "BaWgt3aengftgbQnu8fvc43jAc7AnMDwQMkotJuNobTz",
      MERKLE_TREE_ADDRESS: "6VQzo6mPiyT11SR8GMuT7A6QtgmTXFa5JPp5QDXk9U1h"
    },
    () => {
      const { missing } = buildConfig();
      assert.deepEqual(missing, []);
    }
  );
});

test("buildConfig flags missing passphrase when encrypted treasury key is set", () => {
  withEnv(
    {
      TREASURY_WALLET: "7BLHKsHRGjsTKQdZYaC3tRDeUChJ9E2XsMPpg2Tv23cf",
      TREASURY_PRIVATE_KEY_ENCRYPTED: "v1:aaa:bbb:ccc:ddd",
      COLLECTION_ADDRESS: "BaWgt3aengftgbQnu8fvc43jAc7AnMDwQMkotJuNobTz",
      MERKLE_TREE_ADDRESS: "6VQzo6mPiyT11SR8GMuT7A6QtgmTXFa5JPp5QDXk9U1h"
    },
    () => {
      const { missing } = buildConfig();
      assert.ok(missing.includes("TREASURY_KEY_PASSPHRASE (required with TREASURY_PRIVATE_KEY_ENCRYPTED)"));
    }
  );
});
