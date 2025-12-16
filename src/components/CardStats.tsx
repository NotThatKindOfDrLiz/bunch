import type { LoyaltyCard } from '../types'
import { formatSats } from '../utils/format'

interface CardStatsProps {
  card: LoyaltyCard
  onDelete: () => void
}

export const CardStats = ({ card, onDelete }: CardStatsProps) => {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 space-y-5 border border-black/5">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Punch card</h2>
        <button 
          className="text-sm text-brand-red font-semibold hover:text-red-600 transition-colors duration-200" 
          onClick={onDelete}
        >
          Remove
        </button>
      </header>
      <div className="space-y-4">
        <div>
          <p className="text-sm uppercase text-black/50 font-medium tracking-wider mb-1.5">Title</p>
          <p className="text-lg font-bold tracking-tight">{card.title}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-brand-cream to-brand-cream/50 rounded-2xl p-4 border border-black/5">
            <p className="text-sm uppercase text-black/50 font-medium tracking-wider mb-2">Punches</p>
            <p className="text-3xl font-bold text-brand-charcoal">{card.punchesRequired}</p>
          </div>
          <div className="bg-gradient-to-br from-brand-cream to-brand-cream/50 rounded-2xl p-4 border border-black/5">
            <p className="text-sm uppercase text-black/50 font-medium tracking-wider mb-2">Min sats</p>
            <p className="text-3xl font-bold text-brand-charcoal">{formatSats(card.minSats)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
