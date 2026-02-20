import crypto from "node:crypto";

import cors from "cors";
import express from "express";
import { PublicKey } from "@solana/web3.js";

import { buildConfig, TIER_CONFIG } from "./config.js";
import { createChainClients, fetchTierInventory, transferCompressedAsset, verifyPaymentSignature } from "./chain.js";
import { JsonStateStore } from "./state-store.js";

function nowIso() {
  return new Date().toISOString();
}

function assertPublicKey(value, label) {
  try {
    new PublicKey(value);
    return String(value);
  } catch {
    throw new Error(`Invalid ${label}`);
  }
}

function tierCaps() {
  return {
    egg: TIER_CONFIG.egg.cap,
    hatchling: TIER_CONFIG.hatchling.cap,
    elder: TIER_CONFIG.elder.cap
  };
}

function tierSummaryFromInventory(inventory) {
  return {
    egg: inventory.egg.length,
    hatchling: inventory.hatchling.length,
    elder: inventory.elder.length,
    total: inventory.egg.length + inventory.hatchling.length + inventory.elder.length
  };
}

async function main() {
  const { cfg, missing } = buildConfig();

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }

  const chain = createChainClients(cfg);
  const store = new JsonStateStore(cfg.statePath);
  await store.init();

  const app = express();
  app.use(cors({ origin: cfg.corsOrigin === "*" ? true : cfg.corsOrigin }));
  app.use(express.json({ limit: "128kb" }));

  app.get("/api/mint/health", (_req, res) => {
    res.json({ ok: true, time: nowIso() });
  });

  app.get("/api/mint/config", async (_req, res) => {
    try {
      const inventory = await fetchTierInventory({
        umi: chain.umi,
        treasuryWallet: cfg.treasuryWallet,
        collectionAddress: cfg.collectionAddress,
        merkleTreeAddress: cfg.merkleTreeAddress,
        tierCaps: tierCaps()
      });

      const counts = tierSummaryFromInventory(inventory);
      res.json({
        ok: true,
        treasury: cfg.treasuryWallet,
        collection: cfg.collectionAddress,
        merkleTree: cfg.merkleTreeAddress,
        tiers: {
          egg: { ...TIER_CONFIG.egg, available: counts.egg },
          hatchling: { ...TIER_CONFIG.hatchling, available: counts.hatchling },
          elder: { ...TIER_CONFIG.elder, available: counts.elder }
        },
        inventoryCounts: counts
      });
    } catch (error) {
      res.status(500).json({ ok: false, error: String(error?.message ?? error) });
    }
  });

  app.post("/api/mint/intent", async (req, res) => {
    try {
      const tier = String(req.body?.tier ?? "").toLowerCase();
      const buyerWallet = assertPublicKey(req.body?.buyerWallet, "buyerWallet");
      const tierInfo = TIER_CONFIG[tier];

      if (!tierInfo) {
        return res.status(400).json({ ok: false, error: "Invalid tier" });
      }

      const inventory = await fetchTierInventory({
        umi: chain.umi,
        treasuryWallet: cfg.treasuryWallet,
        collectionAddress: cfg.collectionAddress,
        merkleTreeAddress: cfg.merkleTreeAddress,
        tierCaps: tierCaps()
      });

      if ((inventory[tier] ?? []).length === 0) {
        return res.status(409).json({ ok: false, error: `${tierInfo.name} is sold out` });
      }

      const intentId = crypto.randomUUID();
      const now = Date.now();
      const expiresAt = new Date(now + cfg.intentTtlSeconds * 1000).toISOString();

      await store.runExclusive(async (state) => {
        state.intents[intentId] = {
          id: intentId,
          tier,
          buyerWallet,
          expectedLamports: tierInfo.lamports,
          expectedSol: tierInfo.sol,
          status: "created",
          createdAt: nowIso(),
          expiresAt
        };
        await store.persist();
      });

      return res.json({
        ok: true,
        intentId,
        tier,
        tierName: tierInfo.name,
        treasury: cfg.treasuryWallet,
        lamports: tierInfo.lamports,
        sol: tierInfo.sol,
        expiresAt
      });
    } catch (error) {
      return res.status(400).json({ ok: false, error: String(error?.message ?? error) });
    }
  });

  app.post("/api/mint/finalize", async (req, res) => {
    const intentId = String(req.body?.intentId ?? "");
    const paymentSignature = String(req.body?.paymentSignature ?? "").trim();

    try {
      const buyerWallet = assertPublicKey(req.body?.buyerWallet, "buyerWallet");

      const outcome = await store.runExclusive(async (state) => {
        const intent = state.intents[intentId];
        if (!intent) {
          throw new Error("Mint intent not found");
        }

        if (intent.buyerWallet !== buyerWallet) {
          throw new Error("Wallet does not match intent owner");
        }

        if (intent.status === "delivered") {
          return {
            alreadyDelivered: true,
            intent
          };
        }

        if (intent.status === "created" && Date.now() > Date.parse(intent.expiresAt)) {
          throw new Error("Mint intent expired. Create a new intent.");
        }

        if (!paymentSignature) {
          throw new Error("paymentSignature is required");
        }

        const usedBy = state.usedPaymentSignatures[paymentSignature];
        if (usedBy && usedBy !== intent.id) {
          throw new Error("Payment signature already used by another intent");
        }

        if (intent.status === "created") {
          const verification = await verifyPaymentSignature({
            connection: chain.connection,
            signature: paymentSignature,
            expected: {
              buyer: intent.buyerWallet,
              treasury: cfg.treasuryWallet,
              lamports: intent.expectedLamports,
              intentId: intent.id
            }
          });

          if (!verification.ok) {
            throw new Error(`Payment verification failed: ${verification.reason}`);
          }

          intent.paymentSignature = paymentSignature;
          intent.paymentVerifiedAt = nowIso();
          intent.status = "paid";
          state.usedPaymentSignatures[paymentSignature] = intent.id;
        }

        if (!intent.assetId) {
          const inventory = await fetchTierInventory({
            umi: chain.umi,
            treasuryWallet: cfg.treasuryWallet,
            collectionAddress: cfg.collectionAddress,
            merkleTreeAddress: cfg.merkleTreeAddress,
            tierCaps: tierCaps()
          });

          const reserved = new Set(
            Object.values(state.intents)
              .filter((it) => it.assetId && it.status !== "delivered")
              .map((it) => it.assetId)
          );

          const candidate = (inventory[intent.tier] ?? []).find((assetId) => !reserved.has(assetId));

          if (!candidate) {
            throw new Error(`${TIER_CONFIG[intent.tier].name} inventory exhausted`);
          }

          intent.assetId = candidate;
          intent.assetReservedAt = nowIso();
        }

        await store.persist();
        return { alreadyDelivered: false, intent };
      });

      if (outcome.alreadyDelivered) {
        const deliveredIntent = outcome.intent;
        return res.json({
          ok: true,
          alreadyDelivered: true,
          tier: deliveredIntent.tier,
          assetId: deliveredIntent.assetId,
          paymentSignature: deliveredIntent.paymentSignature,
          deliverySignature: deliveredIntent.deliverySignature
        });
      }

      const intent = outcome.intent;

      let deliverySignature;
      try {
        deliverySignature = await transferCompressedAsset({
          umi: chain.umi,
          assetId: intent.assetId,
          destinationWallet: intent.buyerWallet,
          treasuryWallet: cfg.treasuryWallet
        });
      } catch (error) {
        await store.runExclusive(async (state) => {
          const current = state.intents[intent.id];
          current.status = "delivery_failed";
          current.deliveryError = String(error?.message ?? error);
          current.deliveryFailedAt = nowIso();
          await store.persist();
        });

        return res.status(502).json({
          ok: false,
          error: `Payment is verified but delivery failed: ${String(error?.message ?? error)}. Retry finalize for this intent.`
        });
      }

      await store.runExclusive(async (state) => {
        const current = state.intents[intent.id];
        current.status = "delivered";
        current.deliverySignature = deliverySignature;
        current.deliveredAt = nowIso();
        state.sales[current.assetId] = {
          intentId: current.id,
          tier: current.tier,
          buyerWallet: current.buyerWallet,
          paymentSignature: current.paymentSignature,
          deliverySignature,
          deliveredAt: current.deliveredAt
        };
        await store.persist();
      });

      return res.json({
        ok: true,
        intentId: intent.id,
        tier: intent.tier,
        tierName: TIER_CONFIG[intent.tier].name,
        assetId: intent.assetId,
        buyerWallet: intent.buyerWallet,
        treasury: cfg.treasuryWallet,
        paymentSignature: intent.paymentSignature,
        deliverySignature,
        paymentExplorer: `https://solscan.io/tx/${intent.paymentSignature}`,
        deliveryExplorer: `https://solscan.io/tx/${deliverySignature}`,
        assetExplorer: `https://solscan.io/token/${intent.assetId}`
      });
    } catch (error) {
      return res.status(400).json({ ok: false, error: String(error?.message ?? error), intentId, paymentSignature });
    }
  });

  app.listen(cfg.port, () => {
    console.log(`[mint-api] listening on port ${cfg.port}`);
    console.log(`[mint-api] treasury ${cfg.treasuryWallet}`);
    console.log(`[mint-api] collection ${cfg.collectionAddress}`);
    console.log(`[mint-api] tree ${cfg.merkleTreeAddress}`);
  });
}

main().catch((error) => {
  console.error("[mint-api] fatal", error);
  process.exitCode = 1;
});