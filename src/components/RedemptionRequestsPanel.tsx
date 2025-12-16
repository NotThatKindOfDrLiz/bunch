import type { RedemptionRequest } from '../types'
import { formatDateTime } from '../utils/format'

interface RedemptionRequestsPanelProps {
  requests: RedemptionRequest[]
  onConfirm: (requestId: string) => void
}

export const RedemptionRequestsPanel = ({ requests, onConfirm }: RedemptionRequestsPanelProps) => {
  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-2">Redemptions</h2>
        <p className="text-sm text-black/50">No redemption requests yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-semibold">Redemption requests</h2>
      {requests.map((request) => (
        <div key={request.id} className="border border-black/10 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <p className="font-semibold">Customer {request.customerId.slice(0, 6)}</p>
            <p className="text-xs text-black/50">Requested {formatDateTime(request.requestedAt)}</p>
          </div>
          {request.fulfilledAt ? (
            <span className="text-sm text-green-600 font-semibold">Fulfilled</span>
          ) : (
            <button
              className="px-4 py-2 rounded-xl bg-black text-white text-sm font-semibold"
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
