interface EmptyStateCardProps {
  onCreate: () => void
}

export const EmptyStateCard = ({ onCreate }: EmptyStateCardProps) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 space-y-3">
      <p className="text-black/70 text-sm">
        Create a simple punch card to start tracking loyalty rewards. Bunch keeps punches on this device only.
      </p>
      <button className="w-full py-3 rounded-2xl bg-brand-orange text-white font-semibold text-base" onClick={onCreate}>
        Create card
      </button>
    </div>
  )
}
