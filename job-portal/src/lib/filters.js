// One place where search, filters and sorting are applied, so the jobs page,
// saved page and company page all narrow results the same way.

import { scoreFit } from './fit.js'

export const EMPTY_FILTERS = {
  q: '',
  location: '',
  types: [],
  modes: [],
  levels: [],
  categories: [],
  skills: [],
  minSalary: 0,
  minFit: 0,
}

const norm = (s) => (s || '').trim().toLowerCase()

function matchesQuery(job, q) {
  if (!q) return true
  const needle = norm(q)
  const haystack = [job.title, job.company, job.location, job.summary, ...(job.skills || [])]
    .join(' ')
    .toLowerCase()
  // Every whitespace-separated term must appear: "react remote" narrows, it does not widen.
  return needle.split(/\s+/).every((term) => haystack.includes(term))
}

function matchesLocation(job, location) {
  if (!location) return true
  const needle = norm(location)
  if (needle === 'remote') return job.workMode === 'remote'
  return norm(job.location).includes(needle) || job.workMode === 'remote'
}

export function filterJobs(jobs, filters, profile) {
  const f = { ...EMPTY_FILTERS, ...filters }
  const skillSet = f.skills.map(norm)

  return jobs
    .map((job) => ({ job, fit: scoreFit(job, profile) }))
    .filter(({ job, fit }) => {
      if (!matchesQuery(job, f.q)) return false
      if (!matchesLocation(job, f.location)) return false
      if (f.types.length && !f.types.includes(job.type)) return false
      if (f.modes.length && !f.modes.includes(job.workMode)) return false
      if (f.levels.length && !f.levels.includes(job.level)) return false
      if (f.categories.length && !f.categories.includes(job.category)) return false
      if (f.minSalary && (job.salary?.max ?? 0) < f.minSalary) return false
      if (f.minFit && fit.score < f.minFit) return false
      if (skillSet.length) {
        const jobSkills = (job.skills || []).map(norm)
        if (!skillSet.every((skill) => jobSkills.includes(skill))) return false
      }
      return true
    })
}

export function sortJobs(scored, sort) {
  const list = [...scored]
  switch (sort) {
    case 'recent':
      return list.sort((a, b) => b.job.postedAt - a.job.postedAt)
    case 'salary':
      return list.sort((a, b) => (b.job.salary?.max ?? 0) - (a.job.salary?.max ?? 0))
    case 'fit':
    default:
      return list.sort((a, b) => b.fit.score - a.fit.score || b.job.postedAt - a.job.postedAt)
  }
}

export function activeFilterCount(filters) {
  const f = { ...EMPTY_FILTERS, ...filters }
  return (
    f.types.length +
    f.modes.length +
    f.levels.length +
    f.categories.length +
    f.skills.length +
    (f.minSalary ? 1 : 0) +
    (f.minFit ? 1 : 0) +
    (f.location ? 1 : 0)
  )
}
