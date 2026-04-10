<p align="center">
  <img src="assets/kin-hero-final.png" alt="KIN by KR8TIV" width="280" />
</p>

<h1 align="center">KIN by KR8TIV</h1>

<p align="center">
  <strong>We Build You A Friend.</strong><br/>
  <em>A fully managed AI companion with concierge onboarding, verifiable Solana Genesis ownership, and zero technical setup for the client.</em>
</p>

<p align="center">
  <a href="https://meetyourkin.com">meetyourkin.com</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="https://meetyourkin.com/mint/">Genesis Mint</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="https://x.com/kr8tivai">@kr8tivai</a>
</p>

---

## // CLASSIFICATION: OVERVIEW

KIN is not another chatbot. It is a **bespoke AI companion** -- a personal employee, concierge, and creative partner that operates across voice, Telegram, WhatsApp, and desktop. Every KIN is individually configured through a white-glove onboarding process, backed by managed OpenClaw infrastructure, and anchored to a verifiable Genesis NFT on Solana.

No API keys. No server management. No technical knowledge required. You get a companion who knows you -- and works for you.

---

## // THE GENESIS SIX

Only six bloodlines will ever exist as Genesis. Every future KIN descends from them.

| Bloodline | Species | Specialization |
|-----------|---------|----------------|
| **Mischief** | Glitch Pup | Family companion & personal-brand whisperer. Bedtime stories, calendar management, authentic social content. |
| **Vortex** | Teal Dragon | 24/7 CMO. Scroll-stopping content generation, cross-platform scheduling, brand voice guardian. |
| **Forge** | Cyber Unicorn | Developer's best friend. 3 a.m. debugging, project architecture, documentation, custom automations. |
| **Aether** | Frost Ape | Infinite creative spark. Polished scripts, newsletters, books, marketing copy, storytelling muse. |
| **Catalyst** | Cosmic Blob | Wealth & growth coach. Market data absorption, habit tracking, investment management, life automation. |
| **Cipher** | Code Kraken | Frontend architect & creative technologist. Award-worthy websites from raw ideas. Eight tentacles, zero pixels out of place. |

---

## // GENESIS MINT ARCHITECTURE

The Genesis collection is limited to **60 compressed NFTs** across three tiers. Minting uses a verifiable two-phase flow with on-chain payment verification.

```
 BUYER                          MINT API                         SOLANA
  |                                |                                |
  |-- POST /api/mint/intent ------>|                                |
  |<---- intentId + treasury ------|                                |
  |                                |                                |
  |-- SOL transfer via Phantom ----|-------- on-chain tx ---------->|
  |                                |                                |
  |-- POST /api/mint/finalize ---->|-- verify parsed tx ----------->|
  |                                |<- confirmed --------------------|
  |                                |-- transfer cNFT to buyer ----->|
  |<---- delivery signature -------|                                |
```

### Tier Structure

| Tier | Price | Supply | Color |
|------|-------|--------|-------|
| Egg | 2.5 SOL | 20 | `#FFB800` |
| Hatchling | 5.3 SOL | 20 | `#00F0FF` |
| Elder | 8.3 SOL | 20 | `#FF00AA` |

### Enforcement Rules

1. Intent created per-tier with unique UUID
2. Buyer must pay **exact lamports** to treasury wallet
3. Payment must be signed by buyer wallet
4. SPL Memo must contain intent ID (replay protection)
5. Payment signatures cannot be reused across intents
6. Backend allocates one asset from the tier inventory
7. One cNFT transferred to buyer per verified payment

---

## // TECH STACK

### Frontend
- Static HTML/CSS with **GSAP** scroll-driven animations
- **JetBrains Mono** + **Outfit** + **Plus Jakarta Sans** typography
- Phantom wallet integration via `@phantom/browser-sdk`
- Dark intelligence-ops aesthetic (`#0a0a0f` base)
- Video hero with grain overlay and glassmorphic UI

### Mint API (`mint-api/`)
- **Node.js** + **Express 5** (ESM)
- **Solana Web3.js** for payment verification
- **Metaplex UMI** + **Bubblegum** for cNFT transfers
- **DAS API** for asset indexing and inventory management
- AES-256-GCM encrypted treasury key support (scrypt-derived)
- JSON state store with exclusive-lock concurrency
- Per-IP rate limiting (60 intents/min, 120 finalizations/min)

