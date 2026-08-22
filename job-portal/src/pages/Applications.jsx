import { useDocumentTitle } from '../lib/useDocumentTitle.js'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/AppStore.jsx'
import { APPLICATION_STAGES, labelFor } from '../data/taxonomy.js'
import { formatDate, formatSalary } from '../lib/format.js'
import CompanyLogo from '../components/CompanyLogo.jsx'
import { ConfirmDialog } from '../components/Dialog.jsx'
import { SendIcon, TrashIcon } from '../components/Icons.jsx'

export default function Applications() {
  useDocumentTitle('Your applications')
  const { applications, setApplicationStage, withdrawApplication, jobs } = useApp()
  const [stageFilter, setStageFilter] = useState(null)
  const [confirmWithdraw, setConfirmWithdraw] = useState(null)

  const counts = useMemo(() => {
    const base = Object.fromEntries(APPLICATION_STAGES.map((stage) => [stage.id, 0]))
    applications.forEach((application) => {
      base[application.stage] = (base[application.stage] || 0) + 1
    })
    return base
  }, [applications])

  const shown = stageFilter
    ? applications.filter((application) => application.stage === stageFilter)
    : applications

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Applications</p>
          <h1>What you sent, and where it got to</h1>
          <p>
            {applications.length === 0
              ? 'Nothing sent yet.'
              : `${applications.length} sent. Move a role along as you hear back — the stage is yours to set.`}
          </p>
        </div>
        <Link to="/jobs" className="btn btn-secondary">
          Find more roles
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="panel empty">
          <span className="empty-mark">
            <SendIcon size={22} />
          </span>
          <h3>No applications yet</h3>
          <p>
            Apply from any role on the board and it appears here, with the stage tracker and the note
            you sent.
          </p>
          <Link to="/jobs" className="btn btn-primary">
            Browse open roles
          </Link>
        </div>
      ) : (
        <>
          <div className="pipeline">
            {APPLICATION_STAGES.map((stage) => (
              <button
                key={stage.id}
                type="button"
                className={`pipeline-cell${stageFilter === stage.id ? ' is-active' : ''}`}
                onClick={() => setStageFilter(stageFilter === stage.id ? null : stage.id)}
                aria-pressed={stageFilter === stage.id}
                style={{ textAlign: 'left' }}
              >
                <strong className="mono">{counts[stage.id] || 0}</strong>
                <span>{stage.label}</span>
              </button>
            ))}
          </div>

          {stageFilter ? (
            <p className="board-count" style={{ marginBottom: 'var(--s-3)' }}>
              Showing <strong>{labelFor(APPLICATION_STAGES, stageFilter)}</strong> only ·{' '}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setStageFilter(null)}
              >
                Show all
              </button>
            </p>
          ) : null}

          {shown.length === 0 ? (
            <div className="panel empty">
              <h3>Nothing at that stage</h3>
              <p>Pick another stage, or show all applications.</p>
            </div>
          ) : (
            <div>
              {shown.map((application) => {
                const job = jobs.find((entry) => entry.id === application.jobId)
                return (
                  <article className="app-row" key={application.id}>
                    <CompanyLogo name={application.company} size={44} />
                    <div className="app-meta">
                      <h3>
                        {job ? (
                          <Link to={`/jobs/${job.id}`}>{application.jobTitle}</Link>
                        ) : (
                          application.jobTitle
                        )}
                      </h3>
                      <p>
                        {application.company} · {application.location} ·{' '}
                        <span className="mono">{formatSalary(application.salary)}</span>
                      </p>
                      <p className="muted" style={{ fontSize: 'var(--t-xs)' }}>
                        Sent {formatDate(application.appliedAt)}
                        {application.resumeName ? ` · ${application.resumeName}` : ''}
                        {application.note ? ` · note attached` : ''}
                      </p>
                    </div>
                    <div className="app-actions">
                      <label className="sr-only" htmlFor={`stage-${application.id}`}>
                        Stage for {application.jobTitle}
                      </label>
                      <select
                        id={`stage-${application.id}`}
                        className="select"
                        style={{ width: 'auto' }}
                        value={application.stage}
                        onChange={(event) => setApplicationStage(application.id, event.target.value)}
                      >
                        {APPLICATION_STAGES.map((stage) => (
                          <option key={stage.id} value={stage.id}>
                            {stage.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => setConfirmWithdraw(application)}
                        aria-label={`Withdraw application to ${application.company}`}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(confirmWithdraw)}
        onClose={() => setConfirmWithdraw(null)}
        onConfirm={() => withdrawApplication(confirmWithdraw.id)}
        title="Withdraw this application?"
        description={
          confirmWithdraw
            ? `Your application to ${confirmWithdraw.company} for ${confirmWithdraw.jobTitle} will be removed.`
            : ''
        }
        confirmLabel="Withdraw"
        tone="danger"
      />
    </div>
  )
}
