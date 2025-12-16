import { useMemo } from 'react'
import type { Session } from '../types'

interface MerchantStatusPanelProps {
  punches: number
  punchGoal: number
  session: Session | null
}

export const MerchantStatusPanel = ({ punches, punchGoal, session }: MerchantStatusPanelProps) => {
  const progress = useMemo(() => {
    if (!punchGoal) return 0
    return Math.min(1, punches / punchGoal)
  }, [punchGoal, punches])

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Status</h2>
        <span className="text-sm text-black/60">{punches} punches awarded</span>
      </div>
      <div className="space-y-3 text-sm text-black/70">
        <p>Bunch tracks rewards after you see the Bitcoin payment clear. No invoices, no custody.</p>
        <div className="bg-brand-cream rounded-2xl p-4 text-xs leading-relaxed text-black/70">
          <p className="font-semibold text-brand-orange mb-1">Demo flow</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Customer joins using QR or code.</li>
            <li>Tap New Purchase to show purchase QR.</li>
            <li>Customer scans and waits.</li>
            <li>Tap Mark Paid once BTC payment is confirmed.</li>
          </ol>
        </div>
        {session ? (
          <div className="pt-2">
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">Session progress</p>
            <div className="bg-black/10 rounded-2xl overflow-hidden h-2">
              <div className="bg-brand-orange h-full transition-all" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
