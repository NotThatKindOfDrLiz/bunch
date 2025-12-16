import { QRCodeScanner } from '../QRCodeScanner'

interface QRModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPayload: (payload: unknown) => void
}

export const QRModal = ({ open, onOpenChange, onPayload }: QRModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80">
      <div className="bg-brand-charcoal border border-white/10 rounded-3xl p-6 w-full max-w-[420px] space-y-4">
        <header className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold">Scan QR</h2>
          <p className="text-sm text-white/70">Aim camera at the Bunch QR code.</p>
        </header>
        <div className="rounded-2xl overflow-hidden border border-white/10">
          <QRCodeScanner onDecode={onPayload} />
        </div>
        <button className="w-full py-3 rounded-2xl bg-black/40 text-white font-semibold" onClick={() => onOpenChange(false)}>
          Cancel
        </button>
      </div>
    </div>
  )
}