### On-Chain Programs
- System Program -- SOL payment transfers
- SPL Memo Program -- intent binding / replay protection
- Metaplex Bubblegum -- compressed NFT transfers

### Infrastructure
- Solana Mainnet (Helius RPC recommended)
- Managed OpenClaw backend (servers, APIs, context management)
- Phantom wallet for buyer-side transactions

---

## // PROJECT STRUCTURE

```
kin-by-kr8tiv/
  index.html                    # Main landing page (GSAP animations, full product showcase)
  mint/
    index.html                  # Genesis mint page (Phantom integration, tier selection)
    kin-mint.*.js               # Bundled mint client logic
    phantom-browser-sdk.*.js    # Phantom SDK bundle
  mint-api/
    src/
      server.js                 # Express API -- intent, finalize, health, config endpoints
      chain.js                  # Solana/UMI clients, DAS inventory fetch, cNFT transfer
      payment.js                # On-chain payment verification (parsed tx analysis)
      inventory.js              # Tier classification from NFT metadata attributes
      security.js               # Signature format validation, IP rate limiting
      config.js                 # Environment config builder, tier definitions
      secret-key.js             # AES-256-GCM encryption/decryption for treasury keys
      state-store.js            # JSON file state with exclusive-lock concurrency
    test/                       # Node.js built-in test runner
    scripts/
      browser-sdk-entry.js      # Phantom SDK esbuild entry
  assets/                       # Character art, hero images, NFT artwork, video
  privacy.html                  # Privacy policy
  terms.html                    # Terms of service
  MINT_CONTRACT_TRANSPARENCY.md # On-chain program addresses and enforcement rules
  STAKING_CONTRACT_STATUS.md    # Staking program deployment checklist (TBD)
```

---

## // GETTING STARTED

### Prerequisites
- Node.js 18+
- A Solana wallet with funded treasury
- Helius or equivalent RPC endpoint

### Frontend (Landing + Mint Pages)

```bash
npx serve .
```

### Mint API

```bash
cd mint-api
npm install
cp .env.example .env
```

Configure `.env` with your deployment values:

```env
TREASURY_WALLET=<your-treasury-public-key>
TREASURY_PRIVATE_KEY=<base58-secret-key>
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=<key>
COLLECTION_ADDRESS=<merkle-collection-address>
MERKLE_TREE_ADDRESS=<bubblegum-tree-address>
```

For production, use encrypted key mode instead of plaintext:

```bash
TREASURY_PRIVATE_KEY_PLAIN="<secret>" TREASURY_KEY_PASSPHRASE="<passphrase>" npm run encrypt:key
```

Then set `TREASURY_PRIVATE_KEY_ENCRYPTED` and `TREASURY_KEY_PASSPHRASE` in `.env`.

Start the server:

```bash
npm start        # Runs on port 8787 by default
npm test         # Run verification test suite
```

### Custom API Domain

If the mint API is hosted separately from the frontend:

```html
<script>
  window.KIN_MINT_API_BASE = 'https://your-api.example.com/api/mint';
</script>
```

---

## // API REFERENCE

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/mint/health` | Service health check |
| `GET` | `/api/mint/config` | Live tier pricing, inventory counts, treasury/collection addresses |
| `POST` | `/api/mint/intent` | Create a mint intent for a specific tier + buyer wallet |
| `POST` | `/api/mint/finalize` | Verify on-chain payment and transfer cNFT to buyer |

---

## // SECURITY

- Treasury private keys support AES-256-GCM encryption at rest (scrypt key derivation)
- No secrets stored in the repository
- Runtime mint state is gitignored (`mint-api/data/mint-state.json`)
- Payment signatures are validated against parsed on-chain transactions
- Intent IDs bound to payment via SPL Memo (prevents replay attacks)
- Per-IP rate limiting on all mutation endpoints
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- CORS origin configurable via environment

---

## // TRANSPARENCY

Full on-chain program addresses, enforcement rules, and supply caps are documented in [`MINT_CONTRACT_TRANSPARENCY.md`](MINT_CONTRACT_TRANSPARENCY.md).

Staking program deployment status and verification checklist: [`STAKING_CONTRACT_STATUS.md`](STAKING_CONTRACT_STATUS.md).

---

<p align="center">
  <sub>Built by <a href="https://github.com/kr8tiv-ai">kr8tiv-ai</a> -- where AI meets ownership.</sub>
</p>
