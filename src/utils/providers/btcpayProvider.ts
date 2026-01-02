/**
 * BTCPay Server Payment Provider Implementation
 * 
 * Documentation: https://docs.btcpayserver.org/API/Greenfield/v1/
 */

import type {
  PaymentProvider,
  PaymentProviderConfig,
  PaymentInvoice,
  CreateInvoiceRequest,
} from '../paymentProviders'

export interface BTCPayServerConfig extends PaymentProviderConfig {
  provider: 'btcpay'
  serverUrl: string // e.g., "https://btcpay.example.com"
  apiKey: string // API key from BTCPay Server
  storeId: string // Store ID from BTCPay Server
}

interface BTCPayInvoiceResponse {
  id: string
  storeId: string
  amount: string
  currency: string
  type: string
  checkoutLink: string
  status: 'New' | 'Processing' | 'Expired' | 'Invalid' | 'Settled' | 'Paid'
  metadata: Record<string, string>
  createdTime: number
  expirationTime: number
  monitoringExpiration: number
}

function isBTCPayConfig(config: PaymentProviderConfig): config is BTCPayServerConfig {
  return config.provider === 'btcpay' && 'serverUrl' in config && 'apiKey' in config && 'storeId' in config
}

function mapBTCPayInvoiceToPaymentInvoice(btcpayInvoice: BTCPayInvoiceResponse): PaymentInvoice {
  return {
    id: btcpayInvoice.id,
    amount: btcpayInvoice.amount,
    currency: btcpayInvoice.currency,
    checkoutLink: btcpayInvoice.checkoutLink,
    status: btcpayInvoice.status,
    metadata: btcpayInvoice.metadata,
    createdAt: btcpayInvoice.createdTime,
    expiresAt: btcpayInvoice.expirationTime,
  }
}

export const btcpayProvider: PaymentProvider = {
  id: 'btcpay',
  name: 'BTCPay Server',

  async verifyConfig(config: PaymentProviderConfig): Promise<boolean> {
    if (!isBTCPayConfig(config)) return false

    try {
      const url = `${config.serverUrl}/api/v1/stores/${config.storeId}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `token ${config.apiKey}`,
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
    if (!isBTCPayConfig(config)) {
      throw new Error('Invalid BTCPay Server configuration')
    }

    const url = `${config.serverUrl}/api/v1/stores/${config.storeId}/invoices`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${config.apiKey}`,
      },
      body: JSON.stringify({
        amount: request.amount.toString(),
        currency: request.currency || 'SATS',
        metadata: request.metadata || {},
        checkout: {
          expirationMinutes: request.expirationMinutes || 10,
          monitoringMinutes: request.expirationMinutes || 10,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`BTCPay Server API error: ${response.status} ${errorText}`)
    }

    const btcpayInvoice = (await response.json()) as BTCPayInvoiceResponse
    return mapBTCPayInvoiceToPaymentInvoice(btcpayInvoice)
  },

  async getInvoice(
    config: PaymentProviderConfig,
    invoiceId: string
  ): Promise<PaymentInvoice> {
    if (!isBTCPayConfig(config)) {
      throw new Error('Invalid BTCPay Server configuration')
    }

    const url = `${config.serverUrl}/api/v1/stores/${config.storeId}/invoices/${invoiceId}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `token ${config.apiKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`BTCPay Server API error: ${response.status} ${errorText}`)
    }

    const btcpayInvoice = (await response.json()) as BTCPayInvoiceResponse
    return mapBTCPayInvoiceToPaymentInvoice(btcpayInvoice)
  },
}

