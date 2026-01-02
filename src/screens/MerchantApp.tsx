import { useMemo, useState } from 'react'
import classNames from 'classnames'
import toast from 'react-hot-toast'
import { useMerchantStore } from '../state/useMerchantStore'
import type { PurchaseNonce } from '../types'
import { PurchaseScanModal } from '../components/PurchaseScanModal'
import { RedemptionRequestsPanel } from '../components/RedemptionRequestsPanel'
import { CardStats } from '../components/CardStats'
import { EmptyStateCard } from '../components/EmptyStateCard'
import { SessionCard } from '../components/SessionCard'
import { MerchantStatusPanel } from '../components/MerchantStatusPanel'
import { BTCPayConfigModal } from '../components/BTCPayConfigModal'

export const MerchantApp = () => {
  const {
    card,
    session,
    pendingPurchases,
    punchLedger,
    redemptionRequests,
    createCard,
    deleteCard,
    startSession,
    endSession,
    generatePurchaseNonce,
    markPaid,
    fulfillRedemption,
    toggleDemoMode,
    btcpayConfig,
    setBTCPayConfig,
    verifyBTCPayConnection,
  } = useMerchantStore()

  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showBTCPayConfig, setShowBTCPayConfig] = useState(false)
  const [lastGeneratedNonce, setLastGeneratedNonce] = useState<PurchaseNonce | null>(null)

  const handleCreateCard = async () => {
    const title = prompt('Card title (ex: Buy 5 Get 1)')
    if (!title) return
    const punchesRequiredRaw = prompt('How many punches to unlock reward?')
    const minSatsRaw = prompt('Minimum sats per purchase?')
    const punchesRequired = Number.parseInt(punchesRequiredRaw ?? '', 10)
    const minSats = Number.parseInt(minSatsRaw ?? '', 10)
    if (!Number.isFinite(punchesRequired) || punchesRequired <= 0) {
      toast.error('Enter a valid punch count')
      return
    }
    if (!Number.isFinite(minSats) || minSats <= 0) {
      toast.error('Enter a sats minimum')
      return
    }
    await createCard({ title, punchesRequired, minSats })
  }

  const handleGeneratePurchase = async () => {
    const nonce = await generatePurchaseNonce()
    if (nonce) {
      setLastGeneratedNonce(nonce)
      setShowPurchaseModal(true)
    }
  }

  const punchesEarned = useMemo(() => punchLedger.length, [punchLedger])

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-5 border-b border-black/10 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <img src={`${import.meta.env.BASE_URL}logo-name.png`} alt="Bunch" className="h-10 md:h-12" />
          <div className="border-l border-black/20 pl-4">
            <h2 className="text-xl font-bold tracking-tight">Merchant</h2>
            <p className="text-xs text-black/70 font-medium">Drop-in Bitcoin loyalty punch cards</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {session && (
            <>
              <button
                className={classNames(
                  'px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 shadow-sm',
                  session.demoMode
                    ? 'bg-gradient-to-r from-brand-orange to-orange-500 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
                    : 'bg-white border-2 border-brand-orange text-brand-orange hover:bg-brand-orange/10 hover:border-brand-orange/80',
                )}
                onClick={() => toggleDemoMode()}
              >
                Demo Payments: {session.demoMode ? 'ON' : 'OFF'}
              </button>
              {btcpayConfig && !session.demoMode && (
                <div className="px-4 py-2 rounded-full bg-green-100 border border-green-300 text-green-700 text-xs font-semibold flex items-center gap-2">
                  <span>₿</span>
                  <span>BTCPay Connected</span>
                </div>
              )}
            </>
          )}
          <button
            className="px-5 py-2.5 rounded-full bg-white border-2 border-black/10 text-black/70 text-sm font-bold hover:bg-black/5 transition-all duration-200"
            onClick={() => setShowBTCPayConfig(true)}
            title="Configure BTCPay Server"
          >
            {btcpayConfig ? '⚙️ BTCPay' : '⚙️ Setup BTCPay'}
          </button>
          <button
            className="px-5 py-2.5 rounded-full bg-black text-white text-sm font-bold shadow-md hover:bg-black/90 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
            onClick={() => {
              const baseUrl = import.meta.env.BASE_URL.endsWith('/') 
                ? import.meta.env.BASE_URL.slice(0, -1) 
                : import.meta.env.BASE_URL
              window.open(`${baseUrl}/customer`, '_blank')
            }}
          >
            Open customer view
          </button>
        </div>
      </header>

      <main className="grid lg:grid-cols-[420px_1fr] min-h-[calc(100vh-96px)]">
        <section className="border-r border-black/10 p-6 space-y-6 bg-gradient-to-b from-brand-cream/80 to-brand-cream/60">
          {card ? <CardStats card={card} onDelete={deleteCard} /> : <EmptyStateCard onCreate={handleCreateCard} />}

          {session && card ? (
            <SessionCard
              card={card}
              session={session}
              onNewPurchase={handleGeneratePurchase}
              onEndSession={endSession}
            />
          ) : (
            <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4 border border-black/5">
              <h2 className="text-xl font-bold tracking-tight">Session</h2>
              <p className="text-sm text-black/70 leading-relaxed">
                Start a session to accept customers. A session uses the current punch card and clears when you end it.
              </p>
              <button
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-orange to-orange-500 text-white font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                onClick={() => startSession(true)}
              >
                Start demo session
              </button>
            </div>
          )}

          <MerchantStatusPanel punches={punchesEarned} punchGoal={card?.punchesRequired ?? 0} session={session} />
        </section>

        <section className="p-6 space-y-6 bg-brand-cream">
          <div className="bg-white rounded-3xl shadow-lg p-6 min-h-[220px] border border-black/5">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-5">
              <h2 className="text-xl font-bold tracking-tight">Waiting for payment</h2>
              <p className="text-sm text-black/60 font-medium">
                {pendingPurchases.length} purchase{pendingPurchases.length === 1 ? '' : 's'} pending
              </p>
            </header>
            {pendingPurchases.length === 0 ? (
              <div className="text-center text-sm text-black/50 py-12 font-medium">Waiting for customer scans…</div>
            ) : (
              <div className="space-y-4">
                {pendingPurchases.map((purchase) => (
                  <div
                    key={purchase.nonce}
                    className="border border-black/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-br from-white to-brand-cream/30 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg tracking-tight">Purchase #{purchase.nonce.slice(0, 5)}</p>
                        {purchase.btcpayInvoiceId && (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            ₿ Invoice
                          </span>
                        )}
                        {purchase.btcpayStatus && (
                          <span className={classNames(
                            'px-2 py-0.5 rounded-full text-xs font-semibold',
                            purchase.btcpayStatus === 'Paid' || purchase.btcpayStatus === 'Settled'
                              ? 'bg-green-100 text-green-700'
                              : purchase.btcpayStatus === 'Expired'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          )}>
                            {purchase.btcpayStatus}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-black/50 font-medium">
                        Expires in {Math.max(0, Math.floor((purchase.expiresAt - Date.now()) / 60000))} min
                      </p>
                      {purchase.btcpayCheckoutLink && (
                        <a
                          href={purchase.btcpayCheckoutLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-orange hover:underline font-medium inline-flex items-center gap-1"
                        >
                          View Invoice →
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {purchase.btcpayInvoiceId && !session?.demoMode && (
                        <span className="text-xs text-black/40 font-medium">
                          Auto-tracking
                        </span>
                      )}
                      <button
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-orange-500 text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                        onClick={() => markPaid(purchase.nonce)}
                      >
                        Mark paid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <RedemptionRequestsPanel requests={redemptionRequests} onConfirm={fulfillRedemption} />
        </section>
      </main>

      <PurchaseScanModal
        open={showPurchaseModal}
        onOpenChange={setShowPurchaseModal}
        purchase={lastGeneratedNonce}
        card={card}
        session={session}
      />

      <BTCPayConfigModal
        open={showBTCPayConfig}
        onOpenChange={setShowBTCPayConfig}
        currentConfig={btcpayConfig}
        onSave={setBTCPayConfig}
      />
    </div>
  )
}
