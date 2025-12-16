import { useState } from 'react'
import toast from 'react-hot-toast'
import { QRModal } from './modals/QRModal'
import { parsePayload } from '../utils/qr'
import { getSessionSnapshot } from '../lib/storage'
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
    // Always use the card data from the QR code, not any cached data
    const snapshot: SessionSnapshot = {
      sessionId: parsed.sessionId,
      cardId: parsed.card.id,
      cardTitle: parsed.card.title,
      punchesRequired: parsed.card.punchesRequired, // Use the value from QR
      minSats: parsed.card.minSats,
      demoMode: parsed.demoMode,
      joinCode: parsed.joinCode,
      issuedAt: Date.now(),
    }
    console.log('Joining session with punchesRequired:', snapshot.punchesRequired) // Debug log
    onJoin(snapshot)
  }

  return (
    <section className="max-w-2xl mx-auto bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
      <div className="p-6 sm:p-8 space-y-6">
        <header className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Join a merchant session</h2>
          <p className="text-sm sm:text-base text-brand-cream/70 leading-relaxed">
            Scan the QR code shown at checkout or enter the join code manually
          </p>
        </header>
        
        <div className="space-y-4">
          <button 
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-orange to-orange-500 text-black font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200" 
            onClick={() => setShowScanner(true)}
          >
            📷 Scan Join QR Code
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
            <div className="relative flex items-center gap-4 py-4">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-xs uppercase tracking-wider text-brand-cream/40 font-medium">OR</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 space-y-4 border border-white/10">
            <label className="block text-xs uppercase tracking-wider text-brand-cream/60 font-semibold">
              Enter Join Code
            </label>
            <form
              className="flex flex-col sm:flex-row gap-3"
              onSubmit={(event) => {
                event.preventDefault()
                if (!manualCode.trim()) {
                  toast.error('Enter join code')
                  return
                }
                const joinCode = manualCode.trim().toUpperCase()
                // Try to get session snapshot from localStorage first (if previously scanned)
                const snapshot = getSessionSnapshot(joinCode)
                if (snapshot) {
                  // Use the stored snapshot with correct card data
                  console.log('Using stored snapshot with punchesRequired:', snapshot.punchesRequired)
                  onJoin(snapshot)
                  setManualCode('')
                  return
                }
                // If no snapshot found, show error - they need to scan QR or merchant needs to be active
                toast.error('Session not found. Please scan the QR code or ensure the merchant session is active.')
              }}
            >
              <input
                className="flex-1 px-5 py-4 rounded-xl bg-black/30 border border-white/10 text-lg uppercase tracking-widest font-mono text-center focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange/50 transition-all placeholder:text-brand-cream/20"
                value={manualCode}
                onChange={(event) => setManualCode(event.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
              />
              <button 
                type="submit" 
                className="px-6 py-4 rounded-xl bg-gradient-to-r from-brand-orange to-orange-500 text-black font-bold text-base shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Join
              </button>
            </form>
          </div>
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
