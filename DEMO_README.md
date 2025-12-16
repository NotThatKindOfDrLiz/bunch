# 🎯 Bunch - Hackathon Demo Guide

## Quick Start

### 1. Install Missing Dependency & Start Server

```bash
cd /Users/lizsw/bunch
pnpm install  # This will install @vitejs/plugin-react
pnpm dev
```

### 2. Open Demo Pages

- **Merchant View:** `http://localhost:5173/merchant`
- **Customer View:** `http://localhost:5173/customer`

### 3. Choose Your Demo Style

**Option A - Phone + Laptop (Most Impressive):**
1. Merchant view on laptop
2. Customer view on phone: `http://[YOUR_IP]:5173/customer`
3. Scan QR codes with phone camera
4. Shows real cross-device sync

**Option B - Split Screen (Easiest):**
1. Merchant view on left half of screen
2. Customer view on right (mobile responsive mode: F12 → toggle device toolbar)
3. Manual QR workarounds

**Option C - Print QR Codes (Backup):**
1. Screenshot merchant QR codes
2. Use any QR scanner app to decode
3. Manually paste data if scanning fails

---

## 📋 Demo Documents Created

| File | Purpose |
|------|---------|
| `DEMO_SCRIPT.md` | **Full 60-90 second demo script** with talking points |
| `DEMO_CHEATSHEET.md` | **Quick reference card** - print or keep on second monitor |
| `DEMO_SETUP.md` | **Technical setup** for phone access & troubleshooting |
| `JUDGE_HANDOUT.md` | **One-pager** to give judges - explains concept & tech |

---

## 🎬 60-Second Demo Flow

```
1. CREATE CARD (15s)
   Merchant → Create card → "Buy 5 Get 1 Free" → 5 punches → 1000 sats min

2. START SESSION (5s)
   Merchant → Start demo session → Demo Payments: ON

3. CUSTOMER JOINS (10s)
   Customer → Scan join QR → Joined!

4. MAKE PURCHASES (30s)
   → Merchant: New purchase
   → Customer: Scan purchase QR
   → Merchant: Mark paid
   → Customer: Punch added! (1/5)
   (Repeat 4 more times quickly)

5. REDEEM REWARD (10s)
   → Customer: Redeem reward (now green)
   → Merchant: Confirm redemption
   → Customer: Progress resets to 0/5!
```

---

## 💡 Key Talking Points

**One-liner:**  
"Bunch is a drop-in Bitcoin loyalty layer that tracks rewards after payment, without touching invoices or custody."

**Technical judges:**  
"Pure frontend - React, IndexedDB, BroadcastChannel. No backend. Ready to plug in BTCPay webhooks for production."

**Business judges:**  
"Zero friction for customers - no accounts, no emails. Merchant keeps customers coming back without privacy invasion."

**Non-technical judges:**  
"Like a digital punch card for Bitcoin payments. Customer gets rewarded for repeat visits without giving up their info."

---

## 🔧 Troubleshooting

### QR Scanning Doesn't Work
- Use your real phone to scan from laptop screen
- Make screen brighter
- Zoom in on QR code
- Fallback: manually type join code

### Phone Can't Connect
1. Check: Same WiFi network?
2. Check: Firewall disabled?
3. Try: `ipconfig getifaddr en0` or `en1` for correct IP
4. Fallback: Use split-screen on laptop

### Need to Reset
```javascript
// In browser console (both merchant AND customer):
localStorage.clear()
indexedDB.deleteDatabase('bunch-merchant-db')
location.reload()
```

---

## ✅ Pre-Demo Checklist

- [ ] `pnpm install` completed
- [ ] `pnpm dev` running successfully
- [ ] Merchant view loaded: `http://localhost:5173/merchant`
- [ ] Customer view ready (phone or browser tab)
- [ ] Phone + laptop on same WiFi (if using phone)
- [ ] Practiced demo flow at least once
- [ ] DEMO_CHEATSHEET.md open on second monitor
- [ ] JUDGE_HANDOUT.md printed or ready to share
- [ ] Browser zoom at 125-150% for visibility
- [ ] Closed unnecessary tabs/apps

---

## 📱 Getting IP for Phone Access

**Mac (Ethernet):**
```bash
ipconfig getifaddr en0
```

**Mac (WiFi):**
```bash
ipconfig getifaddr en1
```

**Then use:**
```
http://[YOUR_IP]:5173/customer
```

**Example:**
```
http://192.168.1.100:5173/customer
```

---

## 🎯 Success Criteria

You'll know the demo is working when:

1. ✅ Merchant can create card
2. ✅ Session starts with join QR visible
3. ✅ Customer can join (screen shows card title + progress)
4. ✅ Purchase QR generates on merchant side
5. ✅ Customer scans purchase → sees "Waiting for merchant..."
6. ✅ Merchant marks paid → customer sees punch increase
7. ✅ After 5 punches, "Redeem reward" turns green
8. ✅ Merchant confirms redemption → customer resets to 0/5

---

## 🚀 Demo Tips

**DO:**
- ✅ Emphasize "Demo Payments ON" - no real Bitcoin needed
- ✅ Highlight privacy (no accounts, emails, phones)
- ✅ Mention merchant sovereignty (they control everything)
- ✅ Show enthusiasm - this solves a real problem!
- ✅ Have backup plans ready

**DON'T:**
- ❌ Claim it handles payments (it doesn't)
- ❌ Promise unbuilt features as current
- ❌ Get lost in technical details unless asked
- ❌ Panic if something breaks - explain expected behavior

---

## 📞 Common Judge Questions

**Q: How do you prevent fraud?**  
A: Single-use nonces with 10-min expiry, merchant confirms each punch. In production, we'd verify against actual payment confirmations from BTCPay.

**Q: What if customer clears browser data?**  
A: Punches are lost - that's the privacy tradeoff. Future: optional Nostr backup.

**Q: Real payment integration?**  
A: Webhook from BTCPay on invoice.paid → call markPaid(). Already architected, just needs wiring.

**Q: Why no backend?**  
A: Merchant sovereignty + zero deployment friction. But architecture supports backend if needed.

---

## 🎉 After the Demo

**If they want to try it:**
- Let them create their own card
- Guide them through one purchase cycle
- Show them the code if interested

**If they have questions:**
- Reference JUDGE_HANDOUT.md
- Offer to walk through technical details
- Mention GitHub repo (if public)

**If they want more info:**
- Share contact info
- Mention roadmap (social gifting via Nostr)
- Explain production path (BTCPay integration)

---

## 📄 Documents Summary

1. **DEMO_SCRIPT.md** - Your detailed walkthrough
2. **DEMO_CHEATSHEET.md** - Quick reference for presenting
3. **DEMO_SETUP.md** - Technical setup & troubleshooting
4. **JUDGE_HANDOUT.md** - Leave-behind for judges
5. **README.md** - Project overview (existing)

---

**Good luck! You've got a solid project. Just practice the flow 2-3 times and you'll crush it! 🚀**

_Remember: Judges want to see it work and understand the value. Keep it simple, show the magic, explain the impact._
