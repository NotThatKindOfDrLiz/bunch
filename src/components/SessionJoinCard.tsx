import { useState } from 'react'
import toast from 'react-hot-toast'
import { QRModal } from './modals/QRModal'
import { parsePayload } from '../utils/qr'
import type { SessionSnapshot } from '../types'

interface SessionJoinCardProps {
  onJoin: (snapshot: SessionSnapshot) => void
}

export const SessionJoinCard = ({ onJoin }: SessionJoinCardProps) => {
  const [showScanner, setShowScanner] = useState(false)
  const [manualCode, setManualCode] = useState('')

  const handleJoin = (payload: unknown) => {
    const parsed = parsePayload(payload)
    if (parsed.type !== 'join-session') {
      toast.error('Not a session QR')
      return
    }
    const snapshot: SessionSnapshot = {
      sessionId: parsed.sessionId,
      cardId: parsed.card.id,
      cardTitle: parsed.card.title,
      punchesRequired: parsed.card.punchesRequired,
      minSats: parsed.card.minSats,
      demoMode: parsed.demoMode,
      joinCode: parsed.joinCode,
      issuedAt: Date.now(),
    }
    onJoin(snapshot)
  }

  return (
    <section className="bg-black/20 border border-white/10 rounded-3xl p-6 space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Join a merchant session</h2>
        <p className="text-sm text-white/70">Scan the code shown at checkout or paste the join code.</p>
      </header>
      <div className="flex flex-col gap-3">
        <button className="py-3 rounded-2xl bg-brand-orange text-black font-semibold" onClick={() => setShowScanner(true)}>
          Scan join QR
        </button>
        <div className="bg-black/40 rounded-2xl p-4 space-y-3">
          <label className="text-xs uppercase tracking-[0.2em] text-white/60">Have a join code?</label>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              if (!manualCode.trim()) {
                toast.error('Enter join code')
                return
              }
              handleJoin({
                type: 'join-session',
                sessionId: manualCode.trim().toUpperCase(),
                joinCode: manualCode.trim().toUpperCase(),
                card: {
                  id: 'manual',
                  title: 'Merchant card',
                  punchesRequired: 5,
                  minSats: 1000,
                },
                demoMode: true,
              })
            }}
          >
            <input
              className="flex-1 px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-lg uppercase tracking-[0.5em]"
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value.toUpperCase())}
              placeholder="JOIN"
              maxLength={6}
            />
            <button type="submit" className="px-4 py-3 rounded-2xl bg-brand-orange text-black font-semibold">
              Join
            </button>
          </form>
        </div>
      </div>

      <QRModal
        open={showScanner}
        onOpenChange={setShowScanner}
        onPayload={(payload) => {
          handleJoin(payload)
          setShowScanner(false)
        }}
      />
    </section>
  )
}
