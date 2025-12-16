import { QRCodeScanner } from '../QRCodeScanner'

interface QRModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPayload: (payload: unknown) => void
}

export const QRModal = ({ open, onOpenChange, onPayload }: QRModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-brand-charcoal to-black border border-white/10 rounded-3xl p-6 w-full max-w-[420px] space-y-5 shadow-2xl">
        <header className="space-y-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Scan QR</h2>
          <p className="text-sm text-white/80 leading-relaxed">Aim camera at the Bunch QR code.</p>
        </header>
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg">
          <QRCodeScanner onDecode={onPayload} />
        </div>
        <button 
          className="w-full py-3.5 rounded-2xl bg-black/40 backdrop-blur-sm text-white font-bold hover:bg-black/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" 
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
