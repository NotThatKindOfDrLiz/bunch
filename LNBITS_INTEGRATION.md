# LNbits Integration Guide

This document explains how to integrate Bunch with your LNbits instance.

## ⚠️ Important: This Integration is Optional

**LNbits integration is completely optional.** Bunch works perfectly without it using manual mode (the default). This integration is a convenience feature that automates invoice creation and payment tracking, but:

- ✅ **Manual mode always works**—no LNbits configuration needed
- ✅ **No custody**—all funds go to your LNbits wallet (Bunch never touches them)
- ✅ **You control everything**—you own LNbits instance, API keys, and all funds
- ✅ **Can be disabled anytime**—clear payment provider config to use manual mode

## Overview

When LNbits integration is enabled, Bunch can:

1. **Create invoices automatically** in your LNbits wallet when you generate a purchase QR (if Demo Mode is OFF)
2. **Track invoice status** by polling your LNbits instance every 5 seconds
3. **Auto-award punches** when invoices are paid
4. **Display invoice links** in the merchant interface for easy access

**Key Distinction:**
- Bunch creates invoices in **your LNbits instance** (your infrastructure)
- All payments go to **your LNbits wallet** (Bunch never has custody)
- Bunch only **reads payment status** (cannot move funds)
- You maintain **full control** (you own LNbits instance and API keys)

## Setup Instructions

### 1. Get Your LNbits Credentials

You'll need:

- **Server URL**: Your LNbits instance URL (e.g., `https://lnbits.example.com`)
- **API Key**: Invoice/read key from your LNbits wallet:
  1. Open your LNbits wallet
  2. Go to "Node URL, API Keys, and API Docs"
  3. Copy the "Invoice/read key" (or use admin key if you have wallet ID)
- **Wallet ID** (Optional): Specific wallet ID if using admin key instead of invoice key

### 2. Configure LNbits in Bunch

1. Open the merchant view (`/merchant`)
2. Click the **"⚙️ Setup Payment"** button in the header
3. Select **"LNbits"** from the provider dropdown
4. Enter your:
   - Server URL (without trailing slash)
   - API Key (invoice/read key)
   - Wallet ID (optional, only if using admin key)
5. Click **"Verify Connection"** to test your credentials
6. Click **"Save Configuration"** when verified

### 3. Start a Session (Demo Mode OFF)

1. Create or select a loyalty card
2. Click **"Start session"** (toggle Demo Mode to OFF)
3. When Demo Mode is OFF and LNbits is configured, invoices will be created automatically

## How It Works

### Purchase Flow with LNbits (Optional Automation)

1. **Merchant generates purchase QR**
   - Bunch creates a purchase nonce (unique ID)
   - If LNbits is configured and Demo Mode is OFF, Bunch creates an invoice in **your LNbits wallet**
   - Invoice is created using **your API key** in **your LNbits instance**
   - Invoice includes `purchaseNonce` in metadata for tracking
   - **All funds go to your LNbits wallet** (Bunch never touches them)

2. **Customer scans QR**
   - Customer's device claims the nonce
   - Merchant sees "Waiting for payment" with invoice link

3. **Customer pays**
   - Customer pays via Lightning invoice (bolt11)
   - Payment goes directly to **your LNbits wallet**
   - Bunch polls your LNbits instance every 5 seconds to check status (read-only)

4. **Payment confirmed**
   - When invoice status becomes "Paid", Bunch automatically:
     - Verifies payment amount meets minimum sats requirement
     - Awards the punch to the customer
     - Updates both merchant and customer UIs in real-time

### Manual Mode (Default, Always Available)

**Without LNbits integration**, the flow is:
1. Merchant generates purchase QR → Bunch creates nonce
2. Customer scans QR → Claims nonce
3. Merchant processes payment → Via any payment system (LNbits, BTCPay, etc.)
4. Merchant marks paid → Clicks "Mark paid" button in Bunch
5. Punch awarded → Customer sees update

**Manual mode works perfectly** and requires no configuration. LNbits integration is purely optional automation.

### Manual Override (Even with LNbits Enabled)

Even with LNbits enabled, merchants can still manually mark purchases as paid using the **"Mark paid"** button. This is useful for:
- Testing
- Handling edge cases
- Offline payments
- When you want to verify payment before awarding punch

