import { useEffect } from 'react'

/**
 * Sets the tab title for a page. Each route owns its own title — child effects
 * run before the parent's, so a single title map in <App> would overwrite
 * anything a dynamic route (a job, a company) had already set.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — Shortlist` : 'Shortlist — job portal'
  }, [title])
}
