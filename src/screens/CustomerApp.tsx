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
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualPurchaseCode, setManualPurchaseCode] = useState('')

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
    <div className="min-h-screen bg-gradient-to-br from-brand-charcoal via-brand-charcoal to-black text-brand-cream">
      <header className="px-4 sm:px-6 pt-8 sm:pt-10 pb-6">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg sm:text-xl">B</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight">Bunch</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-2">
            Earn punches after you pay
          </h1>
          <p className="text-sm sm:text-base text-brand-cream/60">
            Join a merchant session to start earning rewards
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 pb-8">
        {!state ? (
          <SessionJoinCard
            onJoin={(snapshot) => {
              joinSessionViaSnapshot(snapshot)
            }}
          />
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            <section className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wider text-brand-orange/80 font-semibold mb-2">
                        Active Session
                      </p>
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                        {state.cardTitle}
                      </h2>
                      <p className="text-sm sm:text-base text-brand-cream/70 leading-relaxed">
                        Earn {state.punchesRequired} {state.punchesRequired === 1 ? 'punch' : 'punches'} to unlock your reward
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase tracking-wider text-brand-cream/50 font-medium">
                        Progress
                      </span>
                      <span className="text-sm font-bold text-brand-cream/90">
                        {progress.punchesEarned} / {state.punchesRequired}
                      </span>
                    </div>
                    <div className="relative bg-black/40 rounded-full overflow-hidden h-3 shadow-inner">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-orange via-orange-500 to-orange-400 rounded-full transition-all duration-700 ease-out shadow-lg" 
                        style={{ width: `${progress.ratio * 100}%` }} 
                      />
                    </div>
                    <p className="text-xs text-brand-cream/50 mt-2 font-medium">
                      Minimum purchase: {formatSats(state.minSats)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-3">
                {showManualEntry ? (
                  <div className="bg-white/5 rounded-2xl p-5 space-y-4 border border-white/10">
                    <label className="block text-xs uppercase tracking-wider text-brand-cream/60 font-semibold">
                      Enter Purchase Code
                    </label>
                    <form
                      className="flex flex-col sm:flex-row gap-3"
                      onSubmit={(event) => {
                        event.preventDefault()
                        if (!manualPurchaseCode.trim()) {
                          toast.error('Enter purchase code')
                          return
                        }
                        if (!state) {
                          toast.error('Not in a session')
                          return
                        }
                        handlePurchaseScan({
                          nonce: manualPurchaseCode.trim(),
                          sessionId: state.sessionId,
                          cardId: state.cardId,
                          minSats: state.minSats,
                          createdAt: Date.now(),
                          expiresAt: Date.now() + 10 * 60 * 1000,
                        })
                        setManualPurchaseCode('')
                        setShowManualEntry(false)
                      }}
                    >
                      <input
                        className="flex-1 px-5 py-4 rounded-xl bg-black/30 border border-white/10 text-lg uppercase tracking-widest font-mono text-center focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange/50 transition-all placeholder:text-brand-cream/20"
                        value={manualPurchaseCode}
                        onChange={(event) => setManualPurchaseCode(event.target.value.toUpperCase())}
                        placeholder="Enter code..."
                        autoFocus
                      />
                      <button 
                        type="submit" 
                        className="px-6 py-4 rounded-xl bg-gradient-to-r from-brand-orange to-orange-500 text-black font-bold text-base shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
                      >
                        Submit
                      </button>
                    </form>
                    <button
                      className="w-full py-2 text-sm text-brand-cream/50 hover:text-brand-cream/70 transition-colors"
                      onClick={() => {
                        setShowManualEntry(false)
                        setManualPurchaseCode('')
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-orange to-orange-500 text-black font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
                      onClick={() => setScannerMode('purchase')}
                    >
                      📷 Scan Purchase QR
                    </button>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                      <div className="relative flex items-center gap-4 py-2">
                        <div className="flex-1 h-px bg-white/10"></div>
                        <span className="text-xs uppercase tracking-wider text-brand-cream/40 font-medium">OR</span>
                        <div className="flex-1 h-px bg-white/10"></div>
                      </div>
                    </div>
                    <button
                      className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-brand-cream font-bold text-base hover:bg-white/10 transition-all duration-200"
                      onClick={() => setShowManualEntry(true)}
                    >
                      Enter Purchase Code
                    </button>
                  </>
                )}
                <button
                  className={classNames(
                    'w-full py-4 rounded-2xl text-base font-bold transition-all duration-200',
                    state.punchesEarned >= state.punchesRequired
                      ? 'bg-gradient-to-r from-brand-green to-green-500 text-black shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99]'
                      : 'bg-white/5 text-brand-cream/40 border border-white/10 cursor-not-allowed',
                  )}
                  onClick={requestRedemption}
                  disabled={state.punchesEarned < state.punchesRequired}
                >
                  {state.punchesEarned >= state.punchesRequired ? '🎉 Redeem Reward' : 'Complete punches to redeem'}
                </button>
                <button 
                  className="w-full py-3 rounded-xl text-sm text-brand-cream/50 hover:text-brand-cream/70 transition-colors duration-200 font-medium" 
                  onClick={leaveSession}
                >
                  Leave session
                </button>
              </div>
            </section>
          </div>
        )}
      </main>

      <QRModal
        open={Boolean(scannerMode)}
        onOpenChange={(open) => setScannerMode(open ? scannerMode ?? 'join' : null)}
        onPayload={handlePayload}
      />
    </div>
  )
}
