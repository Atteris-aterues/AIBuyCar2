// Lightweight auth token utils using localStorage
const TOKEN_KEY = 'aibuycar_access_token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch (e) {
    return ''
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (e) {}
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch (e) {}
}

export function isAuthenticated() {
  return !!getToken()
}

const CURRENT_USER_KEY = 'aibuycar_current_user'

export function setCurrentUser(user) {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(CURRENT_USER_KEY)
    }
  } catch (e) {}
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export function clearCurrentUser() {
  try {
    localStorage.removeItem(CURRENT_USER_KEY)
  } catch (e) {}
}

export function normalizeAccount(account) {
  return (account == null ? '' : String(account)).trim().toLowerCase()
}

export function getUserKey(user) {
  if (!user) return ''
  if (user.userId !== undefined && user.userId !== null) {
    return `uid_${user.userId}`
  }
  const normalized = normalizeAccount(user.username || user.account || '')
  return normalized ? `user_${normalized}` : ''
}

export function getOnboardKey(user) {
  const key = getUserKey(user)
  return key ? `aibuycar_onboarded_${key}` : ''
}

export function getProfileKey(user) {
  const key = getUserKey(user)
  return key ? `aibuycar_user_profile_${key}` : 'aibuycar_user_profile'
}


