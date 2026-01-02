# Bunch - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         BUNCH LOYALTY LAYER                      │
│                   (Tracks rewards after payment)                 │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Works alongside
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
         ┌──────────▼──────────┐    ┌──────────▼──────────┐
         │   Merchant's POS    │    │  Customer's Phone   │
         │  (Browser/Tablet)   │    │     (Browser)       │
         └─────────────────────┘    └─────────────────────┘
                    │                           │
                    │ Payment happens via:      │
                    │ BTCPay / LNbits / etc     │
                    │                           │
         ┌──────────▼────────────────────────────▼──────────┐
         │         Bitcoin Payment Infrastructure           │
         │  (Invoices, Lightning, On-chain, Wallets)        │
         └──────────────────────────────────────────────────┘
```

## Component Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         MERCHANT VIEW                          │
│                    (http://host/merchant)                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Card Creator │  │   Session    │  │   Purchase   │        │
│  │              │  │   Manager    │  │   Handler    │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                  │                  │                │
│         └──────────────────┼──────────────────┘                │
│                            │                                   │
│                   ┌────────▼────────┐                          │
│                   │ Merchant Store  │                          │
│                   │ (useMerchant    │                          │
│                   │  Store.ts)      │                          │
│                   └────────┬────────┘                          │
│                            │                                   │
│         ┌──────────────────┼──────────────────┐                │
│         │                  │                  │                │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐        │
│  │  IndexedDB   │  │ LocalStorage │  │ Broadcast    │        │
│  │              │  │              │  │ Channel      │        │
│  │ • Cards      │  │ • Snapshots  │  │              │        │
│  │ • Sessions   │  │ • Cache      │  │ M ←──────→ C │        │
│  │ • Nonces     │  │              │  │              │        │
│  │ • Ledger     │  │              │  │              │        │
│  │ • Requests   │  │              │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                        CUSTOMER VIEW                           │
│                    (http://host/customer)                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ QR Scanner   │  │   Progress   │  │  Redemption  │        │
│  │              │  │   Tracker    │  │   Handler    │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                  │                  │                │
│         └──────────────────┼──────────────────┘                │
│                            │                                   │
│                   ┌────────▼────────┐                          │
│                   │ Customer Store  │                          │
│                   │ (useCustomer    │                          │
│                   │  Store.ts)      │                          │
│                   └────────┬────────┘                          │
│                            │                                   │
│                   ┌────────▼────────┐                          │
│                   │  LocalStorage   │                          │
│                   │                 │                          │
│                   │ • Session State │                          │
│                   │ • Customer ID   │                          │
│                   │ • Punches       │                          │
│                   └─────────────────┘                          │
└────────────────────────────────────────────────────────────────┘
```

## Data Flow: Purchase & Punch Award

```
┌──────────────┐                                    ┌──────────────┐
│   MERCHANT   │                                    │   CUSTOMER   │
└──────┬───────┘                                    └──────┬───────┘
       │                                                   │
       │ 1. Generate Purchase Nonce                       │
       │    (unique ID + 10min expiry)                    │
       ├─────────────────────────────────────────────────►│
       │           QR Code (purchase-ticket)              │
       │                                                   │
       │                                    2. Scan QR    │
       │◄──────────────────────────────────────────────── │
       │      BroadcastChannel: purchase-claimed          │
       │                                                   │
       │ 3. Show in "Waiting for payment"                 │
       │    Customer sees "Waiting for merchant..."       │
       │                                                   │
       │                                                   │
       │ 4. Payment happens via BTCPay/LNbits             │
       │    (outside of Bunch - merchant confirms)        │
       │                                                   │
       │ 5. Mark Paid                                     │
       │    - Record in ledger                            │
       │    - Invalidate nonce                            │
       ├─────────────────────────────────────────────────►│
       │      BroadcastChannel: punch-awarded             │
       │                                                   │
       │                                    6. Update UI  │
       │                                       Progress++  │
       │                                       Toast!      │
```

## Data Flow: Reward Redemption

```
┌──────────────┐                                    ┌──────────────┐
│   MERCHANT   │                                    │   CUSTOMER   │
└──────┬───────┘                                    └──────┬───────┘
       │                                                   │
       │                                    1. Tap Redeem │
       │◄──────────────────────────────────────────────── │
       │      BroadcastChannel: redeem-request            │
       │                                                   │
       │ 2. Show in "Redemption Requests"                 │
       │                                                   │
       │ 3. Confirm Redemption                            │
       │    - Mark request as fulfilled                   │
       ├─────────────────────────────────────────────────►│
       │      BroadcastChannel: redemption-update         │
       │                                                   │
       │                                    4. Reset Card │
       │                                       Punches=0  │
       │                                       Toast!      │
```

## Data Models

### Loyalty Card
```typescript
{
  id: string              // nanoid
  title: string           // "Buy 5 Get 1 Free"
  punchesRequired: number // 5
  minSats: number         // 1000
  createdAt: number       // timestamp
  lastUpdatedAt: number   // timestamp
}
```

### Session
```typescript
{
  id: string         // nanoid
  cardId: string     // references card
  active: boolean    // true during session
  joinCode: string   // "XYZ4" - short code
  demoMode: boolean  // true = no real payments
  createdAt: number  // timestamp
}
```

### Purchase Nonce (Single-Use Token)
```typescript
{
  nonce: string       // nanoid (unique)
  sessionId: string   // current session
  cardId: string      // which card
  minSats: number     // minimum purchase
  createdAt: number   // when generated
  expiresAt: number   // now + 10 minutes
  claimedAt?: number  // when customer scanned
  redeemedAt?: number // when merchant marked paid
  customerId?: string // who scanned it
}
```

