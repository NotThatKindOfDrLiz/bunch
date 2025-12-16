# Bunch – Bitcoin Loyalty Punch Cards

Bunch is a hackathon-ready, drop-in loyalty layer for Bitcoin-accepting merchants. It tracks punches locally alongside existing payment flows, without touching invoices or custody. The goal: _fewest steps, high demo reliability, and a clear mental model for non-technical judges_.

## Quickstart

```bash
pnpm install
pnpm dev
```

Then open:
- `http://localhost:5173/merchant` for the POS kiosk view
- `http://localhost:5173/customer` for the customer handset view (best in mobile simulator)

All data lives in the browser (IndexedDB + localStorage). Clearing browser storage resets everything.

## 🎯 Ready to Demo?

**→ Start with [`START_HERE.md`](START_HERE.md)** - Complete demo preparation guide

### Demo Documentation:
- **[START_HERE.md](START_HERE.md)** - Your starting point
- **[DEMO_README.md](DEMO_README.md)** - Complete overview
- **[DEMO_SCRIPT.md](DEMO_SCRIPT.md)** - 60-90 second walkthrough
- **[DEMO_CHEATSHEET.md](DEMO_CHEATSHEET.md)** - Quick reference (PRINT THIS!)
- **[DEMO_SETUP.md](DEMO_SETUP.md)** - Phone setup & troubleshooting
- **[JUDGE_HANDOUT.md](JUDGE_HANDOUT.md)** - Give to judges (PRINT THIS!)
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical deep-dive
- **[COMMANDS.md](COMMANDS.md)** - All useful commands

## 60-second demo walkthrough

1. **Merchant sets up**
   - Visit `/merchant`
   - Tap **Create card** (e.g. “Buy 5 Get 1”, min sats 1000)
   - Start a **Demo session** (demo payments ON by default)
   - Join code + QR appear instantly

2. **Customer joins**
   - On another device/tab open `/customer`
   - Tap **Scan join QR** (or enter the short code)
   - UI confirms “Bunch does not handle payments. Bunch tracks rewards after payment.”

3. **Record a purchase**
   - Merchant taps **New purchase** → purchase QR pops up
   - Customer taps **Scan purchase QR** → waits “Waiting for merchant…“
   - Merchant taps **Mark paid** (demo success) → punch awarded on both screens

4. **Redeem reward**
   - Repeat until punches ≥ requirement
   - Customer taps **Redeem reward** → merchant sees request → taps **Confirm redemption**
   - Punch card resets

5. **End session**
   - Merchant taps **End session** to clear pending nonces, ledger, and requests

_No Bitcoin node, invoices, or wallets are required in demo mode, but the flows map directly to real payments._

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

## Screenshots

_Add screenshots or GIFs here if desired for the demo._

---

Built for a hackathon: fast to understand, easy to demo, and ready to extend.
