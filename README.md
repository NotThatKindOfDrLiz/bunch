# Bunch – Bitcoin Loyalty Punch Cards

Bunch is a drop-in loyalty layer for Bitcoin-accepting merchants. It tracks punches locally alongside existing payment flows, without touching invoices or custody. Made for the btc++ Taipei hackathon.

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

## Integration with Bitcoin POS Systems

Bunch is designed to work alongside existing Bitcoin payment infrastructure like **BTCPay Server**, **LNbits**, or any Lightning/Bitcoin payment system. Bunch never creates invoices or handles payments—it only tracks loyalty rewards after payment confirmation.

### How It Works

1. **Merchant generates purchase QR** → Bunch creates a unique purchase nonce (single-use, 10-minute expiry)
2. **Customer scans QR** → Customer's device claims the nonce and waits for confirmation
3. **Payment happens** → Merchant processes payment via their existing POS system (BTCPay, LNbits, etc.)
4. **Merchant confirms payment** → Merchant marks the purchase as paid in Bunch, awarding the punch
5. **Customer sees update** → Real-time sync updates customer's progress

### Integration Approaches

#### Option 1: Webhook Integration (Recommended for Production)

When a payment is confirmed in BTCPay Server or LNbits, send a webhook to your backend that notifies Bunch:

```typescript
// Backend webhook handler (Node.js example)
app.post('/webhooks/btcpay', async (req, res) => {
  const { invoiceId, status, metadata } = req.body
  
  if (status === 'paid' && metadata.purchaseNonce) {
    // Notify merchant's Bunch instance via WebSocket or Server-Sent Events
    notifyMerchant({
      type: 'payment-confirmed',
      purchaseNonce: metadata.purchaseNonce,
      invoiceId,
      amount: req.body.amount
    })
  }
  
  res.status(200).send('OK')
})
```

**BTCPay Server Setup:**
1. Create invoice with metadata: `{ purchaseNonce: "abc123..." }`
2. Configure webhook URL in BTCPay Server settings
3. Webhook fires on `invoice.paid` event
4. Backend forwards confirmation to merchant's Bunch instance

**LNbits Setup:**
1. Create payment request with metadata: `{ purchaseNonce: "abc123..." }`
2. Configure webhook in LNbits extension settings
3. Webhook fires on payment success
4. Backend forwards confirmation to merchant's Bunch instance

#### Option 2: Direct API Polling (Simple, Less Efficient)

Merchant's Bunch instance polls payment system API to check invoice status:

```typescript
// In merchant store (useMerchantStore.ts)
const checkPaymentStatus = async (purchaseNonce: string) => {
  // Get invoice ID from purchase nonce metadata
  const invoiceId = await getInvoiceIdForNonce(purchaseNonce)
  
  // Poll BTCPay Server API
  const invoice = await fetch(`https://your-btcpay-server.com/api/invoices/${invoiceId}`, {
    headers: { 'Authorization': `token ${BTCPAY_API_KEY}` }
  }).then(r => r.json())
  
  if (invoice.status === 'paid') {
    await markPaid(purchaseNonce, { amount: invoice.amount })
  }
}
```

#### Option 3: Manual Confirmation (Current Demo Mode)

Merchant manually confirms payment after verifying in their POS system. This is what demo mode uses, and works perfectly for small merchants who want to verify each payment manually.

### Implementation Checklist

- [ ] **Invoice Creation**: Include `purchaseNonce` in invoice metadata when creating payment
- [ ] **Webhook Endpoint**: Set up webhook receiver (or use polling)
- [ ] **Payment Verification**: Verify payment amount meets card's `minSats` requirement
- [ ] **Nonce Matching**: Match webhook's `purchaseNonce` to pending purchase in Bunch
- [ ] **Error Handling**: Handle expired nonces, duplicate payments, and failed verifications
- [ ] **UI Updates**: Ensure merchant and customer UIs update in real-time on confirmation

### Example: BTCPay Server Integration

```typescript
// 1. Create invoice with purchase nonce in metadata
const invoice = await btcpay.createInvoice({
  amount: 10000, // sats
  currency: 'BTC',
  metadata: {
    purchaseNonce: purchase.nonce,
    cardId: card.id,
    sessionId: session.id
  }
})

// 2. Webhook receives payment confirmation
btcpay.on('invoice.paid', async (invoice) => {
  const { purchaseNonce } = invoice.metadata
  
  // 3. Verify and award punch
  if (await verifyPurchaseNonce(purchaseNonce)) {
    await merchantStore.markPaid(purchaseNonce, {
      amount: invoice.amount,
      invoiceId: invoice.id
    })
  }
})
```

### Security Considerations

- **Nonce Expiry**: Purchase nonces expire after 10 minutes to prevent replay attacks
- **Single-Use**: Each nonce can only be claimed once
- **Amount Verification**: Always verify payment amount meets `minSats` requirement
- **Merchant Confirmation**: Merchant must explicitly confirm payment (prevents auto-awarding on wrong invoices)
- **Session Isolation**: Purchases are tied to specific sessions, preventing cross-session fraud

### Why This Design?

Bunch intentionally **does not** create invoices or handle payments because:
- Merchants already have payment infrastructure they trust
- Reduces attack surface (no payment handling = less risk)
- Works with any Bitcoin payment system (BTCPay, LNbits, custom solutions)
- Merchant maintains full control over payment flow
- Bunch focuses solely on loyalty tracking, not payment processing

## Roadmap

### Social gifting via Nostr (future work only)
- Allow customers to _gift_ a completed reward (e.g. free coffee) to another `npub`
- Merchant redeems one free item as usual, but the reward can be claimed by someone else
- Enables social discovery moments like "Coffee Bunch / Brunch Bunch"
- Opt-in, post-reward sharing only—no Nostr posts in the core MVP

### Additional ideas
- Optional WebRTC transport fallback if BroadcastChannel unsupported
- Export/import punch history snapshot for migrating kiosks
- Merchant analytics overlay (most popular rewards, streaks)
- Production-ready webhook handlers for BTCPay Server and LNbits

## Explicit non-goals

- No user accounts or login
- No email / phone collection
- No Stripe or fiat rails
- No invoice creation or wallet custody
- No Nostr publishing in the MVP
- No backend servers—everything runs in the browser
