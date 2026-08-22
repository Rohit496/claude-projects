import { useDocumentTitle } from '../lib/useDocumentTitle.js'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppStore.jsx'
import { scoreFit } from '../lib/fit.js'
import { sortJobs } from '../lib/filters.js'
import JobCard from '../components/JobCard.jsx'
import { BookmarkIcon } from '../components/Icons.jsx'

export default function Saved() {
  useDocumentTitle('Saved jobs')
  const { savedJobs, profile, hasApplied } = useApp()
  const navigate = useNavigate()

  const scored = sortJobs(
    savedJobs.map((job) => ({ job, fit: scoreFit(job, profile) })),
    'fit',
  )
  const notYetApplied = scored.filter(({ job }) => !hasApplied(job.id))

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Saved</p>
          <h1>Roles you kept</h1>
          <p>
            {scored.length === 0
              ? 'Nothing saved yet.'
              : `${scored.length} saved · ${notYetApplied.length} still to apply to. Ordered by fit.`}
          </p>
        </div>
        {scored.length > 0 ? (
          <Link to="/jobs" className="btn btn-secondary">
            Find more roles
          </Link>
        ) : null}
      </div>

      {scored.length === 0 ? (
        <div className="panel empty">
          <span className="empty-mark">
            <BookmarkIcon size={22} />
          </span>
          <h3>No saved roles yet</h3>
          <p>
            Save a role from the board and it waits here, re-scored whenever you change your profile.
          </p>
          <Link to="/jobs" className="btn btn-primary">
            Browse open roles
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {scored.map(({ job, fit }) => (
            <JobCard key={job.id} job={job} fit={fit} onSelect={(next) => navigate(`/jobs/${next.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}
