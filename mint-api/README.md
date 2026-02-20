# KIN Mint API

Server-side mint verification and cNFT delivery.

## Endpoints

- `GET /api/mint/health`
- `GET /api/mint/config`
- `POST /api/mint/intent`
- `POST /api/mint/finalize`

## Environment

Copy `.env.example` to `.env` and set:

- `TREASURY_PRIVATE_KEY` (legacy plaintext) **or** `TREASURY_PRIVATE_KEY_ENCRYPTED` + `TREASURY_KEY_PASSPHRASE`
- `SOLANA_RPC_URL` (Helius recommended for reliability)
- `TREASURY_WALLET`
- `COLLECTION_ADDRESS`
- `MERKLE_TREE_ADDRESS`

### Encrypted Treasury Key Format

Use `TREASURY_PRIVATE_KEY_ENCRYPTED` in this format:

`v1:<saltBase64>:<ivBase64>:<authTagBase64>:<ciphertextBase64>`

`TREASURY_KEY_PASSPHRASE` is required when encrypted mode is used.

Generate encrypted payload:

```bash
TREASURY_PRIVATE_KEY_PLAIN="<base58-or-json-secret>" TREASURY_KEY_PASSPHRASE="<strong-passphrase>" npm run encrypt:key
```

## Run

```bash
npm install
npm test
npm start
```