## UI Indicators

### Header Status
- **"LNbits Connected"** badge appears when LNbits is configured and Demo Mode is OFF
- **"⚙️ LNbits"** button shows current configuration status

### Purchase List
- **"₿ Invoice"** badge indicates an invoice was created
- **Status badges** show invoice status:
  - Green: Paid/Settled
  - Yellow: Processing/New
  - Red: Expired
- **"View Invoice →"** link opens the Lightning invoice (bolt11)
- **"Auto-tracking"** label indicates automatic payment tracking is active

### Purchase QR Modal
- Shows LNbits invoice link if available
- Displays current invoice status

## Troubleshooting

### Invoice Not Created
- **Check**: Is Demo Mode OFF? (Invoices only created when Demo Mode is OFF)
- **Check**: Is LNbits configured? (Click "⚙️ Setup Payment" to verify)
- **Check**: Browser console for API errors
- **Check**: API key has correct permissions (invoice/read key)

### Payment Not Detected
- **Check**: Invoice status in LNbits dashboard
- **Check**: Payment amount meets minimum sats requirement
- **Check**: Browser console for polling errors
- **Manual fix**: Use "Mark paid" button if needed

### Connection Verification Fails
- **Check**: Server URL is correct (no trailing slash)
- **Check**: API key is valid (invoice/read key or admin key)
- **Check**: Wallet ID matches (if using admin key)
- **Check**: LNbits instance is accessible from your browser
- **Check**: CORS settings if self-hosting LNbits

## API Key Types

LNbits supports two types of API keys:

1. **Invoice/Read Key** (Recommended)
   - Can create invoices and read payment status
   - Works without wallet ID
   - Limited permissions (safer)

2. **Admin Key** (Advanced)
   - Full wallet access
   - Requires wallet ID to be specified
   - More powerful but less secure

**Recommendation**: Use invoice/read key for Bunch integration.

## Security Notes

### Custody & Control
- **Bunch never has custody**—all funds go to your LNbits wallet
- **You control everything**—you own LNbits instance, API keys, and all funds
- **Bunch only reads payment status**—cannot move funds or access your wallet
- **Invoice creation uses your API key**—invoices are created in your LNbits instance

### API Key Security
- **API keys are stored in browser localStorage** (not encrypted)
- **Only use invoice/read keys** (not admin keys) if possible
- **Don't share your merchant view URL** if LNbits is configured
- **Consider using a separate wallet** for Bunch integration
- **Clear configuration** if device is shared or compromised
- **Revoke API key** in LNbits if needed (Bunch will stop working, but funds are safe)

## Limitations

- **Polling-based**: Uses 5-second polling (not webhooks) since Bunch runs in the browser
- **Single device**: Configuration is per-browser/device
- **No webhook support**: Browser-only apps can't receive webhooks (would require backend)
- **CORS**: Self-hosted LNbits instances may need CORS configuration
- **Lightning only**: LNbits invoices are Lightning Network only (no on-chain)

## Example: Complete Flow

```
1. Merchant opens /merchant
2. Merchant clicks "⚙️ Setup Payment"
3. Selects "LNbits" from dropdown
4. Enters: https://lnbits.example.com, invoice-key-xxx, wallet-abc123 (optional)
5. Clicks "Verify Connection" → Success ✓
6. Clicks "Save Configuration"
7. Creates loyalty card: "Buy 5 Get 1 Free", min 1000 sats
8. Starts session with Demo Mode OFF
9. Clicks "Generate Purchase QR"
   → LNbits invoice created automatically
   → Invoice ID (checking_id) stored with purchase nonce
10. Customer scans QR code
11. Customer pays via Lightning invoice
12. Bunch polls every 5 seconds
13. Invoice status changes to "Paid"
14. Bunch automatically awards punch ✓
15. Customer sees progress update in real-time
```

## Support

For LNbits issues:
- [LNbits Documentation](https://docs.lnbits.org/)
- [LNbits GitHub](https://github.com/lnbits/lnbits)
- [LNbits Community](https://t.me/lnbits)

For Bunch integration issues:
- Check browser console for errors
- Verify API credentials
- Ensure Demo Mode is OFF when using LNbits
- Check LNbits instance logs

