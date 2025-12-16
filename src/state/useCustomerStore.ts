import { useCallback, useEffect, useMemo, useState } from 'react'
import { nanoid } from 'nanoid'
import toast from 'react-hot-toast'
import { useBroadcastChannel } from '../hooks/useBroadcastChannel'
import { useInterval } from '../hooks/useInterval'
import type {
  CustomerSessionState,
  CustomerToMerchantMessage,
  MerchantToCustomerMessage,
  PurchaseNonce,
  SessionSnapshot,
} from '../types'
import {
  getCustomerId,
  setCustomerId,
  getCustomerSession,
  setCustomerSession,
  clearCustomerSession,
  getSessionSnapshot,
  setSessionSnapshot,
  deleteSessionSnapshot,
} from '../lib/storage'

const MERCHANT_CHANNEL = 'bunch:merchant'
const CUSTOMER_CHANNEL = 'bunch:customer'

type SessionUpdater =
  | CustomerSessionState
  | null
  | ((prev: CustomerSessionState | null) => CustomerSessionState | null)

interface UseCustomerStoreResult {
  state: CustomerSessionState | null
  ensureCustomerId: () => string
  joinSessionViaSnapshot: (snapshot: SessionSnapshot) => Promise<void>
  handlePurchaseScan: (purchase: PurchaseNonce) => Promise<void>
  requestRedemption: () => void
  leaveSession: () => void
}

const PERSISTED_PROGRESS_KEY = 'bunch:customer-progress'

