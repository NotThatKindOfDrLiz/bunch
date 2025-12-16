import type { LoyaltyCard, Session } from '../types'
import { QRCodeSVG } from 'qrcode.react'

interface SessionCardProps {
  card: LoyaltyCard
  session: Session
  onNewPurchase: () => void
  onEndSession: () => void
}

export const SessionCard = ({ card, session, onNewPurchase, onEndSession }: SessionCardProps) => {
  const joinPayload = {
    type: 'join-session',
    sessionId: session.id,
    joinCode: session.joinCode,
    card: {
      id: card.id,
      title: card.title,
      punchesRequired: card.punchesRequired,
      minSats: card.minSats,
    },
    demoMode: session.demoMode,
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 space-y-5 border border-black/5">
      <h2 className="text-xl font-bold tracking-tight">Session</h2>
      <div className="text-sm text-black/70 space-y-2">
        <p className="font-medium">Join code</p>
        <p className="text-3xl font-mono tracking-[0.4em] text-center py-3 bg-gradient-to-br from-brand-cream to-brand-cream/50 rounded-2xl border border-black/5 font-bold text-brand-charcoal">
          {session.joinCode}
        </p>
        <p className="text-xs text-black/50 text-center leading-relaxed">
          Customers scan or enter this code at <span className="font-semibold">bunch.local/customer</span>
        </p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-gradient-to-br from-brand-cream to-brand-cream/50 p-4 rounded-2xl border border-black/5 shadow-sm">
          <QRCodeSVG value={JSON.stringify(joinPayload)} size={220} />
        </div>
        <p className="text-xs text-black/50 text-center max-w-[240px] leading-relaxed">
          Customers can also join by pasting this code if their camera is unavailable.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button 
          className="py-3.5 rounded-2xl bg-gradient-to-r from-brand-orange to-orange-500 text-white font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" 
          onClick={onNewPurchase}
        >
          New purchase
        </button>
        <button 
          className="py-3.5 rounded-2xl bg-black text-white font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" 
          onClick={onEndSession}
        >
          End session
        </button>
      </div>
    </div>
  )
}
