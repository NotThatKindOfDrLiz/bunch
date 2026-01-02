/**
 * Payment Provider Configuration Management
 * 
 * Handles loading/saving payment provider configurations from localStorage
 */

import type { PaymentProviderConfig } from './paymentProviders'
import type { BTCPayServerConfig } from './providers/btcpayProvider'

function isBTCPayConfig(config: PaymentProviderConfig): config is BTCPayServerConfig {
  return config.provider === 'btcpay' && 'serverUrl' in config && 'apiKey' in config && 'storeId' in config
}

const CONFIG_STORAGE_KEY = 'bunch:payment-provider-config'

/**
 * Load payment provider configuration from localStorage
 */
export function loadPaymentConfig(): PaymentProviderConfig | null {
  const stored = localStorage.getItem(CONFIG_STORAGE_KEY)
  if (!stored) {
    // Try legacy BTCPay config for backward compatibility
    return loadLegacyBTCPayConfig()
  }
  try {
    return JSON.parse(stored) as PaymentProviderConfig
  } catch {
    return null
  }
}

/**
 * Save payment provider configuration to localStorage
 */
export function savePaymentConfig(config: PaymentProviderConfig | null): void {
  if (config) {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config))
    // Also save legacy BTCPay config for backward compatibility
    if (isBTCPayConfig(config)) {
      saveLegacyBTCPayConfig(config)
    }
  } else {
    localStorage.removeItem(CONFIG_STORAGE_KEY)
    // Clear legacy config too
    localStorage.removeItem('bunch:btcpay-config')
  }
}

/**
 * Clear payment provider configuration from localStorage
 */
export function clearPaymentConfig(): void {
  localStorage.removeItem(CONFIG_STORAGE_KEY)
  localStorage.removeItem('bunch:btcpay-config')
}

/**
 * Legacy BTCPay config loading (for backward compatibility)
 */
function loadLegacyBTCPayConfig(): PaymentProviderConfig | null {
  const stored = localStorage.getItem('bunch:btcpay-config')
  if (!stored) return null
  try {
    const legacy = JSON.parse(stored) as { serverUrl: string; apiKey: string; storeId: string }
    return {
      provider: 'btcpay',
      serverUrl: legacy.serverUrl,
      apiKey: legacy.apiKey,
      storeId: legacy.storeId,
    }
  } catch {
    return null
  }
}

/**
 * Legacy BTCPay config saving (for backward compatibility)
 */
function saveLegacyBTCPayConfig(config: BTCPayServerConfig): void {
  localStorage.setItem(
    'bunch:btcpay-config',
    JSON.stringify({
      serverUrl: config.serverUrl,
      apiKey: config.apiKey,
      storeId: config.storeId,
    })
  )
}

