// The fit engine.
//
// Every listing is scored against the candidate profile out of 100, split across
// four weighted parts. The breakdown is returned alongside the score because a
// number nobody can interrogate is worse than no number at all — the job detail
// view renders these parts verbatim.

import { LEVEL_ORDER } from '../data/taxonomy.js'

export const WEIGHTS = { skills: 45, level: 20, place: 20, pay: 15 }

const norm = (s) => s.trim().toLowerCase()

function skillPart(job, profile) {
  const have = new Set((profile.skills || []).map(norm))
  const wanted = job.skills || []
  const matched = wanted.filter((s) => have.has(norm(s)))
  const missing = wanted.filter((s) => !have.has(norm(s)))
  const ratio = wanted.length ? matched.length / wanted.length : 0.5
  return {
    key: 'skills',
    label: 'Skills',
    ratio,
    matched,
    missing,
    detail: wanted.length
      ? `${matched.length} of ${wanted.length} listed skills`
      : 'No skills listed on this role',
  }
}

function levelPart(job, profile) {
  const jobIdx = LEVEL_ORDER.indexOf(job.level)
  const meIdx = LEVEL_ORDER.indexOf(profile.level)
  if (jobIdx < 0 || meIdx < 0) return { key: 'level', label: 'Seniority', ratio: 0.5, detail: 'Level unclear' }
  const gap = Math.abs(jobIdx - meIdx)
  const ratio = gap === 0 ? 1 : gap === 1 ? 0.6 : gap === 2 ? 0.25 : 0.05
  const detail =
    gap === 0
      ? 'Same level as your profile'
      : jobIdx > meIdx
        ? `${gap} level${gap > 1 ? 's' : ''} above your profile`
        : `${gap} level${gap > 1 ? 's' : ''} below your profile`
  return { key: 'level', label: 'Seniority', ratio, detail }
}

function placePart(job, profile) {
  const modeOk = (profile.workModes || []).includes(job.workMode)
  const remote = job.workMode === 'remote'
  const sameCity = norm(job.location).includes(norm(profile.location || '')) && Boolean(profile.location)
  const placeOk = remote || sameCity
  const ratio = modeOk && placeOk ? 1 : modeOk || placeOk ? 0.55 : 0.15
  const detail = remote
    ? modeOk
      ? 'Remote, which you are open to'
      : 'Remote, which is outside your stated preference'
    : placeOk
      ? modeOk
        ? `${job.workMode === 'hybrid' ? 'Hybrid' : 'On-site'} in ${job.location}, where you are`
        : `In ${job.location}, but you have not selected ${job.workMode}`
      : `Based in ${job.location}`
  return { key: 'place', label: 'Location', ratio, detail }
}

function payPart(job, profile) {
  const floor = Number(profile.minSalary) || 0
  const { min = 0, max = 0 } = job.salary || {}
  if (!floor) return { key: 'pay', label: 'Pay', ratio: 0.8, detail: 'No minimum set on your profile' }
  if (min >= floor) return { key: 'pay', label: 'Pay', ratio: 1, detail: `Whole band clears your ₹${floor}L floor` }
  if (max >= floor)
    return { key: 'pay', label: 'Pay', ratio: 0.75, detail: `Top of the band clears your ₹${floor}L floor` }
  const ratio = Math.max(0, Math.min(0.6, (max / floor) * 0.6))
  return { key: 'pay', label: 'Pay', ratio, detail: `Below your ₹${floor}L floor` }
}

export function scoreFit(job, profile) {
  const parts = [skillPart(job, profile), levelPart(job, profile), placePart(job, profile), payPart(job, profile)]
  const score = Math.round(parts.reduce((sum, part) => sum + part.ratio * WEIGHTS[part.key], 0))
  const skills = parts[0]
  return {
    score: Math.max(0, Math.min(100, score)),
    parts: parts.map((part) => ({ ...part, weight: WEIGHTS[part.key], points: Math.round(part.ratio * WEIGHTS[part.key]) })),
    matched: skills.matched || [],
    missing: skills.missing || [],
  }
}

export function fitBand(score) {
  if (score >= 78) return { id: 'strong', label: 'Strong match' }
  if (score >= 58) return { id: 'good', label: 'Good match' }
  if (score >= 38) return { id: 'stretch', label: 'Worth a look' }
  return { id: 'low', label: 'Long shot' }
}
