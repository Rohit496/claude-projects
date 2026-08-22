// Turns raw listing records into what the UI renders: company profile attached,
// relative day counts resolved into dates, and a stable slug for company routes.

import { SEED_JOBS } from '../data/jobs.js'
import { getCompany, companySlug } from '../data/companies.jsx'

const DAY = 86400000

export function hydrateJob(job) {
  const company = getCompany(job.companyId || job.company)
  const postedDaysAgo = Number(job.postedDaysAgo) || 0
  const closesInDays = Number(job.closesInDays) || 0
  return {
    ...job,
    companyId: company?.id ?? companySlug(job.company),
    companyProfile: company ?? null,
    companyKind: job.companyKind || (company ? `${company.industry} · ${company.size}` : ''),
    postedAt: Date.now() - postedDaysAgo * DAY,
    closesAt: Date.now() + closesInDays * DAY,
    skills: job.skills || [],
    responsibilities: job.responsibilities || [],
    requirements: job.requirements || [],
    benefits: job.benefits || [],
  }
}

export const SEED = SEED_JOBS.map(hydrateJob)

/** Seed listings plus anything posted locally, newest first. */
export function allJobs(postedJobs = []) {
  return [...postedJobs.map(hydrateJob), ...SEED]
}

export function jobById(jobs, id) {
  return jobs.find((job) => job.id === id) ?? null
}

/** A blank listing shaped like the seed data, for the "post a job" form. */
export function emptyJobDraft() {
  return {
    title: '',
    company: '',
    location: '',
    category: 'engineering',
    level: 'mid',
    type: 'full-time',
    workMode: 'hybrid',
    salary: { min: '', max: '' },
    skills: [],
    summary: '',
    responsibilities: [''],
    requirements: [''],
    benefits: [''],
  }
}
