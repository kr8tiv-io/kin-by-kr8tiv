# KIN by KR8TIV

Premium AI companion project with Solana Genesis NFT minting.

## Current Mint Architecture

This repo now uses a verifiable two-phase flow:

1. Client requests mint intent (`/api/mint/intent`).
2. Buyer pays exact SOL amount to treasury (`7BLHKsHRGjsTKQdZYaC3tRDeUChJ9E2XsMPpg2Tv23cf`) via Phantom.
3. Client calls finalize (`/api/mint/finalize`).
4. Backend verifies on-chain payment details and transfers one compressed NFT to buyer.

## Tier Rules

- Egg: 2.5 SOL, cap 20
- Hatchling: 5.3 SOL, cap 20
- Elder: 8.3 SOL, cap 20

The backend enforces one purchase equals one NFT delivery.

## Tech Stack

- Frontend: static `index.html`
- Wallet: Phantom + `@solana/web3.js`
- API: Node.js + Express (`mint-api`)
- cNFT transfer: Metaplex UMI + Bubblegum
- Asset indexing: DAS API

## Key Files (Public Logic)

- Frontend mint flow: `index.html`
- Mint API routes: `mint-api/src/server.js`
- Payment verification: `mint-api/src/payment.js`
- Tier classification/capping: `mint-api/src/inventory.js`
- Solana + Bubblegum transfer: `mint-api/src/chain.js`
- Transparency notes: `MINT_CONTRACT_TRANSPARENCY.md`
- Staking contract status: `STAKING_CONTRACT_STATUS.md`

## Local Run

### Frontend

```bash
npx serve .
```

### Mint API

```bash
cd mint-api
npm install
cp .env.example .env
# Fill TREASURY_PRIVATE_KEY and RPC env vars
npm start
```

If API is hosted on a different domain, set:

```html
<script>
  window.KIN_MINT_API_BASE = 'https://your-api.example.com/api/mint';
</script>
```

## Security

- Secrets are not stored in repo.
- Use `mint-api/.env` on server only.
- Runtime mint state is stored in `mint-api/data/mint-state.json` and ignored by git.
