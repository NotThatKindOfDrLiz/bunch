/**
 * BTCPay Server API client utilities
 * 
 * Documentation: https://docs.btcpayserver.org/API/Greenfield/v1/
 * 
 * @deprecated Use the payment provider abstraction (paymentProviders.ts) instead.
 * This file is kept for backward compatibility and will be removed in a future version.
 */

export interface BTCPayServerConfig {
  serverUrl: string // e.g., "https://btcpay.example.com"
  apiKey: string // API key from BTCPay Server
  storeId: string // Store ID from BTCPay Server
}

export interface BTCPayInvoice {
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

export interface CreateInvoiceRequest {
  amount: number // in sats
  currency: string // "BTC" or "SATS"
  metadata?: Record<string, string>
  checkout?: {
    expirationMinutes?: number
    monitoringMinutes?: number
    redirectURL?: string
  }
}

/**
 * Create a BTCPay Server invoice
 */
export async function createBTCPayInvoice(
  config: BTCPayServerConfig,
  request: CreateInvoiceRequest
): Promise<BTCPayInvoice> {
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
        expirationMinutes: request.checkout?.expirationMinutes || 10,
        monitoringMinutes: request.checkout?.monitoringMinutes || 10,
        ...request.checkout,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`BTCPay Server API error: ${response.status} ${errorText}`)
  }

  return response.json()
}

/**
 * Get invoice status from BTCPay Server
 */
export async function getBTCPayInvoice(
  config: BTCPayServerConfig,
  invoiceId: string
): Promise<BTCPayInvoice> {
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

  return response.json()
}

/**
 * Verify BTCPay Server configuration by making a test API call
 */
export async function verifyBTCPayConfig(config: BTCPayServerConfig): Promise<boolean> {
  try {
    // Try to get store info as a test
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
}

/**
 * Load BTCPay Server configuration from localStorage
 */
export function loadBTCPayConfig(): BTCPayServerConfig | null {
  const stored = localStorage.getItem('bunch:btcpay-config')
  if (!stored) return null
  try {
    return JSON.parse(stored) as BTCPayServerConfig
  } catch {
    return null
  }
}

/**
 * Save BTCPay Server configuration to localStorage
 */
export function saveBTCPayConfig(config: BTCPayServerConfig): void {
  localStorage.setItem('bunch:btcpay-config', JSON.stringify(config))
}

/**
 * Clear BTCPay Server configuration from localStorage
 */
export function clearBTCPayConfig(): void {
  localStorage.removeItem('bunch:btcpay-config')
}

