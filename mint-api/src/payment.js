export function verifyParsedPayment(parsedTx, expected) {
  if (!parsedTx) {
    return { ok: false, reason: "transaction not found" };
  }

  if (parsedTx?.meta?.err) {
    return { ok: false, reason: "transaction has on-chain error" };
  }

  const buyer = String(expected?.buyer ?? "");
  const treasury = String(expected?.treasury ?? "");
  const lamports = Number(expected?.lamports ?? 0);
  const intentId = String(expected?.intentId ?? "");

  const accountKeys = parsedTx?.transaction?.message?.accountKeys ?? [];
  const hasBuyerSigner = accountKeys.some((key) => {
    const pubkey = String(
      typeof key === "string" ? key : key?.pubkey ?? key?.toString?.() ?? ""
    );
    return pubkey === buyer && Boolean(key?.signer);
  });

  if (!hasBuyerSigner) {
    return { ok: false, reason: "buyer is not a signer" };
  }

  const instructions = parsedTx?.transaction?.message?.instructions ?? [];
  const matchingTransfer = instructions.find((ix) => {
    if (String(ix?.program ?? "").toLowerCase() !== "system") return false;
    const parsed = ix?.parsed;
    if (!parsed || parsed.type !== "transfer") return false;
    const info = parsed.info ?? {};
    return (
      String(info.source ?? "") === buyer &&
      String(info.destination ?? "") === treasury &&
      Number(info.lamports ?? -1) === lamports
    );
  });

  if (!matchingTransfer) {
    const destinationMismatch = instructions.some((ix) => {
      if (String(ix?.program ?? "").toLowerCase() !== "system") return false;
      const parsed = ix?.parsed;
      if (!parsed || parsed.type !== "transfer") return false;
      const info = parsed.info ?? {};
      return String(info.source ?? "") === buyer;
    });

    if (destinationMismatch) {
      return { ok: false, reason: "transfer destination or amount does not match treasury rules" };
    }
    return { ok: false, reason: "required transfer instruction not found" };
  }

  if (intentId) {
    const memoIx = instructions.find(
      (ix) => String(ix?.program ?? "").toLowerCase() === "spl-memo"
    );
    const memoPayload = String(memoIx?.parsed ?? "");
    if (!memoPayload.includes(intentId)) {
      return { ok: false, reason: "memo is missing intent id" };
    }
  }

  return {
    ok: true,
    reason: null
  };
}
