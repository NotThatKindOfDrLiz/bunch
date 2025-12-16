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
  } = useMerchantStore()

  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
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
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-6 py-4 border-b border-black/10">
        <div className="flex items-center gap-3">
          <img src="/logo-name.png" alt="Bunch" className="h-10 md:h-12" />
          <div className="border-l border-black/20 pl-3">
            <h2 className="text-xl font-semibold">Merchant</h2>
            <p className="text-xs text-black/70">Drop-in Bitcoin loyalty punch cards</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {session && (
            <button
              className={classNames(
                'px-4 py-2 rounded-full text-sm font-semibold transition',
                session.demoMode
                  ? 'bg-brand-orange text-white shadow-sm'
                  : 'bg-white border border-brand-orange text-brand-orange hover:bg-brand-orange/10',
              )}
              onClick={() => toggleDemoMode()}
            >
              Demo Payments: {session.demoMode ? 'ON' : 'OFF'}
            </button>
          )}
          <button
            className="px-4 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-black/80"
            onClick={() => window.open('/customer', '_blank')}
          >
            Open customer view
          </button>
        </div>
      </header>

      <main className="grid lg:grid-cols-[420px_1fr] min-h-[calc(100vh-96px)]">
        <section className="border-r border-black/10 p-6 space-y-6 bg-brand-cream/60">
          {card ? <CardStats card={card} onDelete={deleteCard} /> : <EmptyStateCard onCreate={handleCreateCard} />}

          {session && card ? (
            <SessionCard
              card={card}
              session={session}
              onNewPurchase={handleGeneratePurchase}
              onEndSession={endSession}
            />
          ) : (
            <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-semibold">Session</h2>
              <p className="text-sm text-black/70">
                Start a session to accept customers. A session uses the current punch card and clears when you end it.
              </p>
              <button
                className="w-full py-3 rounded-2xl bg-brand-orange text-white font-semibold text-base"
                onClick={() => startSession(true)}
              >
                Start demo session
              </button>
            </div>
          )}

          <MerchantStatusPanel punches={punchesEarned} punchGoal={card?.punchesRequired ?? 0} session={session} />
        </section>

        <section className="p-6 space-y-6 bg-brand-cream">
          <div className="bg-white rounded-3xl shadow-sm p-6 min-h-[220px]">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
              <h2 className="text-xl font-semibold">Waiting for payment</h2>
              <p className="text-sm text-black/60">
                {pendingPurchases.length} purchase{pendingPurchases.length === 1 ? '' : 's'} pending
              </p>
            </header>
            {pendingPurchases.length === 0 ? (
              <div className="text-center text-sm text-black/50 py-10">Waiting for customer scans…</div>
            ) : (
              <div className="space-y-4">
                {pendingPurchases.map((purchase) => (
                  <div
                    key={purchase.nonce}
                    className="border border-black/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-lg">Purchase #{purchase.nonce.slice(0, 5)}</p>
                      <p className="text-xs text-black/50">
                        Expires in {Math.max(0, Math.floor((purchase.expiresAt - Date.now()) / 60000))} min
                      </p>
                    </div>
                    <button
                      className="px-5 py-2 rounded-xl bg-brand-orange text-white text-sm font-semibold"
                      onClick={() => markPaid(purchase.nonce)}
                    >
                      Mark paid
                    </button>
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
    </div>
  )
}
