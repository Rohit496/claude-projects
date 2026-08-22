import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../store/AppStore.jsx'
import { scoreFit } from '../lib/fit.js'
import JobDetail from '../components/JobDetail.jsx'
import JobCard from '../components/JobCard.jsx'
import ApplyDialog from '../components/ApplyDialog.jsx'
import { ConfirmDialog } from '../components/Dialog.jsx'
import CompanyLogo from '../components/CompanyLogo.jsx'
import { ArrowLeftIcon, InboxIcon } from '../components/Icons.jsx'

export default function JobPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { jobs, profile, removePostedJob } = useApp()
  const [applyOpen, setApplyOpen] = useState(false)
  const [confirmTakedown, setConfirmTakedown] = useState(false)

  const job = jobs.find((entry) => entry.id === jobId)

  if (!job) {
    return (
      <div className="page">
        <div className="panel empty">
          <span className="empty-mark">
            <InboxIcon size={22} />
          </span>
          <h3>That role is no longer on the board</h3>
          <p>It may have been taken down, or the link may be wrong.</p>
          <Link to="/jobs" className="btn btn-primary">
            Browse open roles
          </Link>
        </div>
      </div>
    )
  }

  const fit = scoreFit(job, profile)
  const company = job.companyProfile
  const related = jobs
    .filter((entry) => entry.id !== job.id && (entry.companyId === job.companyId || entry.category === job.category))
    .slice(0, 3)
    .map((entry) => ({ job: entry, fit: scoreFit(entry, profile) }))

  return (
    <div className="page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/jobs">
          <ArrowLeftIcon size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> All jobs
        </Link>
        <span aria-hidden="true">/</span>
        <span>{job.title}</span>
      </nav>

      <div className="split-content">
        <div className="panel panel-pad job-page">
          <JobDetail
            job={job}
            fit={fit}
            onApply={() => setApplyOpen(true)}
            onRemovePosting={() => setConfirmTakedown(true)}
          />
        </div>

        <aside className="side-panel">
          {company ? (
            <div className="panel panel-pad">
              <div className="row" style={{ gap: 'var(--s-3)', marginBottom: 'var(--s-3)' }}>
                <CompanyLogo company={company} size={44} />
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: 'var(--t-base)', fontFamily: 'var(--font-body)' }}>
                    {company.name}
                  </h3>
                  <p className="muted" style={{ fontSize: 'var(--t-xs)' }}>
                    {company.industry} · {company.size}
                  </p>
                </div>
              </div>
              <p className="muted" style={{ fontSize: 'var(--t-sm)' }}>
                {company.tagline}
              </p>
              <Link
                to={`/companies/${company.id}`}
                className="btn btn-secondary btn-block"
                style={{ marginTop: 'var(--s-4)' }}
              >
                View company
              </Link>
            </div>
          ) : null}

          {related.length ? (
            <div className="panel panel-pad">
              <h3 style={{ fontSize: 'var(--t-base)', fontFamily: 'var(--font-body)', marginBottom: 'var(--s-3)' }}>
                Related roles
              </h3>
              <div className="stack" style={{ gap: 'var(--s-3)' }}>
                {related.map((entry) => (
                  <JobCard
                    key={entry.job.id}
                    job={entry.job}
                    fit={entry.fit}
                    onSelect={(next) => navigate(`/jobs/${next.id}`)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      <ApplyDialog job={job} fit={fit} open={applyOpen} onClose={() => setApplyOpen(false)} />
      <ConfirmDialog
        open={confirmTakedown}
        onClose={() => setConfirmTakedown(false)}
        onConfirm={() => {
          removePostedJob(job.id)
          navigate('/jobs')
        }}
        title="Take down this listing?"
        description={`${job.title} will be removed from the board.`}
        confirmLabel="Take it down"
        tone="danger"
      />
    </div>
  )
}
