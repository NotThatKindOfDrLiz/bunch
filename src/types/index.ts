/**
 * Shared type definitions for Bunch merchant and customer experiences.
 */

export type UUID = string

export interface LoyaltyCard {
  id: UUID
  title: string
  punchesRequired: number
  minSats: number
  createdAt: number
  lastUpdatedAt: number
}

export interface Session {
  id: UUID
  cardId: UUID
  active: boolean
  joinCode: string
  demoMode: boolean
  createdAt: number
  expiresAt?: number
}

export interface SessionSnapshot {
  sessionId: UUID
  cardId: UUID
  cardTitle: string
  punchesRequired: number
  minSats: number
  demoMode: boolean
  joinCode: string
  issuedAt: number
}

export interface PurchaseNonce {
  nonce: string
  sessionId: UUID
  cardId: UUID
  minSats: number
  createdAt: number
  expiresAt: number
  customerId?: UUID
  claimedAt?: number
  redeemedAt?: number
  // BTCPay Server integration
  btcpayInvoiceId?: string
  btcpayCheckoutLink?: string
  btcpayStatus?: 'New' | 'Processing' | 'Expired' | 'Invalid' | 'Settled' | 'Paid'
}

export interface PunchLedgerEntry {
  id: UUID
  sessionId: UUID
  cardId: UUID
  customerId: UUID
  purchaseNonce: string
  awardedAt: number
}

export interface RedemptionRequest {
  id: UUID
  sessionId: UUID
  cardId: UUID
  customerId: UUID
  requestedAt: number
  fulfilledAt?: number
}

export interface MerchantState {
  card: LoyaltyCard | null
  session: Session | null
  pendingPurchases: PurchaseNonce[]
  punchLedger: PunchLedgerEntry[]
  redemptionRequests: RedemptionRequest[]
}

export interface CustomerSessionState extends SessionSnapshot {
  customerId: UUID
  punchesEarned: number
  purchaseNonces: string[]
  lastUpdatedAt: number
}

// Broadcast messaging -------------------------------------------------------

export type MerchantToCustomerMessage =
  | {
      type: 'merchant:session-update'
      payload: { session: Session; card: LoyaltyCard }
    }
  | {
      type: 'merchant:punch-awarded'
      payload: {
        sessionId: UUID
        cardId: UUID
        customerId: UUID
        punchesEarned: number
        punchesRequired: number
      }
    }
  | {
      type: 'merchant:redemption-update'
      payload: {
        sessionId: UUID
        cardId: UUID
        customerId: UUID
        status: 'requested' | 'fulfilled'
      }
    }
  | {
      type: 'merchant:session-ended'
      payload: { sessionId: UUID }
    }
  | {
      type: 'merchant:punch-sync'
      payload: {
        sessionId: UUID
        customerId: UUID
        punchesEarned: number
        punchesRequired: number
      }
    }

export type CustomerToMerchantMessage =
  | {
      type: 'customer:purchase-claimed'
      payload: {
        sessionId: UUID
        cardId: UUID
        customerId: UUID
        purchaseNonce: string
      }
    }
  | {
      type: 'customer:join-request'
      payload: {
        sessionId: UUID
        cardId: UUID
        customerId: UUID
        joinCode: string
      }
    }
  | {
      type: 'customer:redeem-request'
      payload: {
        sessionId: UUID
        cardId: UUID
        customerId: UUID
      }
    }
  | {
      type: 'customer:leave'
      payload: {
        sessionId: UUID
        customerId: UUID
      }
    }
  | {
      type: 'customer:sync-request'
      payload: {
        sessionId: UUID
        customerId: UUID
      }
    }
