import { useApp } from '../store/AppStore.jsx'
import { formatSalary, relativeDays, plural } from '../lib/format.js'
import { labelFor, WORK_MODES, JOB_TYPES } from '../data/taxonomy.js'
import CompanyLogo from './CompanyLogo.jsx'
import FitMeter from './FitMeter.jsx'
import { BookmarkIcon } from './Icons.jsx'

// The title button carries an ::after that spans the whole card, so the entire
// card is one click target without nesting the save button inside it. The save
// button sits later in the DOM and above that overlay, so it stays clickable.
export default function JobCard({ job, fit, selected, onSelect }) {
  const { isSaved, toggleSave, hasApplied } = useApp()
  const saved = isSaved(job.id)
  const applied = hasApplied(job.id)
  const daysAgo = Math.round((Date.now() - job.postedAt) / 86400000)

  return (
    <article
      className={`job-card${selected ? ' is-selected' : ''}`}
      aria-current={selected ? 'true' : undefined}
    >
      <div className="job-card-head">
        <CompanyLogo company={job.companyProfile} name={job.company} size={42} />

        <div className="job-card-title">
          <h3>
            <button type="button" className="job-card-open" onClick={() => onSelect(job)}>
              {job.title}
            </button>
          </h3>
          <p className="job-card-company">{job.company}</p>
          <p className="job-card-where">
            {job.location} · {labelFor(WORK_MODES, job.workMode)} · {labelFor(JOB_TYPES, job.type)}
          </p>
        </div>

        <div className="job-card-aside">
          <FitMeter score={fit.score} size={40} />
          <button
            type="button"
            className="icon-btn job-card-save"
            aria-pressed={saved}
            aria-label={saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
            onClick={() => toggleSave(job)}
          >
            <BookmarkIcon filled={saved} />
          </button>
        </div>
      </div>

      <p className="job-card-summary">{job.summary}</p>

      <div className="job-card-foot">
        <span className="job-card-pay">{formatSalary(job.salary)}</span>
        <span className="chip chip-mono">{plural(job.applicants, 'applicant')}</span>
        {applied ? <span className="chip chip-positive">Applied</span> : null}
        <span className="job-card-posted">{relativeDays(daysAgo)}</span>
      </div>
    </article>
  )
}
