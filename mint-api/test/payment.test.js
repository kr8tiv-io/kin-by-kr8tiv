import test from "node:test";
import assert from "node:assert/strict";

import { verifyParsedPayment } from "../src/payment.js";

const expected = {
  buyer: "Buyer111111111111111111111111111111111111111",
  treasury: "Treasury111111111111111111111111111111111111",
  lamports: 2500000000,
  intentId: "intent-abc"
};

function txWithTransfer(overrides = {}) {
  return {
    meta: { err: null },
    transaction: {
      message: {
        accountKeys: [
          { pubkey: expected.buyer, signer: true },
          { pubkey: expected.treasury, signer: false }
        ],
        instructions: [
          {
            program: "system",
            parsed: {
              type: "transfer",
              info: {
                source: expected.buyer,
                destination: expected.treasury,
                lamports: expected.lamports
              }
            }
          },
          {
            program: "spl-memo",
            parsed: "intent-abc"
          }
        ]
      }
    },
    ...overrides
  };
}

test("verifyParsedPayment accepts matching transfer", () => {
  const result = verifyParsedPayment(txWithTransfer(), expected);
  assert.equal(result.ok, true);
});

test("verifyParsedPayment rejects wrong destination", () => {
  const tx = txWithTransfer();
  tx.transaction.message.instructions[0].parsed.info.destination = "OtherWallet";
  const result = verifyParsedPayment(tx, expected);
  assert.equal(result.ok, false);
  assert.match(result.reason, /destination/i);
});

test("verifyParsedPayment rejects missing buyer signature", () => {
  const tx = txWithTransfer();
  tx.transaction.message.accountKeys[0].signer = false;
  const result = verifyParsedPayment(tx, expected);
  assert.equal(result.ok, false);
  assert.match(result.reason, /signer/i);
});

test("verifyParsedPayment rejects missing memo intent id", () => {
  const tx = txWithTransfer();
  tx.transaction.message.instructions = [
    tx.transaction.message.instructions[0]
  ];
  const result = verifyParsedPayment(tx, expected);
  assert.equal(result.ok, false);
  assert.match(result.reason, /memo/i);
});