export const useCustomerStore = (): UseCustomerStoreResult => {
  const [state, setState] = useState<CustomerSessionState | null>(() => getCustomerSession())
  
  // Debug: Log state changes
  useEffect(() => {
    console.log('[Customer] State changed:', state)
  }, [state])

  const ensureCustomerId = useCallback(() => {
    let id = getCustomerId()
    if (!id) {
      id = nanoid()
      setCustomerId(id)
    }
    return id
  }, [])

  useEffect(() => {
    ensureCustomerId()
  }, [ensureCustomerId])

  const persistState = useCallback((updater: SessionUpdater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      // CRITICAL: If updater returns prev unchanged, React won't re-render
      // We need to ensure we always return a new object reference when state should update
      if (next && prev && next === prev) {
        // This shouldn't happen if updater creates new objects, but if it does,
        // we need to create a new reference to force React to detect the change
        console.warn('[Customer] persistState - updater returned same reference, forcing new object')
        return { ...next }
      }
      if (next) {
        setCustomerSession(next)
        setSessionSnapshot(next.joinCode, next)
      } else if (prev) {
        clearCustomerSession()
        deleteSessionSnapshot(prev.joinCode)
      }
      return next
    })
  }, [])

  const sendToMerchant = useBroadcastChannel<CustomerToMerchantMessage>(CUSTOMER_CHANNEL, () => {})

  useBroadcastChannel<MerchantToCustomerMessage>(MERCHANT_CHANNEL, (message) => {
    switch (message.type) {
      case 'merchant:session-update': {
        persistState((prev) => {
          if (!prev || prev.sessionId !== message.payload.session.id) return prev
          // Always update punchesRequired from the merchant's current card data
          const updated = {
            ...prev,
            sessionId: message.payload.session.id,
            cardId: message.payload.card.id,
            cardTitle: message.payload.card.title,
            punchesRequired: message.payload.card.punchesRequired, // Use merchant's current card
            minSats: message.payload.card.minSats,
            demoMode: message.payload.session.demoMode,
            joinCode: message.payload.session.joinCode,
            lastUpdatedAt: Date.now(),
          }
          console.log('Session update received - punchesRequired:', updated.punchesRequired) // Debug
          return updated
        })
        break
      }
      case 'merchant:punch-awarded': {
        console.log('[Customer] merchant:punch-awarded received:', message.payload)
        persistState((prev) => {
          console.log('[Customer] Current state:', prev)
          if (!prev || prev.sessionId !== message.payload.sessionId) {
            console.log('[Customer] No update - wrong session or no state')
            return prev
          }
          // Only update if this punch is for this customer
          if (prev.customerId !== message.payload.customerId) {
            console.log('[Customer] No update - wrong customerId', { prev: prev.customerId, msg: message.payload.customerId })
            return prev
          }
          // Always create a new object to ensure React detects the change
          const updated = {
            ...prev,
            punchesEarned: message.payload.punchesEarned,
            punchesRequired: message.payload.punchesRequired ?? prev.punchesRequired,
            lastUpdatedAt: Date.now(),
          }
          console.log('[Customer] Updating state - punchesEarned:', updated.punchesEarned, 'prev:', prev.punchesEarned)
          // Force state update even if values appear the same (React needs new reference)
          return updated
        })
        toast.success('Punch added!')
        break
      }
      case 'merchant:redemption-update': {
        persistState((prev) => {
          if (!prev || prev.sessionId !== message.payload.sessionId) return prev
          if (message.payload.status === 'fulfilled') {
            toast.success('Reward fulfilled')
            return {
              ...prev,
              punchesEarned: 0,
              lastUpdatedAt: Date.now(),
            }
          }
          return prev
        })
        break
      }
      case 'merchant:session-ended': {
        toast('Session ended by merchant', { icon: 'ℹ️' })
        persistState(null)
        break
      }
      case 'merchant:punch-sync': {
        console.log('[Customer] merchant:punch-sync received:', message.payload)
        persistState((prev) => {
          console.log('[Customer] punch-sync - prev:', prev)
          if (!prev || prev.sessionId !== message.payload.sessionId) {
            console.log('[Customer] punch-sync - no update (wrong session)')
            return prev
          }
          if (prev.customerId !== message.payload.customerId) {
            console.log('[Customer] punch-sync - no update (wrong customer)', { prev: prev.customerId, msg: message.payload.customerId })
            return prev
          }
          // Always update to ensure React detects the change, even if values are the same
          // This fixes the issue where React doesn't re-render when state appears unchanged
          const updated = {
            ...prev,
            punchesEarned: message.payload.punchesEarned,
            punchesRequired: message.payload.punchesRequired ?? prev.punchesRequired,
            lastUpdatedAt: Date.now(),
          }
          console.log('[Customer] punch-sync - updating:', { prev: prev.punchesEarned, next: updated.punchesEarned })
          return updated
        })
        break
      }
    }
  })

  useEffect(() => {
    const stored = localStorage.getItem(PERSISTED_PROGRESS_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as { joinCode: string } | null
      if (parsed && !state) {
        const snapshot = getSessionSnapshot(parsed.joinCode)
        if (snapshot) {
          void joinSessionViaSnapshot(snapshot)
        }
      }
    } catch (error) {
      // ignore parsing errors
    }
  }, [])

  useEffect(() => {
    if (!state) {
      localStorage.removeItem(PERSISTED_PROGRESS_KEY)
      return
    }
    localStorage.setItem(
      PERSISTED_PROGRESS_KEY,
      JSON.stringify({
        sessionId: state.sessionId,
        joinCode: state.joinCode,
      }),
    )
  }, [state])

  // Poll for punch updates every 2 seconds when in a session
  // This works across devices since it sends a sync request
  useInterval(() => {
    if (!state) return
    sendToMerchant.send({
      type: 'customer:sync-request',
      payload: {
        sessionId: state.sessionId,
        customerId: state.customerId,
      },
    })
  }, state ? 2000 : null)

  const joinSessionViaSnapshot = useCallback(
    async (snapshot: SessionSnapshot) => {
      const customerId = ensureCustomerId()
      const sessionState: CustomerSessionState = {
        ...snapshot,
        customerId,
        punchesEarned: 0,
        purchaseNonces: [],
        lastUpdatedAt: Date.now(),
      }
      persistState(sessionState)
      sendToMerchant.send({
        type: 'customer:join-request',
        payload: {
          sessionId: snapshot.sessionId,
          cardId: snapshot.cardId,
          customerId,
          joinCode: snapshot.joinCode,
        },
      })
      toast.success(`Joined ${snapshot.cardTitle}`)
    },
    [ensureCustomerId, persistState, sendToMerchant],
  )

  const handlePurchaseScan = useCallback(
    async (purchase: PurchaseNonce) => {
      persistState((prev) => {
        if (!prev || prev.sessionId !== purchase.sessionId) {
          toast.error('Wrong session')
          return prev
        }
        if (purchase.expiresAt < Date.now()) {
          toast.error('QR expired')
          return prev
        }
        if (prev.purchaseNonces.includes(purchase.nonce)) {
          toast('Already scanned', { icon: 'ℹ️' })
          return prev
        }
        sendToMerchant.send({
          type: 'customer:purchase-claimed',
          payload: {
            sessionId: prev.sessionId,
            cardId: prev.cardId,
            customerId: prev.customerId,
            purchaseNonce: purchase.nonce,
          },
        })
        toast('Waiting for merchant…', { icon: '⏳' })
        return {
          ...prev,
          purchaseNonces: [...prev.purchaseNonces, purchase.nonce],
          lastUpdatedAt: Date.now(),
        }
      })
    },
    [sendToMerchant, persistState],
  )

  const requestRedemption = useCallback(() => {
    if (!state) return
    if (state.punchesEarned < state.punchesRequired) {
      toast.error('Need more punches')
      return
    }
    sendToMerchant.send({
      type: 'customer:redeem-request',
      payload: {
        sessionId: state.sessionId,
        cardId: state.cardId,
        customerId: state.customerId,
      },
    })
    toast.success('Requested reward')
  }, [sendToMerchant, state])

  const leaveSession = useCallback(() => {
    if (state) {
      sendToMerchant.send({
        type: 'customer:leave',
        payload: {
          sessionId: state.sessionId,
          customerId: state.customerId,
        },
      })
    }
    persistState(null)
    toast('Session cleared', { icon: '👋' })
  }, [persistState, sendToMerchant, state])

  return useMemo(
    () => ({
      state,
      ensureCustomerId,
      joinSessionViaSnapshot,
      handlePurchaseScan,
      requestRedemption,
      leaveSession,
    }),
    [ensureCustomerId, handlePurchaseScan, joinSessionViaSnapshot, leaveSession, requestRedemption, state],
  )
}
