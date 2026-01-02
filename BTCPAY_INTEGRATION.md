# BTCPay Server Integration Guide

This document explains how to integrate Bunch with your BTCPay Server instance.

## ⚠️ Important: This Integration is Optional

**BTCPay Server integration is completely optional.** Bunch works perfectly without it using manual mode (the default). This integration is a convenience feature that automates invoice creation and payment tracking, but:

- ✅ **Manual mode always works**—no BTCPay configuration needed
- ✅ **No custody**—all funds go to your BTCPay Server wallet (Bunch never touches them)
- ✅ **You control everything**—you own BTCPay Server, API keys, and all funds
- ✅ **Can be disabled anytime**—switch to Demo Mode or clear BTCPay config

## Overview

When BTCPay Server integration is enabled, Bunch can:

1. **Create invoices automatically** in your BTCPay Server when you generate a purchase QR (if Demo Mode is OFF)
2. **Track invoice status** by polling your BTCPay Server every 5 seconds
3. **Auto-award punches** when invoices are paid or settled
4. **Display invoice links** in the merchant interface for easy access

**Key Distinction:**
- Bunch creates invoices in **your BTCPay Server** (your infrastructure)
- All payments go to **your BTCPay Server wallet** (Bunch never has custody)
- Bunch only **reads payment status** (cannot move funds)
- You maintain **full control** (you own BTCPay Server and API keys)

## Setup Instructions

### 1. Get Your BTCPay Server Credentials

You'll need three pieces of information:

