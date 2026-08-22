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

/**
 * Reads a stored value, falling back to `fallback` unless the stored value both
 * parses AND matches the fallback's shape. Parsing alone is not enough: a key
 * holding `"a string"` parses cleanly and then explodes the first time something
 * calls .map() on it. Storage is user-editable, so treat it as untrusted input.
 */
export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    const value = JSON.parse(raw)
    if (value === null || value === undefined) return fallback
    if (Array.isArray(fallback) !== Array.isArray(value)) return fallback
    if (typeof value !== typeof fallback) return fallback
    // Objects must at least be plain objects, not arrays or primitives.
    if (!Array.isArray(fallback) && typeof fallback === 'object') {
      if (typeof value !== 'object') return fallback
      // Merge over the fallback so a partial or pruned object keeps every key.
      return { ...fallback, ...value }
    }
    return value
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
