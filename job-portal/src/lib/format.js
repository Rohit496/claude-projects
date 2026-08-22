// Display helpers. Salaries are ₹ lakh per annum throughout.

export function formatSalary(salary) {
  if (!salary) return 'Not disclosed'
  const { min, max } = salary
  if (!min && !max) return 'Not disclosed'
  if (min && max) return `₹${min}–${max} LPA`
  return `₹${min || max} LPA`
}

export function formatSalaryLong(salary) {
  if (!salary?.min && !salary?.max) return 'Not disclosed'
  return `${formatSalary(salary)} · fixed, excluding equity`
}

export function formatCount(n) {
  if (n >= 100000) return `${(n / 100000).toFixed(1).replace(/\.0$/, '')}L`
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

export function relativeDays(days) {
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 14) return 'Last week'
  if (days < 31) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

export function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function closingLabel(days) {
  if (days <= 0) return 'Closed'
  if (days === 1) return 'Closes tomorrow'
  if (days <= 7) return `Closes in ${days} days`
  return `Open until ${formatDate(Date.now() + days * 86400000)}`
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
