interface EmptyStateCardProps {
  onCreate: () => void
}

export const EmptyStateCard = ({ onCreate }: EmptyStateCardProps) => {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4 border border-black/5">
      <p className="text-black/70 text-sm leading-relaxed">
        Create a simple punch card to start tracking loyalty rewards. Bunch keeps punches on this device only.
      </p>
      <button 
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-orange to-orange-500 text-white font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" 
        onClick={onCreate}
      >
        Create card
      </button>
    </div>
  )
}
