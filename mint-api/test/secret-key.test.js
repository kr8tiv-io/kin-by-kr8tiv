import test from "node:test";
import assert from "node:assert/strict";

import { decryptSecretBox, decryptTreasuryPrivateKey, encryptSecretBox } from "../src/secret-key.js";

test("encryptSecretBox and decryptSecretBox round-trip plaintext", () => {
  const secret = "example-secret-value";
  const passphrase = "unit-test-passphrase";

  const encrypted = encryptSecretBox(secret, passphrase);
  const decrypted = decryptSecretBox(encrypted, passphrase);

  assert.equal(decrypted, secret);
  assert.notEqual(encrypted, secret);
});

test("decryptTreasuryPrivateKey prefers encrypted value when provided", () => {
  const secret = "treasury-secret-base58";
  const passphrase = "unit-test-passphrase";
  const encrypted = encryptSecretBox(secret, passphrase);

  const result = decryptTreasuryPrivateKey({
    treasuryPrivateKey: "plain-should-not-be-used",
    treasuryPrivateKeyEncrypted: encrypted,
    treasuryKeyPassphrase: passphrase
  });

  assert.equal(result, secret);
});

test("decryptTreasuryPrivateKey throws when encrypted key is set without passphrase", () => {
  const encrypted = encryptSecretBox("secret", "pass");

  assert.throws(
    () =>
      decryptTreasuryPrivateKey({
        treasuryPrivateKeyEncrypted: encrypted,
        treasuryKeyPassphrase: ""
      }),
    /TREASURY_KEY_PASSPHRASE/
  );
});
