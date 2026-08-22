// Shared vocabularies. Filters, the profile tuner and the "post a job" form all
// read from here, so a new value shows up everywhere at once.

export const WORK_MODES = [
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'onsite', label: 'On-site' },
]

export const JOB_TYPES = [
  { id: 'full-time', label: 'Full-time' },
  { id: 'contract', label: 'Contract' },
  { id: 'part-time', label: 'Part-time' },
  { id: 'internship', label: 'Internship' },
]

// Ordered junior → senior. The fit engine measures distance along this list,
// so keep it ordered if you add a rung.
export const LEVELS = [
  { id: 'intern', label: 'Intern', years: '0–1 yrs' },
  { id: 'junior', label: 'Junior', years: '1–3 yrs' },
  { id: 'mid', label: 'Mid', years: '3–6 yrs' },
  { id: 'senior', label: 'Senior', years: '6–10 yrs' },
  { id: 'lead', label: 'Lead', years: '10+ yrs' },
]

export const LEVEL_ORDER = LEVELS.map((l) => l.id)

export const CATEGORIES = [
  { id: 'engineering', label: 'Engineering' },
  { id: 'design', label: 'Design' },
  { id: 'data', label: 'Data' },
  { id: 'product', label: 'Product' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'operations', label: 'Operations' },
]

export const APPLICATION_STAGES = [
  { id: 'applied', label: 'Applied' },
  { id: 'screening', label: 'Screening' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'closed', label: 'Closed' },
]

export const SORTS = [
  { id: 'fit', label: 'Best fit' },
  { id: 'recent', label: 'Newest' },
  { id: 'salary', label: 'Top pay' },
]

export const labelFor = (list, id) => list.find((item) => item.id === id)?.label ?? id