### Punch Ledger Entry
```typescript
{
  id: string          // nanoid
  sessionId: string   // session context
  cardId: string      // which card
  customerId: string  // who earned it
  purchaseNonce: string // which purchase
  awardedAt: number   // timestamp
}
```

### Customer Session State
```typescript
{
  sessionId: string       // merchant's session
  cardId: string          // card being tracked
  cardTitle: string       // display name
  punchesRequired: number // goal
  minSats: number         // per purchase
  customerId: string      // random ID
  punchesEarned: number   // current progress
  purchaseNonces: string[] // already scanned
  joinCode: string        // for rejoining
  demoMode: boolean       // payment mode
  lastUpdatedAt: number   // timestamp
}
```

## Storage Strategy

### Merchant Side (IndexedDB)
- **Why:** Persistent, structured data, supports queries
- **Stores:**
  - Loyalty cards (1 per device currently)
  - Sessions (current + historical)
  - Purchase nonces (with expiry)
  - Punch ledger (all awards)
  - Redemption requests (pending + fulfilled)

### Customer Side (LocalStorage)
- **Why:** Simple, fast, session-based
- **Stores:**
  - Current session state (or null if not joined)
  - Customer ID (random, generated once)
  - Session snapshot for rejoining

### Session Snapshots (LocalStorage - Both Sides)
- **Why:** QR code contains join snapshot
- **Format:**
  ```typescript
  {
    sessionId: string
    cardId: string
    cardTitle: string
    punchesRequired: number
    minSats: number
    demoMode: boolean
    joinCode: string
    issuedAt: number
  }
  ```

## Communication: BroadcastChannel

**Channel Names:**
- `bunch:merchant` - Merchant → Customer messages
- `bunch:customer` - Customer → Merchant messages

**Message Types:**

**Merchant → Customer:**
- `merchant:session-update` - Session/card changed
- `merchant:punch-awarded` - Punch confirmed
- `merchant:redemption-update` - Reward fulfilled
- `merchant:session-ended` - Session closed

**Customer → Merchant:**
- `customer:join-request` - New customer joined
- `customer:purchase-claimed` - Scanned purchase QR
- `customer:redeem-request` - Wants to redeem
- `customer:leave` - Left session

**Note:** BroadcastChannel only works **within same browser origin**. Cross-device communication happens via QR code scanning (customer scans merchant's QR, merchant confirms action).

## Production Integration Points

### Payment Flow Options

**Mode 1: Manual (Default, Always Available)**
- Merchant generates purchase QR → Customer scans → Merchant processes payment → Merchant marks paid in Bunch
- Works with any payment system (BTCPay, LNbits, custom)
- No configuration needed
- Merchant has full control

**Mode 2: Automated BTCPay Integration (Optional)**
- Merchant configures BTCPay Server (optional)
- Bunch can create invoices in merchant's BTCPay Server
- Bunch polls payment status and auto-awards punches
- **Important**: All funds go to merchant's BTCPay Server wallet (Bunch never has custody)

### 1. Payment Verification Hook (Optional BTCPay Integration)
```typescript
// When BTCPay is configured, Bunch can poll invoice status:
const verifyPayment = async (nonce: string) => {
  const invoice = await btcpay.getInvoice(nonce)
  if (invoice.status === 'paid') {
    await markPaid(nonce, invoice.buyerInfo)
  }
}
// Note: Invoice is in merchant's BTCPay Server, funds go to merchant's wallet
```

### 2. Webhook Listener (Future Enhancement)
```typescript
// BTCPay webhook endpoint (if you add backend):
app.post('/webhooks/btcpay', (req, res) => {
  const { invoiceId, status, metadata } = req.body
  if (status === 'paid') {
    const { purchaseNonce, customerId } = metadata
    // Notify merchant via WebSocket or Server-Sent Events
    merchantNotify({ type: 'payment-confirmed', nonce: purchaseNonce })
  }
})
// Note: Would require backend server (currently browser-only)
```

### 3. Nostr Integration (Future)
```typescript
// Gift reward to another npub
const giftReward = async (recipientNpub: string) => {
  const event = {
    kind: 30000, // Addressable event
    tags: [
      ['d', rewardId],
      ['p', recipientNpub],
      ['merchant', merchantNpub],
      ['card', cardTitle],
    ],
    content: JSON.stringify({ reward: 'free coffee' })
  }
  await nostr.publish(event)
}
```

## Security Considerations

### Implemented:
- ✅ Single-use nonces (can't reuse QR)
- ✅ 10-minute expiry on purchase QRs
- ✅ Merchant confirmation required for punches
- ✅ Session isolation (ledger cleared on end)
- ✅ **No custody**: Bunch never holds funds—all payments go to merchant's wallet
- ✅ **No payment processing**: Bunch doesn't process payments—merchants use their own infrastructure
- ✅ **Optional BTCPay integration**: When enabled, invoices created in merchant's BTCPay Server (merchant's infrastructure)
- ✅ **Read-only payment status**: Bunch only reads payment status (cannot move funds)

### Future Enhancements:
- [ ] Rate limiting on nonce generation
- [ ] Customer device fingerprinting (optional)
- [ ] Merchant-side backup/export for auditing
- [ ] Cryptographic signatures on QR payloads
- [ ] Nostr-based identity (optional)

## Scalability Notes

**Current Limitations:**
- Single loyalty card per merchant device
- All data client-side (browser storage limits)
- No merchant analytics dashboard
- No multi-location support

**Future Scaling:**
- Add backend for multi-device sync
- Support multiple cards per merchant
- Aggregate analytics across locations
- Export/import for device migration
- Optional Nostr relays for distributed state

---

**Built for hackathon demo, designed for production extension.**
