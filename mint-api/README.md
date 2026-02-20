# KIN Mint API

Server-side mint verification and cNFT delivery.

## Endpoints

- `GET /api/mint/health`
- `GET /api/mint/config`
- `POST /api/mint/intent`
- `POST /api/mint/finalize`

## Environment

Copy `.env.example` to `.env` and set:

- `TREASURY_PRIVATE_KEY`
- `SOLANA_RPC_URL` (Helius recommended for reliability)
- `TREASURY_WALLET`
- `COLLECTION_ADDRESS`
- `MERKLE_TREE_ADDRESS`

## Run

```bash
npm install
npm test
npm start
```