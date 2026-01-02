import { useState, useEffect } from 'react'
import type { DialogHTMLAttributes } from 'react'
import toast from 'react-hot-toast'
import { paymentProviderRegistry } from '../utils/paymentProviders'
import type { PaymentProviderConfig } from '../utils/paymentProviders'
import type { BTCPayServerConfig } from '../utils/providers/btcpayProvider'
import type { LNbitsConfig } from '../utils/providers/lnbitsProvider'

interface PaymentProviderConfigModalProps extends Pick<DialogHTMLAttributes<HTMLDialogElement>, 'open'> {
  onOpenChange: (open: boolean) => void
  currentConfig: PaymentProviderConfig | null
  onSave: (config: PaymentProviderConfig | null) => Promise<void>
}

export const PaymentProviderConfigModal = ({
  open,
  onOpenChange,
  currentConfig,
  onSave,
}: PaymentProviderConfigModalProps) => {
  const availableProviders = paymentProviderRegistry.getAll()
  const [selectedProvider, setSelectedProvider] = useState<string>(
    currentConfig?.provider || availableProviders[0]?.id || 'btcpay'
  )

  // BTCPay fields
  const [btcpayServerUrl, setBtcpayServerUrl] = useState('')
  const [btcpayApiKey, setBtcpayApiKey] = useState('')
  const [btcpayStoreId, setBtcpayStoreId] = useState('')

  // LNbits fields
  const [lnbitsServerUrl, setLnbitsServerUrl] = useState('')
  const [lnbitsApiKey, setLnbitsApiKey] = useState('')
  const [lnbitsWalletId, setLnbitsWalletId] = useState('')

  const [isVerifying, setIsVerifying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load current config into form fields
  useEffect(() => {
    if (currentConfig) {
      setSelectedProvider(currentConfig.provider)
      if (currentConfig.provider === 'btcpay') {
        const config = currentConfig as BTCPayServerConfig
        setBtcpayServerUrl(config.serverUrl || '')
        setBtcpayApiKey(config.apiKey || '')
        setBtcpayStoreId(config.storeId || '')
      } else if (currentConfig.provider === 'lnbits') {
        const config = currentConfig as LNbitsConfig
        setLnbitsServerUrl(config.serverUrl || '')
        setLnbitsApiKey(config.apiKey || '')
        setLnbitsWalletId(config.walletId || '')
      }
    } else {
      // Reset all fields
      setBtcpayServerUrl('')
      setBtcpayApiKey('')
      setBtcpayStoreId('')
      setLnbitsServerUrl('')
      setLnbitsApiKey('')
      setLnbitsWalletId('')
    }
  }, [currentConfig, open])

  const handleVerify = async () => {
    const provider = paymentProviderRegistry.get(selectedProvider)
    if (!provider) {
      toast.error('Invalid provider selected')
      return
    }

    let config: PaymentProviderConfig | null = null

    if (selectedProvider === 'btcpay') {
      if (!btcpayServerUrl || !btcpayApiKey || !btcpayStoreId) {
        toast.error('Please fill in all BTCPay fields')
        return
      }
      config = {
        provider: 'btcpay',
        serverUrl: btcpayServerUrl.trim(),
        apiKey: btcpayApiKey.trim(),
        storeId: btcpayStoreId.trim(),
      }
    } else if (selectedProvider === 'lnbits') {
      if (!lnbitsServerUrl || !lnbitsApiKey) {
        toast.error('Please fill in LNbits server URL and API key')
        return
      }
      config = {
        provider: 'lnbits',
        serverUrl: lnbitsServerUrl.trim(),
        apiKey: lnbitsApiKey.trim(),
        ...(lnbitsWalletId.trim() && { walletId: lnbitsWalletId.trim() }),
      }
    }

    if (!config) return

    setIsVerifying(true)
    try {
      const isValid = await provider.verifyConfig(config)
      if (isValid) {
        toast.success(`${provider.name} connection verified!`)
      } else {
        toast.error(`Failed to verify ${provider.name} connection. Check your credentials.`)
      }
    } catch (error) {
      toast.error(`Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSave = async () => {
    const provider = paymentProviderRegistry.get(selectedProvider)
    if (!provider) {
      toast.error('Invalid provider selected')
      return
    }

    let config: PaymentProviderConfig | null = null

    if (selectedProvider === 'btcpay') {
      if (!btcpayServerUrl || !btcpayApiKey || !btcpayStoreId) {
        toast.error('Please fill in all BTCPay fields')
        return
      }
      config = {
        provider: 'btcpay',
        serverUrl: btcpayServerUrl.trim(),
        apiKey: btcpayApiKey.trim(),
        storeId: btcpayStoreId.trim(),
      }
    } else if (selectedProvider === 'lnbits') {
      if (!lnbitsServerUrl || !lnbitsApiKey) {
        toast.error('Please fill in LNbits server URL and API key')
        return
      }
      config = {
        provider: 'lnbits',
        serverUrl: lnbitsServerUrl.trim(),
        apiKey: lnbitsApiKey.trim(),
        ...(lnbitsWalletId.trim() && { walletId: lnbitsWalletId.trim() }),
      }
    }

    if (!config) return

    setIsSaving(true)
    try {
      await onSave(config)
      onOpenChange(false)
    } catch (error) {
      toast.error(`Save error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClear = async () => {
    await onSave(null)
    setSelectedProvider(availableProviders[0]?.id || 'btcpay')
    setBtcpayServerUrl('')
    setBtcpayApiKey('')
    setBtcpayStoreId('')
    setLnbitsServerUrl('')
    setLnbitsApiKey('')
    setLnbitsWalletId('')
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-[500px] space-y-6 border border-black/5 max-h-[90vh] overflow-y-auto">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Payment Provider Configuration</h2>
          <p className="text-sm text-black/60 leading-relaxed">
            Connect your payment provider to automatically create invoices and track payments.
          </p>
        </header>

        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-semibold text-black/80 mb-2">
            Payment Provider
          </label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all"
          >
            {availableProviders.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        {/* BTCPay Configuration */}
        {selectedProvider === 'btcpay' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-black/80 mb-2">
                Server URL
              </label>
              <input
                type="url"
                value={btcpayServerUrl}
                onChange={(e) => setBtcpayServerUrl(e.target.value)}
                placeholder="https://btcpay.example.com"
                className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all"
              />
              <p className="text-xs text-black/50 mt-1">
                Your BTCPay Server instance URL (without trailing slash)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-black/80 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={btcpayApiKey}
                onChange={(e) => setBtcpayApiKey(e.target.value)}
                placeholder="your-api-key-here"
                className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all font-mono text-sm"
              />
              <p className="text-xs text-black/50 mt-1">
                Create an API key in BTCPay Server: Settings → Manage Account → API Keys
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-black/80 mb-2">
                Store ID
              </label>
              <input
                type="text"
                value={btcpayStoreId}
                onChange={(e) => setBtcpayStoreId(e.target.value)}
                placeholder="your-store-id"
                className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all font-mono text-sm"
              />
              <p className="text-xs text-black/50 mt-1">
                Your store ID from BTCPay Server (found in store settings)
              </p>
            </div>
          </div>
        )}

        {/* LNbits Configuration */}
        {selectedProvider === 'lnbits' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-black/80 mb-2">
                Server URL
              </label>
              <input
                type="url"
                value={lnbitsServerUrl}
                onChange={(e) => setLnbitsServerUrl(e.target.value)}
                placeholder="https://lnbits.example.com"
                className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all"
              />
              <p className="text-xs text-black/50 mt-1">
                Your LNbits instance URL (without trailing slash)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-black/80 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={lnbitsApiKey}
                onChange={(e) => setLnbitsApiKey(e.target.value)}
                placeholder="your-api-key-here"
                className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all font-mono text-sm"
              />
              <p className="text-xs text-black/50 mt-1">
                Invoice/read key from your LNbits wallet (or admin key if using wallet ID)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-black/80 mb-2">
                Wallet ID <span className="text-black/40 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={lnbitsWalletId}
                onChange={(e) => setLnbitsWalletId(e.target.value)}
                placeholder="wallet-id (optional)"
                className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all font-mono text-sm"
              />
              <p className="text-xs text-black/50 mt-1">
                Optional: Specific wallet ID (required if using admin key instead of invoice key)
              </p>
            </div>
          </div>
        )}

        <div className="bg-brand-cream/50 rounded-2xl p-4 border border-black/5">
          <p className="text-xs text-black/70 leading-relaxed">
            <strong>Note:</strong> Payment provider integration only works when Demo Mode is OFF. 
            When enabled, invoices are automatically created and payments are tracked via polling.
            All funds go directly to your payment provider wallet (Bunch never has custody).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleVerify}
            disabled={
              isVerifying ||
              (selectedProvider === 'btcpay' && (!btcpayServerUrl || !btcpayApiKey || !btcpayStoreId)) ||
              (selectedProvider === 'lnbits' && (!lnbitsServerUrl || !lnbitsApiKey))
            }
            className="flex-1 px-5 py-3 rounded-xl bg-white border-2 border-brand-orange text-brand-orange font-bold text-sm hover:bg-brand-orange/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? 'Verifying...' : 'Verify Connection'}
          </button>
          <button
            onClick={handleSave}
            disabled={
              isSaving ||
              (selectedProvider === 'btcpay' && (!btcpayServerUrl || !btcpayApiKey || !btcpayStoreId)) ||
              (selectedProvider === 'lnbits' && (!lnbitsServerUrl || !lnbitsApiKey))
            }
            className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-orange to-orange-500 text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>

        {currentConfig && (
          <button
            onClick={handleClear}
            className="w-full py-2.5 text-sm text-black/50 hover:text-black/70 transition-colors font-medium"
          >
            Clear Configuration
          </button>
        )}

        <button
          onClick={() => onOpenChange(false)}
          className="w-full py-3 rounded-xl bg-white border border-black/10 text-black/70 font-bold text-sm hover:bg-black/5 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

