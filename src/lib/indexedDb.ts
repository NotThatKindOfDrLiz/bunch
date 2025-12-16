import { openDB, type IDBPDatabase } from 'idb'
import type {
  LoyaltyCard,
  MerchantState,
  PunchLedgerEntry,
  PurchaseNonce,
  RedemptionRequest,
  Session,
} from '../types'

const DB_NAME = 'bunch-db'
const DB_VERSION = 1

const STORE_CARD = 'loyalty-card'
const STORE_SESSION = 'session'
const STORE_PURCHASES = 'purchases'
const STORE_LEDGER = 'ledger'
const STORE_REDEMPTIONS = 'redemptions'

let dbPromise: Promise<IDBPDatabase> | null = null

const getDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_CARD)) {
          db.createObjectStore(STORE_CARD, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORE_SESSION)) {
          db.createObjectStore(STORE_SESSION, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORE_PURCHASES)) {
          db.createObjectStore(STORE_PURCHASES, { keyPath: 'nonce' })
        }
        if (!db.objectStoreNames.contains(STORE_LEDGER)) {
          db.createObjectStore(STORE_LEDGER, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORE_REDEMPTIONS)) {
          db.createObjectStore(STORE_REDEMPTIONS, { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export const saveCard = async (card: LoyaltyCard) => {
  const db = await getDB()
  await db.put(STORE_CARD, card)
}

export const getCard = async (): Promise<LoyaltyCard | null> => {
  const db = await getDB()
  const cards = await db.getAll(STORE_CARD)
  return cards[0] ?? null
}

export const deleteCard = async (id: string) => {
  const db = await getDB()
  await db.delete(STORE_CARD, id)
}

export const saveSession = async (session: Session) => {
  const db = await getDB()
  await db.put(STORE_SESSION, session)
}

export const getSession = async (): Promise<Session | null> => {
  const db = await getDB()
  const sessions = await db.getAll(STORE_SESSION)
  return sessions[0] ?? null
}

export const deleteSession = async (id: string) => {
  const db = await getDB()
  await db.delete(STORE_SESSION, id)
}

export const savePurchaseNonce = async (purchase: PurchaseNonce) => {
  const db = await getDB()
  await db.put(STORE_PURCHASES, purchase)
}

export const getPurchaseNonce = async (nonce: string): Promise<PurchaseNonce | undefined> => {
  const db = await getDB()
  return db.get(STORE_PURCHASES, nonce)
}

export const deletePurchaseNonce = async (nonce: string) => {
  const db = await getDB()
  await db.delete(STORE_PURCHASES, nonce)
}

export const saveLedgerEntry = async (entry: PunchLedgerEntry) => {
  const db = await getDB()
  await db.put(STORE_LEDGER, entry)
}

export const getLedgerEntries = async (): Promise<PunchLedgerEntry[]> => {
  const db = await getDB()
  return db.getAll(STORE_LEDGER)
}

export const deleteLedgerEntriesBySession = async (sessionId: string) => {
  const db = await getDB()
  const tx = db.transaction(STORE_LEDGER, 'readwrite')
  const store = tx.store
  let cursor = await store.openCursor()
  while (cursor) {
    if (cursor.value.sessionId === sessionId) {
      await cursor.delete()
    }
    cursor = await cursor.continue()
  }
  await tx.done
}

export const saveRedemptionRequest = async (request: RedemptionRequest) => {
  const db = await getDB()
  await db.put(STORE_REDEMPTIONS, request)
}

export const getRedemptionRequests = async (): Promise<RedemptionRequest[]> => {
  const db = await getDB()
  return db.getAll(STORE_REDEMPTIONS)
}

export const deleteRedemptionRequestsBySession = async (sessionId: string) => {
  const db = await getDB()
  const tx = db.transaction(STORE_REDEMPTIONS, 'readwrite')
  const store = tx.store
  let cursor = await store.openCursor()
  while (cursor) {
    if (cursor.value.sessionId === sessionId) {
      await cursor.delete()
    }
    cursor = await cursor.continue()
  }
  await tx.done
}

export const loadMerchantState = async (): Promise<MerchantState> => {
  const [card, session, pendingPurchases, punchLedger, redemptionRequests] = await Promise.all([
    getCard(),
    getSession(),
    getDB().then((db) => db.getAll(STORE_PURCHASES)),
    getLedgerEntries(),
    getRedemptionRequests(),
  ])

  return {
    card,
    session,
    pendingPurchases,
    punchLedger,
    redemptionRequests,
  }
}

export const clearSessionData = async (sessionId: string) => {
  const db = await getDB()
  const txPurchases = db.transaction(STORE_PURCHASES, 'readwrite')
  let cursor = await txPurchases.store.openCursor()
  while (cursor) {
    if (cursor.value.sessionId === sessionId) {
      await cursor.delete()
    }
    cursor = await cursor.continue()
  }
  await txPurchases.done

  await deleteLedgerEntriesBySession(sessionId)
  await deleteRedemptionRequestsBySession(sessionId)
  const session = await getSession()
  if (session && session.id === sessionId) {
    await deleteSession(sessionId)
  }
}
