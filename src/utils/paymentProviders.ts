/**
 * Payment Provider Abstraction
 * 
 * This interface allows Bunch to support multiple payment providers
 * (BTCPay Server, LNbits, etc.) through a unified API.
 * 
 * All payment providers must follow the no-custody principle:
 * - Invoices are created in merchant's infrastructure
 * - Funds go directly to merchant's wallet
 * - Bunch only reads payment status (cannot move funds)
 */

export type InvoiceStatus = 'New' | 'Processing' | 'Expired' | 'Invalid' | 'Settled' | 'Paid'

export interface PaymentInvoice {
  id: string
  amount: string // Amount in sats (as string for precision)
  currency: string
  checkoutLink: string
  status: InvoiceStatus
  metadata: Record<string, string>
  createdAt: number
  expiresAt: number
}

export interface CreateInvoiceRequest {
  amount: number // in sats
  currency?: string // "BTC" or "SATS", defaults to "SATS"
  metadata?: Record<string, string>
  expirationMinutes?: number
}

export interface PaymentProviderConfig {
  provider: string // 'btcpay' | 'lnbits' | etc.
  [key: string]: unknown // Provider-specific config
}

/**
 * Payment Provider Interface
 * 
 * All payment providers must implement this interface.
 * This ensures consistent behavior across different payment systems.
 */
export interface PaymentProvider {
  /**
   * Provider identifier (e.g., 'btcpay', 'lnbits')
   */
  readonly id: string

  /**
   * Human-readable provider name
   */
  readonly name: string

  /**
   * Verify that the configuration is valid
   */
  verifyConfig(config: PaymentProviderConfig): Promise<boolean>

  /**
   * Create an invoice in the merchant's payment system
   * 
   * @param config Provider-specific configuration
   * @param request Invoice creation request
   * @returns Created invoice
   */
  createInvoice(
    config: PaymentProviderConfig,
    request: CreateInvoiceRequest
  ): Promise<PaymentInvoice>

  /**
   * Get invoice status from the merchant's payment system
   * 
   * @param config Provider-specific configuration
   * @param invoiceId Invoice ID to check
   * @returns Current invoice status
   */
  getInvoice(
    config: PaymentProviderConfig,
    invoiceId: string
  ): Promise<PaymentInvoice>
}

/**
 * Registry of available payment providers
 */
class PaymentProviderRegistry {
  private providers = new Map<string, PaymentProvider>()

  register(provider: PaymentProvider): void {
    this.providers.set(provider.id, provider)
  }

  get(id: string): PaymentProvider | undefined {
    return this.providers.get(id)
  }

  getAll(): PaymentProvider[] {
    return Array.from(this.providers.values())
  }

  has(id: string): boolean {
    return this.providers.has(id)
  }
}

export const paymentProviderRegistry = new PaymentProviderRegistry()

