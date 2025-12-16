const CUSTOMER_ID_KEY = 'bunch:customer-id'
const CUSTOMER_SESSION_KEY = 'bunch:customer-session'
const SESSION_SNAPSHOT_PREFIX = 'bunch:session-snapshot:'

export const getCustomerId = () => {
  return localStorage.getItem(CUSTOMER_ID_KEY)
}

export const setCustomerId = (id: string) => {
  localStorage.setItem(CUSTOMER_ID_KEY, id)
}

export const getCustomerSession = () => {
  const raw = localStorage.getItem(CUSTOMER_SESSION_KEY)
  return raw ? JSON.parse(raw) : null
}

export const setCustomerSession = (session: unknown) => {
  localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session))
}

export const clearCustomerSession = () => {
  localStorage.removeItem(CUSTOMER_SESSION_KEY)
}

export const setSessionSnapshot = (joinCode: string, snapshot: unknown) => {
  localStorage.setItem(SESSION_SNAPSHOT_PREFIX + joinCode, JSON.stringify(snapshot))
}

export const getSessionSnapshot = (joinCode: string) => {
  const raw = localStorage.getItem(SESSION_SNAPSHOT_PREFIX + joinCode)
  return raw ? JSON.parse(raw) : null
}

export const deleteSessionSnapshot = (joinCode: string) => {
  localStorage.removeItem(SESSION_SNAPSHOT_PREFIX + joinCode)
}
