import { useCallback, useEffect, useMemo, useState } from 'react'
import { nanoid } from 'nanoid'
import toast from 'react-hot-toast'
import type {
  CustomerToMerchantMessage,
  LoyaltyCard,
  MerchantState,
  MerchantToCustomerMessage,
  PunchLedgerEntry,
  PurchaseNonce,
  RedemptionRequest,
  Session,
} from '../types'
import {
  clearSessionData,
  deleteCard,
  deleteLedgerEntriesBySession,
  deleteRedemptionRequestsBySession,
  deleteSession,
  getCard,
  getLedgerEntries,
  getPurchaseNonce,
  getSession,
  loadMerchantState,
  saveCard,
  saveLedgerEntry,
  savePurchaseNonce,
  saveRedemptionRequest,
  saveSession,
} from '../lib/indexedDb'
import { useBroadcastChannel } from '../hooks/useBroadcastChannel'
import { deleteSessionSnapshot, setSessionSnapshot } from '../lib/storage'

const MERCHANT_CHANNEL = 'bunch:merchant'
const CUSTOMER_CHANNEL = 'bunch:customer'

interface UseMerchantStoreResult extends MerchantState {
  createCard: (input: Pick<LoyaltyCard, 'title' | 'punchesRequired' | 'minSats'>) => Promise<void>
  updateCard: (update: Partial<LoyaltyCard>) => Promise<void>
  deleteCard: () => Promise<void>
  startSession: (demoMode: boolean) => Promise<void>
  endSession: () => Promise<void>
  generatePurchaseNonce: () => Promise<PurchaseNonce | null>
  markPaid: (nonce: string, customerId?: string) => Promise<void>
  fulfillRedemption: (requestId: string) => Promise<void>
  toggleDemoMode: () => Promise<void>
}

const TEN_MINUTES = 10 * 60 * 1000

const MERCHANT_STATUS_KEY = 'bunch:merchant-status'

interface MerchantStatusCache {
  sessionId: string
  punchesAwarded: number
  pendingRedemptions: number
}

const saveStatusCache = (status: MerchantStatusCache) => {
  localStorage.setItem(MERCHANT_STATUS_KEY, JSON.stringify(status))
}

const clearStatusCache = () => {
  localStorage.removeItem(MERCHANT_STATUS_KEY)
}

const withoutExpired = <T extends { expiresAt?: number }>(items: T[]) =>
  items.filter((item) => !item.expiresAt || item.expiresAt > Date.now())

