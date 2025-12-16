import type { DialogHTMLAttributes } from 'react'
import { useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { LoyaltyCard, PurchaseNonce, Session } from '../types'

interface PurchaseScanModalProps extends Pick<DialogHTMLAttributes<HTMLDialogElement>, 'open'> {
  onOpenChange: (open: boolean) => void
  purchase: PurchaseNonce | null
  card: LoyaltyCard | null
  session: Session | null
}

export const PurchaseScanModal = ({ open, onOpenChange, purchase, card, session }: PurchaseScanModalProps) => {
  const payload = useMemo(() => {
    if (!purchase || !card || !session) return null
    return {
      type: 'purchase-ticket',
      sessionId: session.id,
      cardId: card.id,
      cardTitle: card.title,
      punchesRequired: card.punchesRequired,
      minSats: card.minSats,
      purchaseNonce: purchase.nonce,
      expiresAt: purchase.expiresAt,
    }
  }, [card, purchase, session])

  if (!open || !payload) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-[420px] space-y-6 text-center">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold">Share purchase QR</h2>
          <p className="text-sm text-black/60">Customer scans this after they pay in your BTC terminal.</p>
        </header>
        <QRCodeSVG value={JSON.stringify(payload)} size={260} className="mx-auto" />
        <p className="text-xs text-black/50">
          QR includes the punch card ID, single-use nonce, and minimum sats. Expires automatically in 10 minutes.
        </p>
        <button
          className="w-full py-3 rounded-2xl bg-brand-orange text-white font-semibold text-lg"
          onClick={() => onOpenChange(false)}
        >
          Close
        </button>
      </div>
    </div>
  )
}
