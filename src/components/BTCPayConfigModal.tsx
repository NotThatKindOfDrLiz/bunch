import { useState } from 'react'
import type { DialogHTMLAttributes } from 'react'
import toast from 'react-hot-toast'
import { verifyBTCPayConfig, type BTCPayServerConfig } from '../utils/btcpay'

interface BTCPayConfigModalProps extends Pick<DialogHTMLAttributes<HTMLDialogElement>, 'open'> {
  onOpenChange: (open: boolean) => void
  currentConfig: BTCPayServerConfig | null
  onSave: (config: BTCPayServerConfig | null) => Promise<void>
}

export const BTCPayConfigModal = ({
  open,
  onOpenChange,
  currentConfig,
  onSave,
  onVerify,
}: BTCPayConfigModalProps) => {
  const [serverUrl, setServerUrl] = useState(currentConfig?.serverUrl || '')
  const [apiKey, setApiKey] = useState(currentConfig?.apiKey || '')
  const [storeId, setStoreId] = useState(currentConfig?.storeId || '')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  if (!open) return null

  const handleVerify = async () => {
    if (!serverUrl || !apiKey || !storeId) {
      toast.error('Please fill in all fields')
      return
    }

    setIsVerifying(true)
    try {
      const config: BTCPayServerConfig = {
        serverUrl: serverUrl.trim(),
        apiKey: apiKey.trim(),
        storeId: storeId.trim(),
      }
      const isValid = await verifyBTCPayConfig(config)
      if (isValid) {
        toast.success('BTCPay Server connection verified!')
      } else {
        toast.error('Failed to verify connection. Check your credentials.')
      }
    } catch (error) {
      toast.error(`Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSave = async () => {
    if (!serverUrl || !apiKey || !storeId) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        serverUrl: serverUrl.trim(),
        apiKey: apiKey.trim(),
        storeId: storeId.trim(),
      })
      onOpenChange(false)
    } catch (error) {
      toast.error(`Save error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClear = async () => {
    await onSave(null)
    setServerUrl('')
    setApiKey('')
    setStoreId('')
    onOpenChange(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-[500px] space-y-6 border border-black/5">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">BTCPay Server Configuration</h2>
          <p className="text-sm text-black/60 leading-relaxed">
            Connect your BTCPay Server instance to automatically create invoices and track payments.
          </p>
        </header>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-black/80 mb-2">
              Server URL
            </label>
            <input
              type="url"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
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
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
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
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              placeholder="your-store-id"
              className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all font-mono text-sm"
            />
            <p className="text-xs text-black/50 mt-1">
              Your store ID from BTCPay Server (found in store settings)
            </p>
          </div>
        </div>

        <div className="bg-brand-cream/50 rounded-2xl p-4 border border-black/5">
          <p className="text-xs text-black/70 leading-relaxed">
            <strong>Note:</strong> BTCPay Server integration only works when Demo Mode is OFF. 
            When enabled, invoices are automatically created and payments are tracked via polling.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleVerify}
            disabled={isVerifying || !serverUrl || !apiKey || !storeId}
            className="flex-1 px-5 py-3 rounded-xl bg-white border-2 border-brand-orange text-brand-orange font-bold text-sm hover:bg-brand-orange/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? 'Verifying...' : 'Verify Connection'}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !serverUrl || !apiKey || !storeId}
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

