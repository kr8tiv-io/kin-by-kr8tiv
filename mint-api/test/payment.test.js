import test from "node:test";
import assert from "node:assert/strict";

import { verifyParsedPayment } from "../src/payment.js";

function makeParsedTx({ buyer, treasury, lamports, memo, signer = true }) {
  return {
    meta: { err: null },
    transaction: {
      message: {
        accountKeys: [
          { pubkey: buyer, signer, writable: true },
          { pubkey: treasury, signer: false, writable: true }
        ],
        instructions: [
          {
            program: "system",
            parsed: {
              type: "transfer",
              info: {
                source: buyer,
                destination: treasury,
                lamports
              }
            }
          },
          {
            program: "spl-memo",
            parsed: memo
          }
        ]
      }
    }
  };
}

test("verifyParsedPayment accepts valid transfer with memo intent id", () => {
  const buyer = "Buyer111111111111111111111111111111111111111";
  const treasury = "Treasury111111111111111111111111111111111111";
  const intentId = "intent-123";
  const parsedTx = makeParsedTx({
    buyer,
    treasury,
    lamports: 2_500_000_000,
    memo: `KIN:${intentId}`
  });

  const result = verifyParsedPayment(parsedTx, {
    buyer,
    treasury,
    lamports: 2_500_000_000,
    intentId
  });

  assert.equal(result.ok, true);
  assert.equal(result.reason, null);
});

test("verifyParsedPayment rejects transfer destination mismatch", () => {
  const buyer = "Buyer111111111111111111111111111111111111111";
  const treasury = "Treasury111111111111111111111111111111111111";
  const parsedTx = makeParsedTx({
    buyer,
    treasury: "WrongTreasury1111111111111111111111111111111",
    lamports: 2_500_000_000,
    memo: "KIN:intent-abc"
  });

  const result = verifyParsedPayment(parsedTx, {
    buyer,
    treasury,
    lamports: 2_500_000_000,
    intentId: "intent-abc"
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "transfer destination or amount does not match treasury rules");
});

test("verifyParsedPayment rejects when buyer is not a signer", () => {
  const buyer = "Buyer111111111111111111111111111111111111111";
  const treasury = "Treasury111111111111111111111111111111111111";
  const parsedTx = makeParsedTx({
    buyer,
    treasury,
    lamports: 2_500_000_000,
    memo: "KIN:intent-abc",
    signer: false
  });

  const result = verifyParsedPayment(parsedTx, {
    buyer,
    treasury,
    lamports: 2_500_000_000,
    intentId: "intent-abc"
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "buyer is not a signer");
});

test("verifyParsedPayment rejects when memo misses intent id", () => {
  const buyer = "Buyer111111111111111111111111111111111111111";
  const treasury = "Treasury111111111111111111111111111111111111";
  const parsedTx = makeParsedTx({
    buyer,
    treasury,
    lamports: 5_300_000_000,
    memo: "KIN:wrong-intent"
  });

  const result = verifyParsedPayment(parsedTx, {
    buyer,
    treasury,
    lamports: 5_300_000_000,
    intentId: "intent-expected"
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "memo is missing intent id");
});
