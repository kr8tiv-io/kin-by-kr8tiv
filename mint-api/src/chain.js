import bs58 from "bs58";
import { Connection, PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  keypairIdentity,
  publicKey
} from "@metaplex-foundation/umi";
import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";
import { getAssetWithProof, mplBubblegum, transfer } from "@metaplex-foundation/mpl-bubblegum";

import { buildTierInventory } from "./inventory.js";
import { verifyParsedPayment } from "./payment.js";
import { decryptTreasuryPrivateKey } from "./secret-key.js";

function toBase58(value) {
  return String(value?.toString?.() ?? value ?? "");
}

function decodeSecretKey(secret) {
  const raw = String(secret ?? "").trim();
  if (!raw) throw new Error("TREASURY_PRIVATE_KEY is empty");

  if (raw.startsWith("[")) {
    return Uint8Array.from(JSON.parse(raw));
  }

  return bs58.decode(raw);
}

export function createChainClients(config) {
  new PublicKey(config.treasuryWallet);
  new PublicKey(config.collectionAddress);
  new PublicKey(config.merkleTreeAddress);

  const connection = new Connection(config.rpcUrl, config.commitment);
  const umi = createUmi(config.rpcUrl).use(dasApi()).use(mplBubblegum());

  const treasuryPrivateKey = decryptTreasuryPrivateKey(config);
  const secretKey = decodeSecretKey(treasuryPrivateKey);
  const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
  umi.use(keypairIdentity(keypair, true));

  return {
    connection,
    umi,
    treasurySigner: createSignerFromKeypair(umi, keypair)
  };
}

export async function fetchTierInventory({ umi, treasuryWallet, collectionAddress, merkleTreeAddress, tierCaps }) {
  const owner = publicKey(treasuryWallet);
  const targetCollection = String(collectionAddress);
  const targetTree = String(merkleTreeAddress);

  const allItems = [];
  let page = 1;

  // Max 1000 page size for DAS methods.
  while (true) {
    const pageData = await umi.rpc.getAssetsByOwner({
      owner,
      page,
      limit: 1000,
      sortBy: { sortBy: "id", sortDirection: "asc" },
      displayOptions: { showCollectionMetadata: true }
    });

    const items = Array.isArray(pageData?.items) ? pageData.items : [];
    if (items.length === 0) break;

    for (const item of items) {
      const collectionMatch = (item.grouping ?? []).some((group) => {
        const key = String(group?.group_key ?? "");
        const value = String(group?.group_value ?? "");
        return key === "collection" && value === targetCollection;
      });

      if (!collectionMatch) continue;

      const tree = toBase58(item?.compression?.tree);
      if (tree !== targetTree) continue;

      allItems.push(item);
    }

    if (items.length < 1000) break;
    page += 1;
  }

  return buildTierInventory(allItems, tierCaps);
}

export async function verifyPaymentSignature({ connection, signature, expected }) {
  const parsed = await connection.getParsedTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0
  });

  return verifyParsedPayment(parsed, expected);
}

export async function transferCompressedAsset({ umi, assetId, destinationWallet, treasuryWallet }) {
  const assetWithProof = await getAssetWithProof(umi, publicKey(assetId), { truncateCanopy: true });
  const treasury = String(treasuryWallet);

  if (String(assetWithProof.leafOwner) !== treasury) {
    throw new Error(`Asset owner mismatch for ${assetId}. Expected ${treasury}, got ${assetWithProof.leafOwner}`);
  }

  const transferResult = await transfer(umi, {
    ...assetWithProof,
    leafOwner: umi.identity,
    leafDelegate: umi.identity,
    newLeafOwner: publicKey(destinationWallet)
  }).sendAndConfirm(umi, {
    confirm: { commitment: "confirmed" }
  });

  return bs58.encode(transferResult.signature);
}
