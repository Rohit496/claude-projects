import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { KEYS, readJSON, writeJSON, clearAll } from '../lib/storage.js'
import { allJobs, hydrateJob } from '../lib/jobs.js'

const AppContext = createContext(null)

// A profile with real defaults, so fit scores mean something on a first visit.
// Name and email stay blank — the apply form asks for those rather than inventing them.
export const DEFAULT_PROFILE = {
  name: '',
  email: '',
  phone: '',
  headline: 'Frontend engineer',
  location: 'Bengaluru',
  level: 'mid',
  workModes: ['remote', 'hybrid'],
  minSalary: 20,
  skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Accessibility', 'Testing', 'GraphQL', 'Design systems', 'Node.js', 'Git'],
  portfolio: '',
  summary: '',
}

function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => readJSON(key, initial))
  useEffect(() => {
    writeJSON(key, value)
  }, [key, value])
  return [value, setValue]
}

const newId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`

export function AppProvider({ children }) {
  const [theme, setThemeState] = useState(
    () => document.documentElement.dataset.theme || 'light',
  )
  const [profile, setProfile] = usePersistentState(KEYS.profile, DEFAULT_PROFILE)
  const [savedIds, setSavedIds] = usePersistentState(KEYS.saved, [])
  const [applications, setApplications] = usePersistentState(KEYS.applications, [])
  const [postedJobs, setPostedJobs] = usePersistentState(KEYS.postedJobs, [])
  const [recentSearches, setRecentSearches] = usePersistentState(KEYS.recentSearches, [])
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  // Theme lives on <html> so CSS can switch tokens; the inline script in index.html
  // has already applied it once before first paint.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    writeJSON(KEYS.theme, theme)
  }, [theme])

  useEffect(() => {
    const map = timers.current
    return () => {
      map.forEach((id) => clearTimeout(id))
      map.clear()
    }
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const pushToast = useCallback(
    (message, options = {}) => {
      const id = newId('toast')
      setToasts((list) => [...list.slice(-2), { id, message, tone: options.tone || 'default', action: options.action }])
      const timer = setTimeout(() => dismissToast(id), options.duration ?? 4500)
      timers.current.set(id, timer)
      return id
    },
    [dismissToast],
  )

  const jobs = useMemo(() => allJobs(postedJobs), [postedJobs])

  const isSaved = useCallback((jobId) => savedIds.includes(jobId), [savedIds])

  // The toast must fire outside the state updater: React invokes updaters twice
  // in development to surface impurity, which would announce every save twice.
  const toggleSave = useCallback(
    (job) => {
      const has = savedIds.includes(job.id)
      setSavedIds(has ? savedIds.filter((id) => id !== job.id) : [job.id, ...savedIds])
      pushToast(has ? `Removed ${job.title} from saved` : `Saved ${job.title}`, {
        tone: has ? 'default' : 'success',
      })
    },
    [savedIds, pushToast, setSavedIds],
  )

  const hasApplied = useCallback(
    (jobId) => applications.some((application) => application.jobId === jobId),
    [applications],
  )

  const applyToJob = useCallback(
    (job, form) => {
      if (applications.some((a) => a.jobId === job.id)) return null
      const application = {
        id: newId('app'),
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        companyId: job.companyId,
        location: job.location,
        workMode: job.workMode,
        salary: job.salary,
        stage: 'applied',
        appliedAt: Date.now(),
        updatedAt: Date.now(),
        ...form,
      }
      setApplications((list) => [application, ...list])
      // The apply form is the most complete profile the candidate will type; keep it.
      setProfile((current) => ({
        ...current,
        name: form.name || current.name,
        email: form.email || current.email,
        phone: form.phone || current.phone,
        portfolio: form.portfolio || current.portfolio,
      }))
      pushToast(`Application sent to ${job.company}`, { tone: 'success' })
      return application
    },
    [applications, pushToast, setApplications, setProfile],
  )

  const setApplicationStage = useCallback(
    (id, stage) => {
      setApplications((list) =>
        list.map((application) =>
          application.id === id ? { ...application, stage, updatedAt: Date.now() } : application,
        ),
      )
    },
    [setApplications],
  )

  const withdrawApplication = useCallback(
    (id) => {
      const application = applications.find((a) => a.id === id)
      setApplications((list) => list.filter((a) => a.id !== id))
      if (application) pushToast(`Withdrew your application to ${application.company}`)
    },
    [applications, pushToast, setApplications],
  )

  const postJob = useCallback(
    (draft) => {
      const job = {
        ...draft,
        id: newId('own'),
        postedDaysAgo: 0,
        closesInDays: Number(draft.closesInDays) || 30,
        applicants: 0,
        postedByMe: true,
      }
      setPostedJobs((list) => [job, ...list])
      pushToast(`${job.title} is live on the board`, { tone: 'success' })
      return hydrateJob(job)
    },
    [pushToast, setPostedJobs],
  )

  const removePostedJob = useCallback(
    (id) => {
      setPostedJobs((list) => list.filter((job) => job.id !== id))
      setSavedIds((list) => list.filter((savedId) => savedId !== id))
      pushToast('Listing taken down')
    },
    [pushToast, setPostedJobs, setSavedIds],
  )

  const updateProfile = useCallback(
    (patch) => setProfile((current) => ({ ...current, ...patch })),
    [setProfile],
  )

  const rememberSearch = useCallback(
    (term) => {
      const clean = term.trim()
      if (!clean) return
      setRecentSearches((list) => [clean, ...list.filter((item) => item !== clean)].slice(0, 6))
    },
    [setRecentSearches],
  )

  const resetEverything = useCallback(() => {
    clearAll()
    setProfile(DEFAULT_PROFILE)
    setSavedIds([])
    setApplications([])
    setPostedJobs([])
    setRecentSearches([])
    pushToast('Local data cleared')
  }, [pushToast, setApplications, setPostedJobs, setProfile, setRecentSearches, setSavedIds])

  const value = useMemo(
    () => ({
      theme,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')),
      profile,
      updateProfile,
      jobs,
      savedIds,
      savedJobs: savedIds.map((id) => jobs.find((job) => job.id === id)).filter(Boolean),
      isSaved,
      toggleSave,
      applications,
      hasApplied,
      applyToJob,
      setApplicationStage,
      withdrawApplication,
      postedJobs,
      postJob,
      removePostedJob,
      recentSearches,
      rememberSearch,
      toasts,
      pushToast,
      dismissToast,
      resetEverything,
    }),
    [
      theme, profile, updateProfile, jobs, savedIds, isSaved, toggleSave, applications, hasApplied,
      applyToJob, setApplicationStage, withdrawApplication, postedJobs, postJob, removePostedJob,
      recentSearches, rememberSearch, toasts, pushToast, dismissToast, resetEverything,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside <AppProvider>')
  return context
}
