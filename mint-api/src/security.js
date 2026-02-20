export function assertPaymentSignatureFormat(signature) {
  const normalized = String(signature ?? "").trim();
  if (!/^[1-9A-HJ-NP-Za-km-z]{80,100}$/.test(normalized)) {
    throw new Error("Invalid paymentSignature format");
  }
  return normalized;
}

export function createRateLimiter({ windowMs, maxRequests }) {
  const buckets = new Map();

  return function rateLimit(req, res, next) {
    const key = String(req.ip ?? req.socket?.remoteAddress ?? "unknown");
    const now = Date.now();

    // Opportunistic cleanup to prevent unbounded map growth.
    if (buckets.size > 5000) {
      for (const [bucketKey, bucket] of buckets.entries()) {
        if (now - bucket.windowStart >= windowMs) {
          buckets.delete(bucketKey);
        }
      }
    }

    const bucket = buckets.get(key);
    if (!bucket || now - bucket.windowStart >= windowMs) {
      buckets.set(key, { windowStart: now, count: 1 });
      return next();
    }

    if (bucket.count >= maxRequests) {
      return res.status(429).json({
        ok: false,
        error: "Too many requests. Please slow down and try again."
      });
    }

    bucket.count += 1;
    return next();
  };
}
