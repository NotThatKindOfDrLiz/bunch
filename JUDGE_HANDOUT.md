# Bunch – Bitcoin Loyalty Punch Cards

> Drop-in loyalty rewards for Bitcoin merchants

---

## The Problem

Bitcoin merchants have **no good way to reward repeat customers**. Traditional loyalty programs require:
- Customer accounts & emails 📧
- Centralized databases 🗄️
- Integration with payment processors 💳
- Complex infrastructure ⚙️

## The Solution

**Bunch** sits alongside your existing Bitcoin payment stack and tracks rewards **after** payment confirmation.

- ✅ **No accounts** - Customer scans QR, starts earning
- ✅ **No custody** - Bunch never touches invoices or funds  
- ✅ **No servers** - Everything runs in the browser
- ✅ **No integration** - Works with any payment system (BTCPay, LNbits, etc.)

---

## How It Works

### For Merchants:
1. Create a punch card (e.g., "Buy 5 Get 1 Free")
2. Start a session → join QR appears
3. Generate purchase QR for each transaction
4. Mark paid after Bitcoin payment confirms
5. Confirm reward redemptions

### For Customers:
1. Scan merchant's join QR (one time)
2. Scan purchase QR after each payment
3. Watch punches accumulate
4. Redeem reward when complete
5. Repeat!

---

## Key Features

### Privacy First
- No email, phone, or personal data collection
- Customer receives random merchant-specific ID
- All data stored locally in browser
- Session-based tracking

### Merchant Sovereignty
- Merchant controls card rules (punches, minimums, rewards)
- Merchant confirms all redemptions
- Merchant ends sessions to clear data
- No third-party dependencies

### Demo Mode
- Simulated payments for testing/demos
- Toggle on/off per session
- Maps directly to real payment flows
- Perfect for hackathon judging!

### Integrity Checks
- Single-use purchase nonces (10-min expiry)
- Duplicate scan prevention
- Merchant confirmation required
- Session-isolated ledger

---

## Tech Stack

**Frontend:**
- React + TypeScript + Vite
- Tailwind CSS (mobile-first)
- React Router

**Storage:**
- IndexedDB (merchant data persistence)
- LocalStorage (customer session state)
- BroadcastChannel (real-time sync)

**QR Codes:**
- `qrcode.react` (generation)
- `@yudiel/react-qr-scanner` (scanning)

**No Backend Required** - Everything client-side

---

## Production Path

### Real Payment Integration (Pseudo-code):

```typescript
// Merchant generates invoice via BTCPay/LNbits
const invoice = await btcpay.createInvoice({ 
  amount: 5000, 
  metadata: { purchaseNonce: nonce.id } 
})

// Webhook on payment confirmation
btcpay.on('invoice.paid', (invoice) => {
  const { purchaseNonce } = invoice.metadata
  merchantStore.markPaid(purchaseNonce, invoice.buyerInfo)
})
```

**Architecture supports this today** - just need to wire it up!

---

## Roadmap

### Near-term:
- [ ] BTCPay Server webhook integration
- [ ] LNbits payment verification
- [ ] Multi-card support per merchant
- [ ] Export/import punch history

### Future:
- [ ] **Social gifting via Nostr** - Customer can gift completed reward to a friend's `npub`
- [ ] Merchant analytics dashboard
- [ ] Streak bonuses (10% off after 3 visits)
- [ ] Location-based rewards

---

## Use Cases

**Coffee Shops**
"Buy 5 coffees, get 1 free" - minimum 10,000 sats per purchase

**Food Trucks**
"10 meals → free t-shirt" - minimum 50,000 sats

**Online Stores**
"3 purchases → 15% off next order" - minimum 100,000 sats

**Barber Shops**
"6 haircuts → 7th free" - minimum 200,000 sats

---

## Why It Matters

**For Merchants:**
- Increase repeat business
- Customer retention without surveillance
- Works with existing Bitcoin setup
- Zero deployment hassle

**For Customers:**
- Earn rewards without giving up privacy
- No app download required
- Works across devices (scan & go)
- Pure Bitcoin, no altcoins

**For Bitcoin Adoption:**
- Makes Bitcoin merchants more competitive
- Demonstrates Bitcoin UX can match Web2
- Privacy-preserving customer relationships
- Sovereignty over customer data

---

## Competitive Landscape

| Feature | Bunch | Starbucks App | Square Loyalty |
|---------|-------|---------------|----------------|
| Customer accounts | ❌ | ✅ Required | ✅ Required |
| Email required | ❌ | ✅ | ✅ |
| App download | ❌ | ✅ | ❌ (SMS) |
| Payment handling | ❌ Separate | ✅ Integrated | ✅ Integrated |
| Privacy | ✅ High | ❌ Low | ❌ Low |
| Merchant custody | ❌ None | ✅ Prepaid | ✅ Processor |
| Bitcoin native | ✅ | ❌ | ❌ |

---

## Demo'd Today

- ✅ Card creation & session management
- ✅ QR-based join flow
- ✅ Purchase tracking with nonces
- ✅ Punch awarding & progress
- ✅ Reward redemption flow
- ✅ Demo mode (no real payments)

**All running client-side in browser!**

---

## Open Source

**GitHub:** _(coming soon)_  
**License:** MIT  
**Built with:** React, TypeScript, Vite, Tailwind

---

## Contact

**Project:** Bunch  
**Tagline:** Bitcoin Loyalty Punch Cards  
**Category:** Merchant Tools / Customer Retention  

**Built by:** [Your Name]  
**For:** [Hackathon Name]  
**Date:** December 16, 2025

---

_Thank you for judging! Questions welcome._ 🚀
