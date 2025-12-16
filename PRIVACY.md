# Bunch Privacy Model & Tradeoffs

## Privacy-Preserving Design

### What Bunch Does NOT Collect

❌ **No Personal Information**
- No email addresses
- No phone numbers  
- No names or identities
- No payment details (Bunch never touches invoices or funds)
- No location data
- No device fingerprints
- No analytics or tracking

❌ **No Server/Backend**
- Everything runs client-side in the browser
- No data sent to external servers
- No cloud storage or databases
- No third-party services

❌ **No Persistent Cross-Device Identity**
- Customer ID is generated locally per device
- No account system means no way to link devices
- Each device has its own random customer ID

### What Bunch DOES Store (Locally)

#### On Customer Device (LocalStorage)
- **Random Customer ID**: Generated once per device using `nanoid()` (e.g., `R9dHzfjEVTcIpE0gFGZ-o`)
  - Stored in browser localStorage
  - Never shared with merchant or any server
  - Different for each merchant session
- **Current Session State**: Only active session data
  - Session ID, card info, punch count
  - Cleared when customer leaves session
- **Session Snapshots**: For rejoining via QR code
  - Stored per join code
  - Contains only card metadata (title, punches required, etc.)
  - No personal data

#### On Merchant Device (IndexedDB)
- **Punch Ledger**: Records of punches awarded
  - Contains: `customerId` (random), `sessionId`, `cardId`, `purchaseNonce`, timestamp
  - **No personal information** - just anonymous IDs
- **Purchase Nonces**: Single-use tokens for purchases
  - Contains: `nonce`, `sessionId`, `customerId` (if claimed), expiry time
  - Expires after 10 minutes if unused
- **Redemption Requests**: When customers request rewards
  - Contains: `customerId` (random), `sessionId`, `cardId`, timestamp
  - Merchant sees anonymous ID, not identity

### Privacy Guarantees

1. **Merchant Cannot Identify Customers**
   - Merchant only sees random customer IDs (e.g., `R9dHzfjEVTcIpE0gFGZ-o`)
   - No way to link customer ID to real identity
   - No way to track customers across sessions (unless they reuse same device)

2. **No Cross-Merchant Tracking**
   - Each merchant session generates its own customer ID
   - No central database to link activity across merchants
   - Customer ID is merchant-specific and session-specific

3. **No Data Leaves Device**
   - All data stored locally in browser
   - BroadcastChannel only works within same browser origin (same device)
   - Cross-device communication via QR codes (one-time, ephemeral)

4. **Customer Controls Data**
   - Customer can clear browser data to reset everything
   - Customer can leave session to clear session data
   - No account means no data persistence beyond browser storage

5. **Payment Privacy Maintained**
   - Bunch never touches payment infrastructure
   - No access to invoices, addresses, or payment details
   - Works alongside payment system, doesn't intercept it

## Convenience Tradeoffs

### Privacy vs Convenience Spectrum

Bunch prioritizes **privacy over convenience**. Here are the tradeoffs:

#### ✅ Privacy Wins (What You Get)

1. **Complete Anonymity**
   - No account creation
   - No email/phone required
   - No personal data collection
   - Merchant can't identify you

2. **No Data Breaches**
   - Nothing stored on servers = nothing to breach
   - No central database = no single point of failure
   - Data only exists locally on your device

3. **No Tracking**
   - Can't be tracked across merchants
   - Can't be tracked across devices
   - Can't be profiled or targeted

4. **Merchant Sovereignty**
   - Merchant controls their own data
   - No third-party dependencies
   - No vendor lock-in

#### ❌ Convenience Losses (What You Give Up)

1. **No Cross-Device Sync**
   - **Tradeoff**: Can't access punches from different devices
   - **Why**: No cloud account to sync data
   - **Workaround**: Rejoin session via QR code (but lose punch history)

2. **Data Loss Risk**
   - **Tradeoff**: Clearing browser data = losing all punches
   - **Why**: Everything stored locally, no backup
   - **Mitigation**: Session snapshots allow rejoining (but punches reset)

3. **No Account Recovery**
   - **Tradeoff**: Can't recover lost customer ID or session
   - **Why**: No email/phone = no recovery mechanism
   - **Impact**: Must rejoin session and start over

4. **Limited Real-Time Updates**
   - **Tradeoff**: Cross-device updates require polling (2-second delay)
   - **Why**: BroadcastChannel only works same-device
   - **Impact**: Slight delay when merchant confirms punch on different device

5. **Manual QR Scanning**
   - **Tradeoff**: Must scan QR codes for each purchase
   - **Why**: No automatic linking to payment system
   - **Impact**: Extra step in checkout process

6. **No Historical Analytics**
   - **Tradeoff**: Merchant can't see customer lifetime value
   - **Why**: No persistent customer identity
   - **Impact**: Merchant can't optimize for repeat customers (by identity)

7. **Session-Based Only**
   - **Tradeoff**: Punches reset when session ends
   - **Why**: Privacy-first design means no persistent state
   - **Impact**: Long-term loyalty requires continuous sessions

### Comparison to Traditional Loyalty Programs

| Feature | Traditional Programs | Bunch |
|---------|-------------------|-------|
| **Account Required** | ✅ Yes (email/phone) | ❌ No |
| **Personal Data** | ✅ Collected | ❌ None |
| **Cross-Device Sync** | ✅ Yes | ❌ No |
| **Data Breach Risk** | ⚠️ High (centralized DB) | ✅ Low (local only) |
| **Tracking** | ✅ Extensive | ❌ None |
| **Merchant Control** | ⚠️ Shared with vendor | ✅ Full control |
| **Setup Complexity** | ⚠️ High (integration) | ✅ Low (QR codes) |
| **Privacy** | ❌ Low | ✅ High |

## Design Philosophy

Bunch follows a **"privacy by design"** approach:

1. **Minimal Data Collection**: Only collect what's absolutely necessary
2. **Local-First**: Store data where user has control (their device)
3. **No Central Authority**: No servers, no databases, no third parties
4. **Ephemeral Identity**: Random IDs that can't be linked to real people
5. **User Control**: Customer can clear data anytime

## When Privacy Matters Most

Bunch is ideal for:

- **Privacy-conscious customers** who don't want accounts
- **Merchants** who want to offer rewards without data collection
- **Bitcoin merchants** who value customer privacy
- **Temporary/pop-up shops** where accounts don't make sense
- **Demo/testing** scenarios where real accounts are overkill

## When Convenience Matters More

Consider traditional loyalty programs if:

- You need cross-device sync
- You want customer analytics
- You need account recovery
- You want automatic payment linking
- You need long-term customer tracking

## Conclusion

Bunch makes a **conscious tradeoff**: maximum privacy at the cost of some convenience. This aligns with Bitcoin's values of self-sovereignty and privacy, making it perfect for Bitcoin merchants who want to reward customers without compromising their privacy.

The system is designed so that:
- **Customers** get rewards without giving up personal data
- **Merchants** can offer loyalty programs without becoming data collectors
- **Both** benefit from a simple, privacy-preserving system

This is a feature, not a bug - privacy is the product.

