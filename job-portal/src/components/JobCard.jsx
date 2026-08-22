import { useApp } from '../store/AppStore.jsx'
import { formatSalary, relativeDays, plural } from '../lib/format.js'
import { labelFor, WORK_MODES, JOB_TYPES } from '../data/taxonomy.js'
import CompanyLogo from './CompanyLogo.jsx'
import FitMeter from './FitMeter.jsx'
import { BookmarkIcon } from './Icons.jsx'

// The card is an overlay button plus a layered save control, rather than a
// <button> wrapping everything — nesting the save button inside the open button
// would be invalid and unreachable by keyboard.
export default function JobCard({ job, fit, selected, onSelect }) {
  const { isSaved, toggleSave, hasApplied } = useApp()
  const saved = isSaved(job.id)
  const applied = hasApplied(job.id)
  const daysAgo = Math.round((Date.now() - job.postedAt) / 86400000)

  return (
    <article
      className={`job-card${selected ? ' is-selected' : ''}${applied ? ' is-applied' : ''}`}
      aria-current={selected ? 'true' : undefined}
    >
      <button
        type="button"
        className="job-card-open"
        onClick={() => onSelect(job)}
        aria-label={`View ${job.title} at ${job.company}`}
      />

      <div className="job-card-body">
        <div className="job-card-head">
          <CompanyLogo company={job.companyProfile} name={job.company} size={42} />
          <div className="job-card-title">
            <h3>{job.title}</h3>
            <p className="job-card-company">{job.company}</p>
            <p className="job-card-where">
              {job.location} · {labelFor(WORK_MODES, job.workMode)} · {labelFor(JOB_TYPES, job.type)}
            </p>
          </div>
          <FitMeter score={fit.score} size={40} />
        </div>

        <p className="job-card-summary">{job.summary}</p>

        <div className="job-card-foot">
          <span className="job-card-pay">{formatSalary(job.salary)}</span>
          <span className="chip chip-mono">{plural(job.applicants, 'applicant')}</span>
          <span className="job-card-posted">{relativeDays(daysAgo)}</span>
        </div>
      </div>

      <button
        type="button"
        className="icon-btn job-card-save"
        aria-pressed={saved}
        aria-label={saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
        onClick={() => toggleSave(job)}
      >
        <BookmarkIcon filled={saved} />
      </button>
    </article>
  )
}
