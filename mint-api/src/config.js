import dotenv from "dotenv";

dotenv.config();

export const TIER_CONFIG = {
  egg: { name: "Egg", sol: 2.5, lamports: 2_500_000_000, cap: 20, color: "#FFB800" },
  hatchling: { name: "Hatchling", sol: 5.3, lamports: 5_300_000_000, cap: 20, color: "#00F0FF" },
  elder: { name: "Elder", sol: 8.3, lamports: 8_300_000_000, cap: 20, color: "#FF00AA" }
};

export function buildConfig() {
  const cfg = {
    port: Number(process.env.PORT ?? 8787),
    rpcUrl: process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com",
    commitment: process.env.SOLANA_COMMITMENT ?? "confirmed",
    treasuryWallet: process.env.TREASURY_WALLET ?? "",
    treasuryPrivateKey: process.env.TREASURY_PRIVATE_KEY ?? "",
    collectionAddress: process.env.COLLECTION_ADDRESS ?? "",
    merkleTreeAddress: process.env.MERKLE_TREE_ADDRESS ?? "",
    intentTtlSeconds: Number(process.env.INTENT_TTL_SECONDS ?? 1200),
    corsOrigin: process.env.CORS_ORIGIN ?? "*",
    statePath: process.env.MINT_STATE_PATH ?? "./data/mint-state.json"
  };

  const missing = [];
  if (!cfg.treasuryWallet) missing.push("TREASURY_WALLET");
  if (!cfg.treasuryPrivateKey) missing.push("TREASURY_PRIVATE_KEY");
  if (!cfg.collectionAddress) missing.push("COLLECTION_ADDRESS");
  if (!cfg.merkleTreeAddress) missing.push("MERKLE_TREE_ADDRESS");

  return { cfg, missing };
}