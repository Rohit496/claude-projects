import { useDocumentTitle } from '../lib/useDocumentTitle.js'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../store/AppStore.jsx'
import { EMPTY_FILTERS, filterJobs, sortJobs, activeFilterCount } from '../lib/filters.js'
import { SORTS } from '../data/taxonomy.js'
import JobCard from '../components/JobCard.jsx'
import JobDetail from '../components/JobDetail.jsx'
import Filters from '../components/Filters.jsx'
import ApplyDialog from '../components/ApplyDialog.jsx'
import { ConfirmDialog } from '../components/Dialog.jsx'
import { SearchIcon, PinIcon, FilterIcon, CloseIcon, InboxIcon } from '../components/Icons.jsx'

// Facet counts are computed against everything *except* the facet being counted,
// so ticking "Remote" does not zero out the other work-mode counts.
function facetCounts(jobs, filters, profile) {
  const count = (key, values) => {
    const base = filterJobs(jobs, { ...filters, [key]: [] }, profile)
    return Object.fromEntries(
      values.map((value) => [
        value,
        base.filter(({ job }) => {
          const field = { modes: 'workMode', types: 'type', levels: 'level', categories: 'category' }[key]
          return job[field] === value
        }).length,
      ]),
    )
  }
  return {
    modes: count('modes', ['remote', 'hybrid', 'onsite']),
    types: count('types', ['full-time', 'contract', 'part-time', 'internship']),
    levels: count('levels', ['intern', 'junior', 'mid', 'senior', 'lead']),
    categories: count('categories', ['engineering', 'design', 'data', 'product', 'marketing', 'operations']),
  }
}