export const useMerchantStore = (): UseMerchantStoreResult => {
  const [state, setState] = useState<MerchantState>({
    card: null,
    session: null,
    pendingPurchases: [],
    punchLedger: [],
    redemptionRequests: [],
  })

  const refresh = useCallback(async () => {
    const data = await loadMerchantState()
    setState({
      ...data,
      pendingPurchases: withoutExpired(data.pendingPurchases.filter((p) => !p.redeemedAt)),
    })
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const merchantBroadcast = useBroadcastChannel<MerchantToCustomerMessage>(
    MERCHANT_CHANNEL,
    useCallback(
      (message) => {
        if (message.type === 'merchant:session-ended') {
          toast('Session ended', { icon: 'ℹ️' })
        }
        void refresh()
      },
      [refresh],
    ),
  )

  useBroadcastChannel<CustomerToMerchantMessage>(
    CUSTOMER_CHANNEL,
    useCallback(
      async (message) => {
        switch (message.type) {
          case 'customer:purchase-claimed': {
            const purchase = await getPurchaseNonce(message.payload.purchaseNonce)
            if (!purchase) {
              console.log('[Merchant] customer:purchase-claimed - purchase not found:', message.payload.purchaseNonce)
              // Get all pending purchases to help debug
              const session = await getSession()
              if (session) {
                // Get pending purchases from state (already loaded)
                const pending = state.pendingPurchases.filter(p => !p.redeemedAt && p.sessionId === session.id)
                console.log('[Merchant] Available pending purchases:', pending.map(p => ({ nonce: p.nonce, expiresAt: new Date(p.expiresAt).toLocaleTimeString() })))
                if (pending.length === 0) {
                  console.log('[Merchant] No pending purchases! Merchant needs to generate a purchase QR first.')
                }
              }
              return
            }
            // Only update if not already claimed by this customer
            if (purchase.customerId && purchase.customerId !== message.payload.customerId) {
              console.log('[Merchant] customer:purchase-claimed - already claimed by different customer')
              return
            }
            if (!purchase.customerId) {
              console.log('[Merchant] customer:purchase-claimed - claiming purchase:', message.payload.purchaseNonce, 'for customer:', message.payload.customerId)
            }
            await savePurchaseNonce({
              ...purchase,
              customerId: message.payload.customerId,
              claimedAt: Date.now(),
            })
            toast('Customer waiting for confirmation', { icon: '👀' })
            void refresh()
            break
          }
          case 'customer:redeem-request': {
            const session = await getSession()
            if (!session || session.id !== message.payload.sessionId) return
            const request: RedemptionRequest = {
              id: nanoid(),
              sessionId: message.payload.sessionId,
              cardId: message.payload.cardId,
              customerId: message.payload.customerId,
              requestedAt: Date.now(),
            }
            await saveRedemptionRequest(request)
            toast.success('Customer requested a reward')
            void refresh()
            break
          }
          case 'customer:join-request': {
            const session = await getSession()
            const card = await getCard()
            if (!session || !card) return
            if (session.joinCode !== message.payload.joinCode) return
            
            // Send session update first
            merchantBroadcast.send({ type: 'merchant:session-update', payload: { session, card } })
            
            // Get fresh ledger entries from IndexedDB to ensure accurate count
            const allLedgerEntries = await getLedgerEntries()
            const customerPunches = allLedgerEntries.filter(e => e.customerId === message.payload.customerId).length
            if (customerPunches > 0) {
              merchantBroadcast.send({
                type: 'merchant:punch-awarded',
                payload: {
                  sessionId: session.id,
                  cardId: card.id,
                  customerId: message.payload.customerId,
                  punchesEarned: customerPunches,
                  punchesRequired: card.punchesRequired,
                },
              })
            }
            break
          }
          case 'customer:leave': {
            toast('Customer left session', { icon: '👋' })
            break
          }
          case 'customer:sync-request': {
            const session = await getSession()
            const card = await getCard()
            if (!session || !card) return
            if (session.id !== message.payload.sessionId) return
            
            // Get fresh ledger entries from IndexedDB to ensure accurate count
            const allLedgerEntries = await getLedgerEntries()
            const customerPunches = allLedgerEntries.filter(e => e.customerId === message.payload.customerId).length
            console.log('[Merchant] customer:sync-request - customerId:', message.payload.customerId, 'allEntries:', allLedgerEntries.length, 'customerPunches:', customerPunches)
            console.log('[Merchant] Filtered entries:', allLedgerEntries.filter(e => e.customerId === message.payload.customerId))
            merchantBroadcast.send({
              type: 'merchant:punch-sync',
              payload: {
                sessionId: session.id,
                customerId: message.payload.customerId,
                punchesEarned: customerPunches,
                punchesRequired: card.punchesRequired,
              },
            })
            break
          }
          default:
            break
        }
      },
      [merchantBroadcast, refresh],
    ),
  )

  const createCard = useCallback(
    async (input: Pick<LoyaltyCard, 'title' | 'punchesRequired' | 'minSats'>) => {
      const newCard: LoyaltyCard = {
        id: nanoid(),
        title: input.title,
        punchesRequired: input.punchesRequired,
        minSats: input.minSats,
        createdAt: Date.now(),
        lastUpdatedAt: Date.now(),
      }
      await saveCard(newCard)
      toast.success('Loyalty card saved')
      void refresh()
    },
    [refresh],
  )

  const updateCard = useCallback(
    async (update: Partial<LoyaltyCard>) => {
      if (!state.card) return
      const updated: LoyaltyCard = {
        ...state.card,
        ...update,
        lastUpdatedAt: Date.now(),
      }
      await saveCard(updated)
      
      // If there's an active session, update the session snapshot with new card data
      if (state.session) {
        const card = await getCard()
        if (card) {
          setSessionSnapshot(state.session.joinCode, {
            sessionId: state.session.id,
            cardId: card.id,
            cardTitle: card.title,
            punchesRequired: card.punchesRequired,
            minSats: card.minSats,
            demoMode: state.session.demoMode,
            joinCode: state.session.joinCode,
            issuedAt: Date.now(),
          })
          // Send updated card data to all customers
          merchantBroadcast.send({ type: 'merchant:session-update', payload: { session: state.session, card } })
        }
      }
      
      toast.success('Card updated')
      void refresh()
    },
    [state.card, state.session, merchantBroadcast, refresh],
  )

  const deleteCardAction = useCallback(async () => {
    if (!state.card) return
    await deleteCard(state.card.id)
    toast.success('Card deleted')
    void refresh()
  }, [state.card, refresh])

  const startSession = useCallback(
    async (demoMode: boolean) => {
      const card = await getCard()
      if (!card) {
        toast.error('Create a card first')
        return
      }
      const existing = await getSession()
      if (existing) {
        await clearSessionData(existing.id)
      }
      const session: Session = {
        id: nanoid(),
        cardId: card.id,
        active: true,
        joinCode: Math.random().toString(36).substring(2, 6).toUpperCase(),
        demoMode,
        createdAt: Date.now(),
      }
      await saveSession(session)
      setSessionSnapshot(session.joinCode, {
        sessionId: session.id,
        cardId: card.id,
        cardTitle: card.title,
        punchesRequired: card.punchesRequired,
        minSats: card.minSats,
        demoMode: session.demoMode,
        joinCode: session.joinCode,
        issuedAt: Date.now(),
      })
      merchantBroadcast.send({ type: 'merchant:session-update', payload: { session, card } })
      toast.success('Session started')
      void refresh()
    },
    [merchantBroadcast, refresh],
  )

  const endSession = useCallback(async () => {
    const session = await getSession()
    if (!session) return
    await clearSessionData(session.id)
    await deleteSession(session.id)
    await deleteLedgerEntriesBySession(session.id)
    await deleteRedemptionRequestsBySession(session.id)
    merchantBroadcast.send({ type: 'merchant:session-ended', payload: { sessionId: session.id } })
    toast('Session ended', { icon: '👋' })
    deleteSessionSnapshot(session.joinCode)
    clearStatusCache()
    void refresh()
  }, [merchantBroadcast, refresh])

  const generatePurchaseNonce = useCallback(async () => {
    const session = await getSession()
    const card = await getCard()
    if (!session || !card) {
      toast.error('Start a session first')
      return null
    }
    const nonce: PurchaseNonce = {
      nonce: nanoid(),
      sessionId: session.id,
      cardId: card.id,
      minSats: card.minSats,
      createdAt: Date.now(),
      expiresAt: Date.now() + TEN_MINUTES,
    }
    await savePurchaseNonce(nonce)
    toast('Purchase QR ready', { icon: '📱' })
    void refresh()
    return nonce
  }, [refresh])

  const recordLedgerEntry = async (
    purchase: PurchaseNonce,
    customerId: string,
  ): Promise<PunchLedgerEntry> => {
    const entry: PunchLedgerEntry = {
      id: nanoid(),
      sessionId: purchase.sessionId,
      cardId: purchase.cardId,
      customerId,
      purchaseNonce: purchase.nonce,
      awardedAt: Date.now(),
    }
    await saveLedgerEntry(entry)
    return entry
  }

  const markPaid = useCallback(
    async (nonce: string, customerId?: string) => {
      const purchase = await getPurchaseNonce(nonce)
      if (!purchase) {
        toast.error('Purchase not found or already used')
        return
      }
      if (purchase.redeemedAt) {
        toast.error('Nonce already redeemed')
        return
      }
      if (purchase.expiresAt < Date.now()) {
        toast.error('Nonce expired')
        return
      }
      const card = await getCard()
      if (!card) return
      // Use the customerId from the purchase if it was claimed, otherwise we can't award it
      // If purchase wasn't claimed, we need to wait for customer to claim it first
      const awardCustomerId = customerId ?? purchase.customerId
      if (!awardCustomerId) {
        toast.error('Purchase not claimed by customer yet. Customer must scan/enter code first.')
        return
      }
      
      console.log('[Merchant] markPaid - awardCustomerId:', awardCustomerId, 'purchase.customerId:', purchase.customerId)
      const entry = await recordLedgerEntry(purchase, awardCustomerId)
      console.log('[Merchant] markPaid - created entry:', entry)
      await savePurchaseNonce({ ...purchase, redeemedAt: Date.now(), customerId: awardCustomerId })
      
      // Get fresh ledger entries from IndexedDB to ensure accurate count
      const allLedgerEntries = await getLedgerEntries()
      const customerPunches = allLedgerEntries.filter(e => e.customerId === awardCustomerId).length
      console.log('[Merchant] markPaid - allEntries:', allLedgerEntries.length, 'customerPunches:', customerPunches)
      console.log('[Merchant] markPaid - filtered entries:', allLedgerEntries.filter(e => e.customerId === awardCustomerId))
      
      // Send the punch award message BEFORE refresh so customer gets it immediately
      merchantBroadcast.send({
        type: 'merchant:punch-awarded',
        payload: {
          sessionId: entry.sessionId,
          cardId: entry.cardId,
          customerId: entry.customerId,
          punchesEarned: customerPunches,
          punchesRequired: card.punchesRequired,
        },
      })
      console.log('[Merchant] markPaid - sent punch-awarded:', { customerId: entry.customerId, punchesEarned: customerPunches })
      toast.success('Punch awarded')
      void refresh()
    },
    [merchantBroadcast, refresh],
  )

  const fulfillRedemption = useCallback(
    async (requestId: string) => {
      const request = state.redemptionRequests.find((r) => r.id === requestId)
      if (!request) return
      await saveRedemptionRequest({ ...request, fulfilledAt: Date.now() })
      merchantBroadcast.send({
        type: 'merchant:redemption-update',
        payload: {
          sessionId: request.sessionId,
          cardId: request.cardId,
          customerId: request.customerId,
          status: 'fulfilled',
        },
      })
      toast.success('Reward redeemed')
      void refresh()
    },
    [merchantBroadcast, refresh, state.redemptionRequests],
  )

  const toggleDemoMode = useCallback(async () => {
    const session = await getSession()
    const card = await getCard()
    if (!session || !card) return
    const updated = { ...session, demoMode: !session.demoMode }
    await saveSession(updated)
    merchantBroadcast.send({ type: 'merchant:session-update', payload: { session: updated, card } })
    toast.success(`Demo mode ${updated.demoMode ? 'enabled' : 'disabled'}`)
    void refresh()
  }, [merchantBroadcast, refresh])

  useEffect(() => {
    if (!state.session) {
      clearStatusCache()
      return
    }
    const status: MerchantStatusCache = {
      sessionId: state.session.id,
      punchesAwarded: state.punchLedger.length,
      pendingRedemptions: state.redemptionRequests.filter((r) => !r.fulfilledAt).length,
    }
    saveStatusCache(status)
  }, [state.session, state.punchLedger.length, state.redemptionRequests])

  const value = useMemo(
    () => ({
      ...state,
      createCard,
      updateCard,
      deleteCard: deleteCardAction,
      startSession,
      endSession,
      generatePurchaseNonce,
      markPaid,
      fulfillRedemption,
      toggleDemoMode,
    }),
    [
      state,
      createCard,
      updateCard,
      deleteCardAction,
      startSession,
      endSession,
      generatePurchaseNonce,
      markPaid,
      fulfillRedemption,
      toggleDemoMode,
    ],
  )

  return value
}