- **Server URL**: Your BTCPay Server instance URL (e.g., `https://btcpay.example.com`)
- **API Key**: Create one in BTCPay Server:
  1. Go to Settings → Manage Account → API Keys
  2. Click "Create a new API key"
  3. Give it a name (e.g., "Bunch Integration")
  4. Select permissions: `btcpay.store.canviewinvoices`, `btcpay.store.cancreateinvoice`
  5. Copy the API key (you won't see it again!)
- **Store ID**: Found in your store settings URL or store dashboard

### 2. Configure BTCPay in Bunch

1. Open the merchant view (`/merchant`)
2. Click the **"⚙️ Setup BTCPay"** button in the header
3. Enter your:
   - Server URL (without trailing slash)
   - API Key
   - Store ID
4. Click **"Verify Connection"** to test your credentials
5. Click **"Save Configuration"** when verified

### 3. Start a Session (Demo Mode OFF)

1. Create or select a loyalty card
2. Click **"Start demo session"** but toggle **Demo Mode to OFF**
3. When Demo Mode is OFF and BTCPay is configured, invoices will be created automatically

## How It Works

### Purchase Flow with BTCPay (Optional Automation)

1. **Merchant generates purchase QR**
   - Bunch creates a purchase nonce (unique ID)
   - If BTCPay is configured and Demo Mode is OFF, Bunch creates an invoice in **your BTCPay Server**
   - Invoice is created using **your API key** in **your BTCPay Server**
   - Invoice includes `purchaseNonce` in metadata for tracking
   - **All funds go to your BTCPay Server wallet** (Bunch never touches them)

2. **Customer scans QR**
   - Customer's device claims the nonce
   - Merchant sees "Waiting for payment" with invoice link

3. **Customer pays**
   - Customer pays via BTCPay invoice (Lightning or on-chain)
   - Payment goes directly to **your BTCPay Server wallet**
   - Bunch polls your BTCPay Server every 5 seconds to check status (read-only)

4. **Payment confirmed**
   - When invoice status becomes "Paid" or "Settled", Bunch automatically:
     - Verifies payment amount meets minimum sats requirement
     - Awards the punch to the customer
     - Updates both merchant and customer UIs in real-time

### Manual Mode (Default, Always Available)

**Without BTCPay integration**, the flow is:
1. Merchant generates purchase QR → Bunch creates nonce
2. Customer scans QR → Claims nonce
3. Merchant processes payment → Via any payment system (BTCPay, LNbits, etc.)
4. Merchant marks paid → Clicks "Mark paid" button in Bunch
5. Punch awarded → Customer sees update

**Manual mode works perfectly** and requires no configuration. BTCPay integration is purely optional automation.

### Manual Override (Even with BTCPay Enabled)

Even with BTCPay enabled, merchants can still manually mark purchases as paid using the **"Mark paid"** button. This is useful for:
- Testing
- Handling edge cases
- Offline payments
- When you want to verify payment before awarding punch

## UI Indicators

### Header Status
- **"BTCPay Connected"** badge appears when BTCPay is configured and Demo Mode is OFF
- **"⚙️ BTCPay"** button shows current configuration status

### Purchase List
- **"₿ Invoice"** badge indicates a BTCPay invoice was created
- **Status badges** show invoice status:
  - Green: Paid/Settled
  - Yellow: Processing/New
  - Red: Expired
- **"View Invoice →"** link opens the BTCPay checkout page
- **"Auto-tracking"** label indicates automatic payment tracking is active

### Purchase QR Modal
- Shows BTCPay invoice link if available
- Displays current invoice status

## Troubleshooting

### Invoice Not Created
- **Check**: Is Demo Mode OFF? (Invoices only created when Demo Mode is OFF)
- **Check**: Is BTCPay configured? (Click "⚙️ Setup BTCPay" to verify)
- **Check**: Browser console for API errors

### Payment Not Detected
- **Check**: Invoice status in BTCPay Server dashboard
- **Check**: Payment amount meets minimum sats requirement
- **Check**: Browser console for polling errors
- **Manual fix**: Use "Mark paid" button if needed

### Connection Verification Fails
- **Check**: Server URL is correct (no trailing slash)
- **Check**: API key has correct permissions
- **Check**: Store ID matches your BTCPay store
- **Check**: BTCPay Server is accessible from your browser
- **Check**: CORS settings if self-hosting BTCPay

## API Permissions Required

Your BTCPay API key needs these permissions:
- `btcpay.store.canviewinvoices` - To check invoice status
- `btcpay.store.cancreateinvoice` - To create invoices

## Security Notes

### Custody & Control
- **Bunch never has custody**—all funds go to your BTCPay Server wallet
- **You control everything**—you own BTCPay Server, API keys, and all funds
- **Bunch only reads payment status**—cannot move funds or access your wallet
- **Invoice creation uses your API key**—invoices are created in your BTCPay Server

### API Key Security
- **API keys are stored in browser localStorage** (not encrypted)
- **Only use API keys with minimal required permissions** (`canviewinvoices`, `cancreateinvoice`)
- **Don't share your merchant view URL** if BTCPay is configured
- **Consider using a separate API key** for Bunch integration (can be revoked independently)
- **Clear configuration** if device is shared or compromised
- **Revoke API key** in BTCPay Server if needed (Bunch will stop working, but funds are safe)

## Limitations

- **Polling-based**: Uses 5-second polling (not webhooks) since Bunch runs in the browser
- **Single device**: Configuration is per-browser/device
- **No webhook support**: Browser-only apps can't receive webhooks (would require backend)
- **CORS**: Self-hosted BTCPay instances may need CORS configuration

## Future Enhancements

Potential improvements:
- Webhook support (requires backend server)
- Multiple BTCPay store support
- Invoice amount customization per purchase
- Payment method selection (Lightning vs on-chain)
- Invoice expiration handling
- Payment failure notifications

## Example: Complete Flow

```
1. Merchant opens /merchant
2. Merchant clicks "⚙️ Setup BTCPay"
3. Enters: https://btcpay.example.com, api-key-xxx, store-abc123
4. Clicks "Verify Connection" → Success ✓
5. Clicks "Save Configuration"
6. Creates loyalty card: "Buy 5 Get 1 Free", min 1000 sats
7. Starts session with Demo Mode OFF
8. Clicks "Generate Purchase QR"
   → BTCPay invoice created automatically
   → Invoice ID stored with purchase nonce
9. Customer scans QR code
10. Customer pays via BTCPay invoice (Lightning)
11. Bunch polls every 5 seconds
12. Invoice status changes to "Paid"
13. Bunch automatically awards punch ✓
14. Customer sees progress update in real-time
```

## Support

For BTCPay Server issues:
- [BTCPay Server Documentation](https://docs.btcpayserver.org/)
- [BTCPay Server GitHub](https://github.com/btcpayserver/btcpayserver)
- [BTCPay Server Community](https://chat.btcpayserver.org/)

For Bunch integration issues:
- Check browser console for errors
- Verify API credentials
- Ensure Demo Mode is OFF when using BTCPay

