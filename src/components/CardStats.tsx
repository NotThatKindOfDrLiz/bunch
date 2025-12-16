import type { LoyaltyCard } from '../types'
import { formatSats } from '../utils/format'

interface CardStatsProps {
  card: LoyaltyCard
  onDelete: () => void
}

export const CardStats = ({ card, onDelete }: CardStatsProps) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Punch card</h2>
        <button className="text-sm text-brand-red" onClick={onDelete}>
          Remove
        </button>
      </header>
      <div className="space-y-3">
        <div>
          <p className="text-sm uppercase text-black/50">Title</p>
          <p className="text-lg font-semibold">{card.title}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm uppercase text-black/50">Punches</p>
            <p className="text-2xl font-bold">{card.punchesRequired}</p>
          </div>
          <div>
            <p className="text-sm uppercase text-black/50">Min sats</p>
            <p className="text-2xl font-bold">{formatSats(card.minSats)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
