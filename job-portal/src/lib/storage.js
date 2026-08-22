// Everything this portal knows lives in localStorage — there is no server.
// Keys are namespaced and versioned so a future schema change can migrate
// instead of silently colliding with old data.

const PREFIX = 'jobportal.'

export const KEYS = {
  theme: `${PREFIX}theme`,
  saved: `${PREFIX}v1.saved`,
  applications: `${PREFIX}v1.applications`,
  postedJobs: `${PREFIX}v1.postedJobs`,
  profile: `${PREFIX}v1.profile`,
  recentSearches: `${PREFIX}v1.recentSearches`,
}

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    const value = JSON.parse(raw)
    return value ?? fallback
  } catch {
    // Corrupt or unavailable storage should degrade to defaults, never crash the app.
    return fallback
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

export function clearAll() {
  Object.values(KEYS).forEach(removeKey)
}
