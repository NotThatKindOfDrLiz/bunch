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
    <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-semibold">Session</h2>
      <div className="text-sm text-black/70 space-y-1">
        <p>Join code</p>
        <p className="text-3xl font-mono tracking-[0.4em] text-center py-2 bg-brand-cream rounded-2xl">
          {session.joinCode}
        </p>
        <p className="text-xs text-black/50 text-center">
          Customers scan or enter this code at <span className="font-semibold">bunch.local/customer</span>
        </p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <QRCodeSVG value={JSON.stringify(joinPayload)} size={220} className="bg-brand-cream p-4 rounded-2xl" />
        <p className="text-xs text-black/50 text-center max-w-[240px]">
          Customers can also join by pasting this code if their camera is unavailable.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button className="py-3 rounded-2xl bg-brand-orange text-white font-semibold text-lg" onClick={onNewPurchase}>
          New purchase
        </button>
        <button className="py-3 rounded-2xl bg-black text-white font-semibold text-lg" onClick={onEndSession}>
          End session
        </button>
      </div>
    </div>
  )
}
