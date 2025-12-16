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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-[420px] space-y-6 text-center border border-black/5">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Share purchase QR</h2>
          <p className="text-sm text-black/60 leading-relaxed">Customer scans this after they pay in your BTC terminal.</p>
        </header>
        <div className="bg-gradient-to-br from-brand-cream to-brand-cream/50 p-4 rounded-2xl border border-black/5 shadow-sm">
          <QRCodeSVG value={JSON.stringify(payload)} size={260} className="mx-auto" />
        </div>
        {purchase && (
          <div className="bg-brand-cream/50 rounded-2xl p-4 border border-black/5">
            <p className="text-xs uppercase tracking-wider text-black/50 font-semibold mb-2">Purchase Code</p>
            <p className="text-2xl font-mono tracking-wider text-center font-bold text-brand-charcoal break-all">
              {purchase.nonce}
            </p>
            <p className="text-xs text-black/50 mt-2 text-center">
              Customer can enter this code manually if they can't scan
            </p>
          </div>
        )}
        <p className="text-xs text-black/50 leading-relaxed">
          QR includes the punch card ID, single-use nonce, and minimum sats. Expires automatically in 10 minutes.
        </p>
        <button
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-orange to-orange-500 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          onClick={() => onOpenChange(false)}
        >
          Close
        </button>
      </div>
    </div>
  )
}
