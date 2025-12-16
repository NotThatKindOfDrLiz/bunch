import classNames from 'classnames'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { SessionJoinCard } from '../components/SessionJoinCard'
import { QRModal } from '../components/modals/QRModal'
import { useCustomerStore } from '../state/useCustomerStore'
import { formatSats } from '../utils/format'
import { parsePayload } from '../utils/qr'

export const CustomerApp = () => {
  const { state, joinSessionViaSnapshot, handlePurchaseScan, requestRedemption, leaveSession } = useCustomerStore()
  const [scannerMode, setScannerMode] = useState<'join' | 'purchase' | null>(null)

  const progress = useMemo(() => {
    if (!state) return { ratio: 0, punchesEarned: 0 }
    return {
      ratio: Math.min(1, state.punchesEarned / state.punchesRequired),
      punchesEarned: state.punchesEarned,
    }
  }, [state])

  const handlePayload = (payload: unknown) => {
    const parsed = parsePayload(payload)
    if (parsed.type === 'purchase-ticket') {
      handlePurchaseScan({
        nonce: parsed.purchaseNonce,
        sessionId: parsed.sessionId,
        cardId: parsed.cardId,
        minSats: parsed.minSats,
        createdAt: Date.now(),
        expiresAt: parsed.expiresAt,
      })
      setScannerMode(null)
      return
    }
    if (parsed.type === 'join-session') {
      joinSessionViaSnapshot({
        sessionId: parsed.sessionId,
        cardId: parsed.card.id,
        cardTitle: parsed.card.title,
        punchesRequired: parsed.card.punchesRequired,
        minSats: parsed.card.minSats,
        demoMode: parsed.demoMode,
        joinCode: parsed.joinCode,
        issuedAt: Date.now(),
      })
      setScannerMode(null)
      return
    }
    toast.error('Unsupported QR payload')
  }

  return (
    <div className="min-h-screen bg-brand-charcoal text-brand-cream">
      <header className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <img src="/logo-name.png" alt="Bunch" className="h-8 brightness-0 invert" />
        </div>
        <div className="space-y-1">
          <p className="uppercase text-xs tracking-[0.2em] text-brand-orange">Customer</p>
          <h1 className="text-2xl font-bold">Earn punches after you pay</h1>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {!state ? (
          <SessionJoinCard
            onJoin={(snapshot) => {
              joinSessionViaSnapshot(snapshot)
            }}
          />
        ) : (
          <section className="bg-black/20 rounded-3xl border border-white/10 p-6 space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-cream/50">Merchant session</p>
              <h2 className="text-2xl font-semibold">{state.cardTitle}</h2>
              <p className="text-sm text-brand-cream/70">
                Earn {state.punchesRequired} {state.punchesRequired === 1 ? 'punch' : 'punches'} to unlock your reward.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-cream/50">Punch progress</p>
              <div className="bg-black/30 rounded-2xl overflow-hidden">
                <div className="bg-brand-orange h-3 transition-all" style={{ width: `${progress.ratio * 100}%` }} />
              </div>
              <p className="text-sm text-brand-cream/70">
                {progress.punchesEarned} / {state.punchesRequired} punches • Min purchase {formatSats(state.minSats)}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                className="py-3 rounded-2xl bg-brand-orange text-black font-semibold"
                onClick={() => setScannerMode('purchase')}
              >
                Scan purchase QR
              </button>
              <button
                className={classNames(
                  'py-3 rounded-2xl border border-white/20 text-base font-semibold transition',
                  state.punchesEarned >= state.punchesRequired
                    ? 'bg-brand-green text-black'
                    : 'bg-transparent text-brand-cream/70',
                )}
                onClick={requestRedemption}
                disabled={state.punchesEarned < state.punchesRequired}
              >
                Redeem reward
              </button>
              <button className="py-3 rounded-2xl text-sm text-brand-cream/50 underline" onClick={leaveSession}>
                Leave session
              </button>
            </div>
          </section>
        )}
      </main>

      <button
        className="fixed bottom-6 right-6 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-sm"
        onClick={() => setScannerMode(state ? 'purchase' : 'join')}
      >
        {state ? 'Scan purchase' : 'Scan join QR'}
      </button>

      <QRModal
        open={Boolean(scannerMode)}
        onOpenChange={(open) => setScannerMode(open ? scannerMode ?? 'join' : null)}
        onPayload={handlePayload}
      />
    </div>
  )
}
