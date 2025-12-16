import type { RedemptionRequest } from '../types'
import { formatDateTime } from '../utils/format'

interface RedemptionRequestsPanelProps {
  requests: RedemptionRequest[]
  onConfirm: (requestId: string) => void
}

export const RedemptionRequestsPanel = ({ requests, onConfirm }: RedemptionRequestsPanelProps) => {
  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-black/5">
        <h2 className="text-xl font-bold tracking-tight mb-2">Redemptions</h2>
        <p className="text-sm text-black/50 font-medium">No redemption requests yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4 border border-black/5">
      <h2 className="text-xl font-bold tracking-tight">Redemption requests</h2>
      {requests.map((request) => (
        <div 
          key={request.id} 
          className="border border-black/10 rounded-2xl p-5 flex justify-between items-center bg-gradient-to-br from-white to-brand-cream/20 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="space-y-1">
            <p className="font-bold text-lg tracking-tight">Customer {request.customerId.slice(0, 6)}</p>
            <p className="text-xs text-black/50 font-medium">Requested {formatDateTime(request.requestedAt)}</p>
          </div>
          {request.fulfilledAt ? (
            <span className="text-sm text-brand-green font-bold px-3 py-1.5 bg-brand-green/10 rounded-lg">Fulfilled</span>
          ) : (
            <button
              className="px-5 py-2.5 rounded-xl bg-black text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
              onClick={() => onConfirm(request.id)}
            >
              Confirm redemption
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
