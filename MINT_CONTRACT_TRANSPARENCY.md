# Mint Contract Transparency

This project uses Solana system transfer + Metaplex Bubblegum transfer, with verification enforced in `mint-api`.

## On-chain Programs

- System Program (SOL payment): `11111111111111111111111111111111`
- SPL Memo Program (intent binding): `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`
- Metaplex Bubblegum Program (cNFT transfer): handled via `@metaplex-foundation/mpl-bubblegum`

## Enforcement Rules

Implemented in `mint-api/src/server.js` and `mint-api/src/payment.js`:

1. Buyer creates intent for one tier.
2. Buyer must pay exact lamports for that tier.
3. Payment must come from buyer wallet and go to treasury wallet `7BLHKsHRGjsTKQdZYaC3tRDeUChJ9E2XsMPpg2Tv23cf`.
4. Payment must include memo with intent id.
5. Signature cannot be reused for another intent.
6. Backend allocates one asset in selected tier.
7. Backend transfers one cNFT to buyer wallet.

## Supply Rules

Implemented in `mint-api/src/inventory.js` and `mint-api/src/server.js`:

- Egg cap: 20
- Hatchling cap: 20
- Elder cap: 20

Only assets matching configured collection + tree are eligible.

## Secrets

- Private keys are loaded from `mint-api/.env` only.
- `.env` and runtime state files are gitignored.