export default function Jobs() {
  useDocumentTitle('Find jobs')
  const { jobs, profile, rememberSearch, removePostedJob } = useApp()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()

  const [filters, setFilters] = useState(() => ({
    ...EMPTY_FILTERS,
    q: params.get('q') || '',
    location: params.get('location') || '',
  }))
  const [sort, setSort] = useState('fit')
  const [selectedId, setSelectedId] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [applyFor, setApplyFor] = useState(null)
  const [confirmTakedown, setConfirmTakedown] = useState(null)

  // The URL is the source of truth for the search terms, so a shared link lands
  // on the same result set.
  useEffect(() => {
    setFilters((current) => ({
      ...current,
      q: params.get('q') || '',
      location: params.get('location') || '',
    }))
  }, [params])

  const results = useMemo(
    () => sortJobs(filterJobs(jobs, filters, profile), sort),
    [jobs, filters, profile, sort],
  )
  const counts = useMemo(() => facetCounts(jobs, filters, profile), [jobs, filters, profile])
  const activeCount = activeFilterCount(filters)

  // A location search matches that city plus every remote role. Split the two so
  // the count can explain itself.
  const locationSplit = useMemo(() => {
    const needle = filters.location.trim().toLowerCase()
    if (!needle || needle === 'remote') return { local: 0, remote: 0 }
    let local = 0
    let remote = 0
    results.forEach(({ job }) => {
      if (job.location.toLowerCase().includes(needle)) local += 1
      else if (job.workMode === 'remote') remote += 1
    })
    return { local, remote }
  }, [results, filters.location])

  // Keep a valid selection as the result set changes.
  const selected = results.find((entry) => entry.job.id === selectedId) || results[0] || null
  useEffect(() => {
    if (selected && selected.job.id !== selectedId) setSelectedId(selected.job.id)
  }, [selected, selectedId])

  const submitSearch = (event) => {
    event.preventDefault()
    const next = new URLSearchParams()
    if (filters.q.trim()) next.set('q', filters.q.trim())
    if (filters.location.trim()) next.set('location', filters.location.trim())
    setParams(next, { replace: true })
    rememberSearch(filters.q)
  }

  const openJob = (job) => {
    // Below the split-view breakpoint the detail column is hidden, so send the
    // reader to the full job page instead of selecting into nothing.
    if (window.matchMedia('(max-width: 1180px)').matches) {
      navigate(`/jobs/${job.id}`)
      return
    }
    setSelectedId(job.id)
  }

  const clearAll = () => {
    setFilters({ ...EMPTY_FILTERS })
    setParams(new URLSearchParams(), { replace: true })
  }

  return (
    <>
      <div className="board">
        <h1 className="sr-only">Find jobs</h1>
        <aside className="filter-rail" aria-label="Filters">
          <div className="filter-head">
            <h2>Filters</h2>
            {activeCount > 0 ? (
              <button type="button" className="btn btn-ghost btn-sm" onClick={clearAll}>
                Clear all
              </button>
            ) : null}
          </div>
          <Filters filters={filters} onChange={setFilters} counts={counts} />
        </aside>

        <div className="board-main">
          <form className="search-console" onSubmit={submitSearch} role="search">
            <div className="search-row">
              <div className="search-field">
                <SearchIcon size={16} />
                <input
                  className="input"
                  type="search"
                  value={filters.q}
                  onChange={(event) => setFilters((f) => ({ ...f, q: event.target.value }))}
                  placeholder="Role, company or skill"
                  aria-label="Search by role, company or skill"
                />
              </div>
              <div className="search-field">
                <PinIcon size={16} />
                <input
                  className="input"
                  value={filters.location}
                  onChange={(event) => setFilters((f) => ({ ...f, location: event.target.value }))}
                  placeholder="City, or “remote”"
                  aria-label="Filter by location"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </div>
          </form>

          <div className="board-toolbar">
            <p className="board-count">
              <strong>{results.length}</strong> {results.length === 1 ? 'role' : 'roles'}
              {activeCount > 0 ? ` · ${activeCount} ${activeCount === 1 ? 'filter' : 'filters'} on` : ''}
              {/* A city search also returns remote roles, which are doable from that
                  city. Say so, or the extra results read as a broken filter. */}
              {locationSplit.remote > 0 ? (
                <span className="board-count-note">
                  {locationSplit.local} in {filters.location.trim()}, {locationSplit.remote} remote
                </span>
              ) : null}
            </p>
            <div className="toolbar-controls">
              <button
                type="button"
                className="btn btn-secondary btn-sm filter-trigger"
                onClick={() => setDrawerOpen(true)}
              >
                <FilterIcon size={15} /> Filters{activeCount > 0 ? ` (${activeCount})` : ''}
              </button>
              <label className="sr-only" htmlFor="sort-by">
                Sort results
              </label>
              <select
                id="sort-by"
                className="select"
                style={{ width: 'auto' }}
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                {SORTS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="panel empty">
              <span className="empty-mark">
                <InboxIcon size={22} />
              </span>
              <h3>Nothing matches those filters</h3>
              <p>
                Widen the search: drop the minimum fit, clear a facet, or search a different skill.
              </p>
              <button type="button" className="btn btn-secondary" onClick={clearAll}>
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="split">
              <div className="job-column">
                {results.map(({ job, fit }) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    fit={fit}
                    selected={selected?.job.id === job.id}
                    onSelect={openJob}
                  />
                ))}
              </div>

              {selected ? (
                <div className="detail-column">
                  <JobDetail
                    key={selected.job.id}
                    job={selected.job}
                    fit={selected.fit}
                    onApply={setApplyFor}
                    onRemovePosting={setConfirmTakedown}
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {drawerOpen ? (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <aside className="drawer" aria-label="Filters">
            <div className="filter-head" style={{ padding: 'var(--s-4) var(--s-5)' }}>
              <h2>Filters</h2>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="drawer-body">
              <Filters filters={filters} onChange={setFilters} counts={counts} />
            </div>
            <div className="dialog-foot">
              <button type="button" className="btn btn-secondary" onClick={clearAll}>
                Clear all
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setDrawerOpen(false)}>
                Show {results.length} {results.length === 1 ? 'role' : 'roles'}
              </button>
            </div>
          </aside>
        </>
      ) : null}

      <ApplyDialog
        job={applyFor}
        fit={applyFor ? results.find((entry) => entry.job.id === applyFor.id)?.fit : null}
        open={Boolean(applyFor)}
        onClose={() => setApplyFor(null)}
      />

      <ConfirmDialog
        open={Boolean(confirmTakedown)}
        onClose={() => setConfirmTakedown(null)}
        onConfirm={() => removePostedJob(confirmTakedown.id)}
        title="Take down this listing?"
        description={confirmTakedown ? `${confirmTakedown.title} will be removed from the board.` : ''}
        confirmLabel="Take it down"
        tone="danger"
      />
    </>
  )
}
