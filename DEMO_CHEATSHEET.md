# Bunch Demo Cheat Sheet

## URLs
- Merchant: `http://localhost:5173/merchant`
- Customer: `http://localhost:5173/customer` (open in mobile view)

## Quick Demo Path

```
┌─────────────────────────────────────────────────┐
│ 1. MERCHANT: Create Card                       │
│    Title: "Buy 5 Get 1 Free"                    │
│    Punches: 5                                   │
│    Min sats: 1000                               │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. MERCHANT: Start Demo Session                │
│    Click "Start demo session"                   │
│    Note: Demo Payments ON                       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 3. CUSTOMER: Join Session                      │
│    Scan QR or enter join code                   │
│    (Use phone camera for best effect)           │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 4. MERCHANT: New Purchase (×5)                  │
│    Click "New purchase" → QR appears            │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 5. CUSTOMER: Scan Purchase QR                  │
│    Click "Scan purchase QR"                     │
│    → Shows "Waiting for merchant..."            │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 6. MERCHANT: Mark Paid                         │
│    Click "Mark paid" button                     │
│    → Punch awarded! 🎉                          │
└─────────────────────────────────────────────────┘
                    ↓
        (Repeat steps 4-6 until 5 punches)
                    ↓
┌─────────────────────────────────────────────────┐
│ 7. CUSTOMER: Redeem Reward                     │
│    Click "Redeem reward" (green button)         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 8. MERCHANT: Confirm Redemption                │
│    Click "Confirm redemption"                   │
│    → Card resets to 0/5! ♻️                     │
└─────────────────────────────────────────────────┘
```

## One-Liners for Judges

**What is it?**
"Drop-in Bitcoin loyalty punch cards - merchants track rewards after payment, without touching invoices or custody."

**Why does it matter?**
"Gives Bitcoin merchants the same customer retention tools that Starbucks has, without compromising privacy."

**How is it different?**
"No accounts, no servers, no payment handling - just rewards tracking that works alongside any Bitcoin payment system."

**What's the tech?**
"Pure frontend - React, IndexedDB, BroadcastChannel. Plug in BTCPay/LNbits webhooks for production."

## Backup Plan (if QR fails)

1. Use your actual phone to scan QR codes from laptop screen
2. Open customer view on phone at `http://[your-laptop-ip]:5173/customer`
3. Find your IP: Mac → System Preferences → Network, or run `ipconfig getifaddr en0`

## Reset Everything

**Browser console:**
```javascript
localStorage.clear()
indexedDB.deleteDatabase('bunch-merchant-db')
location.reload()
```

## Pro Tips

✅ Practice the flow 2-3 times before judging
✅ Have phone ready as backup for QR scanning
✅ Keep this cheat sheet on second monitor
✅ Emphasize "Demo Payments ON" - no real Bitcoin needed
✅ Mention future: "social gifting via Nostr"
✅ Stay calm if something breaks - explain what *should* happen

## Red Flags to Avoid

❌ Don't say "it's like a blockchain" (it's not)
❌ Don't claim it handles payments (it doesn't)
❌ Don't promise features you haven't built
❌ Don't get lost in technical details unless asked

## Questions You Might Get

**Q: "How do you prevent fraud?"**
A: "Single-use nonces with 10-min expiry, merchant must confirm each punch, all tracked locally with integrity checks. In production, we'd verify against actual payment confirmations from BTCPay."

**Q: "Why not use a database/server?"**
A: "Hackathon constraint + merchant sovereignty. Everything in browser = zero deployment friction. But architecture supports backend if merchant wants."

**Q: "What if customer clears browser data?"**
A: "Punches are lost - that's the tradeoff for privacy. Future: optional Nostr backup or merchant-side verification."

**Q: "How does merchant prevent same customer from rejoining?"**
A: "Currently they don't - customer can join multiple times. Future: optional Nostr identity or merchant device fingerprinting."

**Q: "Real-world payment integration?"**
A: "Webhook from BTCPay on invoice.paid → call markPaid(nonce, customerId). Already architected in the code, just need to wire it up."

---

**You got this! 🚀**
