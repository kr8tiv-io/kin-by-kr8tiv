import test from "node:test";
import assert from "node:assert/strict";

import { assertPaymentSignatureFormat, createRateLimiter } from "../src/security.js";

test("assertPaymentSignatureFormat accepts a base58 Solana signature", () => {
  const signature = "3".repeat(88);
  const normalized = assertPaymentSignatureFormat(signature);
  assert.equal(normalized, signature);
});

test("assertPaymentSignatureFormat rejects malformed signatures", () => {
  assert.throws(
    () => assertPaymentSignatureFormat("bad-signature"),
    /Invalid paymentSignature format/
  );
  assert.throws(
    () => assertPaymentSignatureFormat("0".repeat(88)),
    /Invalid paymentSignature format/
  );
});

test("createRateLimiter blocks after max requests in active window", () => {
  const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 2 });
  const req = { ip: "127.0.0.1", socket: { remoteAddress: "127.0.0.1" } };
  const response = {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    }
  };

  let nextCalls = 0;
  const next = () => {
    nextCalls += 1;
  };

  limiter(req, response, next);
  limiter(req, response, next);
  limiter(req, response, next);

  assert.equal(nextCalls, 2);
  assert.equal(response.statusCode, 429);
  assert.equal(response.payload?.ok, false);
});
