# Bunch - Hackathon Demo Script

## Setup (Before Judges Arrive)

1. **Open two browser windows side-by-side:**
   - Left: `http://localhost:5173/merchant` (Merchant POS)
   - Right: `http://localhost:5173/customer` (Customer phone) - open in mobile responsive mode (F12 → toggle device toolbar)

2. **Clear any previous data** (if needed):
   - Clear browser storage/IndexedDB for fresh start
   - Or just refresh both pages

## Demo Flow (60-90 seconds)

### Part 1: Merchant Setup (15 seconds)

**Say:** "Bunch is a drop-in loyalty layer for Bitcoin merchants. Let me show you how it works."

1. **On Merchant screen:**
   - Click **"Create card"**
   - Title: `Buy 5 Get 1 Free`
   - Punches required: `5`
   - Min sats: `1000`
   - Click OK for all prompts

2. **Start session:**
   - Click **"Start demo session"** button
   - Note the toggle shows "Demo Payments: ON"

**Say:** "The merchant creates a punch card template and starts a session. Notice demo mode is ON - this means we simulate payments without touching real Bitcoin."

### Part 2: Customer Joins (10 seconds)

3. **On Customer screen:**
   - Click **"Scan join QR"** button
   - Instead of scanning, look at the merchant screen and note the join code (e.g., "XYZ4")
   - Cancel the scanner modal
   - Click **"Scan join QR"** again and paste the join code if there's an input option
   
**OR use the easier method:**
   - On the merchant screen, right-click the QR code and copy image
   - On customer screen, use browser dev tools to scan it

**EASIEST METHOD (recommended):**
   - Have your phone ready with a QR scanner app
   - Scan the join QR from the merchant screen with your real phone
   - Open the customer URL on your phone instead

**Say:** "The customer scans the merchant's join QR code. No account creation, no email, no phone number needed."

### Part 3: Make Purchases (30 seconds)

4. **On Merchant screen:**
   - Click **"New purchase"** button
   - A purchase QR appears in a modal

5. **On Customer screen:**
   - Click **"Scan purchase QR"**
   - (Ideally scan the QR from merchant screen)
   - Customer sees "Waiting for merchant..."

6. **On Merchant screen:**
   - See the pending purchase appear in the "Waiting for payment" section
   - Click **"Mark paid"**

**Say:** "In production, the customer would pay via Lightning or on-chain. Bunch watches for payment confirmation, then awards the punch. We're simulating that with the 'Mark paid' button."

7. **Watch both screens:**
   - Customer screen shows punch progress bar increase: "1 / 5 punches"
   - Toast notification: "Punch added!"

8. **Repeat 4-5 more times** (rapid-fire):
   - Merchant: New purchase → Mark paid
   - Merchant: New purchase → Mark paid
   - Merchant: New purchase → Mark paid
   - Merchant: New purchase → Mark paid
   - (You can skip the customer scanning step and just mark paid immediately to speed this up)

**Say:** "I'll quickly simulate a few more purchases to reach the goal..."

### Part 4: Redeem Reward (15 seconds)

9. **On Customer screen (after 5 punches):**
   - Progress bar is full: "5 / 5 punches"
   - Click **"Redeem reward"** button (now green/enabled)
   - Toast: "Requested reward"

10. **On Merchant screen:**
    - See redemption request appear in "Redemption requests" panel
    - Click **"Confirm redemption"**

11. **On Customer screen:**
    - Toast: "Reward fulfilled"
    - Progress resets to "0 / 5 punches"

**Say:** "The customer redeems their reward. The merchant confirms, and the punch card resets. The customer can keep earning on the same card."

### Part 5: Wrap-up (10 seconds)

**Say:** "Let me highlight the key points:"

- **Point to merchant screen:** "No invoice creation, no wallet custody - Bunch sits alongside your existing Bitcoin payment stack"
- **Point to customer screen:** "No accounts, no phone numbers, all data stored locally in the browser"
- **Point to 'Demo Payments: ON':** "This demo mode makes it judge-friendly, but the architecture maps directly to real Lightning payments via BTCPay or LNbits"
- **Optional - click "End session"** to show cleanup

## Key Talking Points

### For Technical Judges:
- "IndexedDB for persistence, BroadcastChannel for real-time sync between merchant/customer tabs"
- "Single-use nonces with 10-minute expiry prevent double-redemption"
- "Strict client-side integrity checks - no backend server needed"
- "Ready to plug in real payment verification via webhooks or websockets"

### For Business Judges:
- "Zero friction for customers - scan QR, start earning, no app download"
- "Merchant controls everything - their payment system, their rules"
- "Enables social gifting potential via Nostr (future roadmap)"
- "Built for coffee shops, food trucks, any Bitcoin-accepting merchant"

### For Non-Technical Judges:
- "Like a digital punch card, but for Bitcoin payments"
- "Customer gets rewarded for repeat visits without giving up privacy"
- "Merchant keeps customers coming back with loyalty rewards"

## Troubleshooting

### If QR scanning doesn't work:
- Use your real phone to scan the merchant's QR codes
- Or manually copy/paste the join code between screens
- Or open two separate browser profiles/windows with localStorage isolated

### If BroadcastChannel doesn't sync:
- Make sure both tabs are in the SAME browser window/profile
- Try opening both in incognito mode together
- Fallback: manually demonstrate the flow by explaining "this would sync in real-time"

### If you need to reset:
```
// In browser console on both tabs:
localStorage.clear()
indexedDB.deleteDatabase('bunch-merchant-db')
location.reload()
```

## Bonus Points

### Show the code (if time permits):
- Open `src/state/useMerchantStore.ts` and highlight the `markPaid` function
- Show how easy it would be to replace the demo mode with a real payment webhook

### Mention future roadmap:
- "Social gifting - customer can gift their free coffee to a friend via Nostr"
- "Multi-location support for merchant chains"
- "Export/import for merchant analytics"

## Time Variants

### 30-second elevator pitch:
- Create card → Start session → Customer joins → Make 1 purchase → Show punch awarded → Done

### 60-second demo:
- Full flow above (abbreviated purchases)

### 2-minute deep dive:
- Full flow + show demo mode toggle + explain architecture + Q&A

---

**Good luck! 🚀**
