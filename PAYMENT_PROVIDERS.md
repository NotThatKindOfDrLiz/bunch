# Payment Provider Architecture

Bunch now uses an extensible payment provider architecture that makes it easy to add support for new payment systems (LNbits, Strike, etc.) without changing core logic.

## Architecture Overview

### Payment Provider Interface

All payment providers implement the `PaymentProvider` interface:

```typescript
interface PaymentProvider {
  id: string                    // 'btcpay' | 'lnbits' | etc.
  name: string                  // Human-readable name
  verifyConfig(config): Promise<boolean>
  createInvoice(config, request): Promise<PaymentInvoice>
  getInvoice(config, invoiceId): Promise<PaymentInvoice>
}
```

### Provider Registry

Providers are registered at app startup:

```typescript
import { paymentProviderRegistry } from './utils/paymentProviders'
import { btcpayProvider } from './utils/providers/btcpayProvider'

paymentProviderRegistry.register(btcpayProvider)
```

### Current Providers

- **BTCPay Server** (`btcpay`) - Self-hosted, no custody
  - Implementation: `src/utils/providers/btcpayProvider.ts`
  - Registered in `src/main.tsx`

- **LNbits** (`lnbits`) - Self-hosted Lightning wallet, no custody
  - Implementation: `src/utils/providers/lnbitsProvider.ts`
  - Registered in `src/main.tsx`
  - Requires: Server URL, API key (invoice/read key), optional wallet ID

### Adding a New Provider

To add a new provider (e.g., Strike, OpenNode):

1. **Create provider implementation** (`src/utils/providers/lnbitsProvider.ts`):
```typescript
import type { PaymentProvider, PaymentProviderConfig, PaymentInvoice } from '../paymentProviders'

export const lnbitsProvider: PaymentProvider = {
  id: 'lnbits',
  name: 'LNbits',
  
  async verifyConfig(config) {
    // Verify LNbits configuration
  },
  
  async createInvoice(config, request) {
    // Create LNbits invoice
  },
  
  async getInvoice(config, invoiceId) {
    // Get LNbits invoice status
  }
}
```

2. **Register provider** (`src/main.tsx`):
```typescript
import { lnbitsProvider } from './utils/providers/lnbitsProvider'
paymentProviderRegistry.register(lnbitsProvider)
```

3. **Done!** The merchant store will automatically support it.

## Data Model

### PurchaseNonce (Provider-Agnostic)

```typescript
interface PurchaseNonce {
  // ... existing fields ...
  
  // New provider-agnostic fields
  paymentProvider?: string        // 'btcpay' | 'lnbits' | etc.
  paymentInvoiceId?: string
  paymentCheckoutLink?: string
  paymentStatus?: InvoiceStatus
  
  // Legacy BTCPay fields (for backward compatibility)
  btcpayInvoiceId?: string        // @deprecated
  btcpayCheckoutLink?: string     // @deprecated
  btcpayStatus?: InvoiceStatus    // @deprecated
}
```

## Merchant Store API

### New Provider-Agnostic API

```typescript
const {
  paymentConfig,           // PaymentProviderConfig | null
  setPaymentConfig,        // (config) => Promise<void>
  verifyPaymentConnection, // () => Promise<boolean>
} = useMerchantStore()
```

### Legacy BTCPay API (Backward Compatible)

```typescript
const {
  btcpayConfig,           // BTCPayServerConfig | null (deprecated)
  setBTCPayConfig,       // (config) => Promise<void> (deprecated)
  verifyBTCPayConnection, // () => Promise<boolean> (deprecated)
} = useMerchantStore()
```

**Note:** Legacy API still works and is automatically synced with new API.

## How It Works

### Invoice Creation

1. Merchant generates purchase QR
2. If `paymentConfig` exists and demo mode is OFF:
   - Get provider from registry: `paymentProviderRegistry.get(config.provider)`
   - Call `provider.createInvoice(config, request)`
   - Store invoice data in provider-agnostic fields
   - Also store in legacy fields for backward compatibility

### Invoice Polling

1. Every 5 seconds (if payment provider configured):
   - Get provider from registry
   - For each pending purchase with invoice:
     - Call `provider.getInvoice(config, invoiceId)`
     - Update purchase with latest status
     - Auto-award punch if invoice is paid/settled

### Configuration Management

- Config stored in localStorage as `PaymentProviderConfig`
- Legacy BTCPay config also stored for backward compatibility
- Both configs are kept in sync

## Benefits

1. **Easy to extend**: Add new providers by implementing interface
2. **Backward compatible**: Existing BTCPay integration still works
3. **Provider-agnostic**: Core logic doesn't care which provider is used
4. **Type-safe**: Full TypeScript support
5. **No breaking changes**: Legacy API still works

## Future Providers

### LNbits (Recommended Next)

- Similar to BTCPay (self-hosted, no custody)
- Similar API pattern
- Popular in Bitcoin community

**Implementation estimate:** ~2-3 hours

### Strike API (If Requested)

- Custodial Lightning service
- Simple API
- Requires account

**Note:** Conflicts with "no custody" principle, but can be added if merchants request it.

### OpenNode (If Requested)

- Custodial Lightning/on-chain service
- Merchant-focused
- Requires account

**Note:** Also custodial, but can be added if needed.

## Migration Path

### For Existing Users

- No changes needed
- Legacy BTCPay API continues to work
- Config automatically migrates to new format

### For New Integrations

- Use new `paymentConfig` API
- Provider-agnostic fields in PurchaseNonce
- Can switch providers without code changes

## Code Organization

```
src/utils/
  ├── paymentProviders.ts          # Interface & registry
  ├── paymentConfig.ts             # Config management
  ├── providers/
  │   └── btcpayProvider.ts        # BTCPay implementation
  └── btcpay.ts                    # Legacy (deprecated, kept for compatibility)
```

## Testing

To test with a new provider:

1. Implement provider interface
2. Register in `main.tsx`
3. Configure in merchant UI
4. Generate purchase QR
5. Verify invoice creation and polling work

---

**Status:** ✅ Extensible architecture complete. Ready to add new providers when needed.

