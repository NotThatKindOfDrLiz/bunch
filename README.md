# Bunch – Bitcoin Loyalty Punch Cards

Bunch is adrop-in loyalty layer for Bitcoin-accepting merchants. It tracks punches locally alongside existing payment flows, without touching invoices or custody. Made for the btc++ Taipei hackathon.

## Architecture highlights

- **Vite + React + TypeScript** for fast iteration
- **Tailwind CSS** for kiosk-friendly + mobile-first styling
- **IndexedDB** via `idb` to persist merchant cards, sessions, and ledgers locally
- **BroadcastChannel** for real-time sync between `/merchant` and `/customer`
- **QR code generation + scanning** with fallback paste mode
- **Strict integrity checks**
  - Single-use purchase nonces with 10-minute expiry
  - Duplicate scans rejected client-side
  - Session end clears all volatile data
- **Demo mode toggle** keeps judges on the happy path: Mark Paid always succeeds, no external services

## Product decisions (Balanced Mode)

- Merchants define a single punch card template per device
- Each customer receives a random, per-merchant ID stored locally; no accounts, emails, or phone numbers
- Payments are simulated; Bunch never mints invoices or holds funds
- Redemption requires explicit merchant confirmation
- Copy emphasizes boundaries: “Bunch does not handle payments. Bunch tracks rewards after payment.”

## Roadmap

### Social gifting via Nostr (future work only)
- Allow customers to _gift_ a completed reward (e.g. free coffee) to another `npub`
- Merchant redeems one free item as usual, but the reward can be claimed by someone else
- Enables social discovery moments like “Coffee Bunch / Brunch Bunch”
- Opt-in, post-reward sharing only—no Nostr posts in the core MVP

### Additional ideas
- Optional WebRTC transport fallback if BroadcastChannel unsupported
- Export/import punch history snapshot for migrating kiosks
- Merchant analytics overlay (most popular rewards, streaks)
- Optional sats verification hooks for BTCPay or LNbits once reliability requirements are met

## Explicit non-goals

- No user accounts or login
- No email / phone collection
- No Stripe or fiat rails
- No invoice creation or wallet custody
- No Nostr publishing in the MVP
- No backend servers—everything runs in the browser
