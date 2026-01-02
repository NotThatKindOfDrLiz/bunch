/**
 * LNbits Payment Provider Implementation
 * 
 * Documentation: https://docs.lnbits.org/
 * API Docs: Available in your LNbits instance under "API Docs"
 */

import type {
  PaymentProvider,
  PaymentProviderConfig,
  PaymentInvoice,
  CreateInvoiceRequest,
  InvoiceStatus,
} from '../paymentProviders'

export interface LNbitsConfig extends PaymentProviderConfig {
  provider: 'lnbits'
  serverUrl: string // e.g., "https://lnbits.example.com"
  apiKey: string // Admin or invoice key from LNbits wallet
  walletId?: string // Optional: specific wallet ID (if using admin key)
}

interface LNbitsInvoiceResponse {
  payment_hash: string
  payment_request: string
  checking_id: string
  lnurl_response?: string
  amount: number // in millisats
  fee: number
  memo?: string
  time: number
  bolt11?: string
  preimage?: string
  payment_status?: 'pending' | 'complete' | 'failed' | 'expired'
  expiry?: number
}

interface LNbitsPaymentResponse {
  checking_id: string
  pending: boolean
  amount: number // in millisats
  fee: number
  memo?: string
  time: number
  bolt11?: string
  preimage?: string
  payment_hash?: string
  expiry?: number
  extra?: Record<string, unknown>
  wallet_id?: string
  webhook?: string
  webhook_status?: number
}

function isLNbitsConfig(config: PaymentProviderConfig): config is LNbitsConfig {
  return config.provider === 'lnbits' && 'serverUrl' in config && 'apiKey' in config
}

function mapLNbitsStatusToInvoiceStatus(lnbitsStatus?: string): InvoiceStatus {
  switch (lnbitsStatus) {
    case 'complete':
      return 'Paid'
    case 'pending':
      return 'Processing'
    case 'failed':
    case 'expired':
      return 'Expired'
    default:
      return 'New'
  }
}

function mapLNbitsInvoiceToPaymentInvoice(
  lnbitsInvoice: LNbitsInvoiceResponse | LNbitsPaymentResponse
): PaymentInvoice {
  const amountInSats = Math.floor((lnbitsInvoice.amount || 0) / 1000)
  const expiry = lnbitsInvoice.expiry || 600 // Default 10 minutes
  const createdAt = lnbitsInvoice.time ? lnbitsInvoice.time * 1000 : Date.now()
  
  // LNbits uses payment_hash or checking_id as invoice ID
  const invoiceId = 'payment_hash' in lnbitsInvoice && lnbitsInvoice.payment_hash
    ? lnbitsInvoice.payment_hash 
    : lnbitsInvoice.checking_id

  // Payment request (bolt11) is the checkout link
  // LNbitsInvoiceResponse has payment_request, LNbitsPaymentResponse has bolt11
  const checkoutLink = ('payment_request' in lnbitsInvoice && lnbitsInvoice.payment_request)
    ? lnbitsInvoice.payment_request
    : (lnbitsInvoice.bolt11 || '')

  // Determine status based on response type
  let status: InvoiceStatus = 'New'
  if ('payment_status' in lnbitsInvoice && lnbitsInvoice.payment_status) {
    status = mapLNbitsStatusToInvoiceStatus(lnbitsInvoice.payment_status)
  } else if ('pending' in lnbitsInvoice) {
    status = lnbitsInvoice.pending ? 'Processing' : 'Paid'
  }

  return {
    id: invoiceId,
    amount: amountInSats.toString(),
    currency: 'SATS',
    checkoutLink,
    status,
    metadata: {},
    createdAt,
    expiresAt: createdAt + (expiry * 1000),
  }
}

export const lnbitsProvider: PaymentProvider = {
  id: 'lnbits',
  name: 'LNbits',

  async verifyConfig(config: PaymentProviderConfig): Promise<boolean> {
    if (!isLNbitsConfig(config)) return false

    try {
      // Try to get wallet info to verify API key
      // If walletId is provided, use it; otherwise try to get wallet list
      const url = config.walletId
        ? `${config.serverUrl}/api/v1/wallet/${config.walletId}`
        : `${config.serverUrl}/api/v1/wallet`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': config.apiKey,
        },
      })
      return response.ok
    } catch {
      return false
    }
  },

  async createInvoice(
    config: PaymentProviderConfig,
    request: CreateInvoiceRequest
  ): Promise<PaymentInvoice> {
    if (!isLNbitsConfig(config)) {
      throw new Error('Invalid LNbits configuration')
    }

    // LNbits uses millisats, so convert sats to millisats
    const amountInMillisats = request.amount * 1000

    // LNbits endpoint for creating invoices
    const url = `${config.serverUrl}/api/v1/payments`

    const body: Record<string, unknown> = {
      out: false, // Incoming payment
      amount: amountInMillisats,
      memo: request.metadata?.cardTitle || `Bunch loyalty - ${request.metadata?.purchaseNonce || ''}`,
      expiry: (request.expirationMinutes || 10) * 60, // LNbits uses seconds
      extra: request.metadata || {},
    }

    // Add wallet if walletId is provided (for admin keys)
    if (config.walletId) {
      body.wallet = config.walletId
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': config.apiKey,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`LNbits API error: ${response.status} ${errorText}`)
    }

    const lnbitsInvoice = (await response.json()) as LNbitsInvoiceResponse
    return mapLNbitsInvoiceToPaymentInvoice(lnbitsInvoice)
  },

  async getInvoice(
    config: PaymentProviderConfig,
    invoiceId: string
  ): Promise<PaymentInvoice> {
    if (!isLNbitsConfig(config)) {
      throw new Error('Invalid LNbits configuration')
    }

    // LNbits uses checking_id to check invoice status
    // The invoiceId should be the checking_id from the createInvoice response
    const url = `${config.serverUrl}/api/v1/payments/${invoiceId}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Api-Key': config.apiKey,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`LNbits API error: ${response.status} ${errorText}`)
    }

    const lnbitsPayment = (await response.json()) as LNbitsPaymentResponse
    
    return mapLNbitsInvoiceToPaymentInvoice(lnbitsPayment)
  },
}

