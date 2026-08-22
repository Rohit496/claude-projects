import { Link } from 'react-router-dom'
import { useApp } from '../store/AppStore.jsx'
import { formatSalary, relativeDays, closingLabel, plural } from '../lib/format.js'
import { labelFor, WORK_MODES, JOB_TYPES, LEVELS, CATEGORIES } from '../data/taxonomy.js'
import CompanyLogo from './CompanyLogo.jsx'
import FitMeter, { FitBreakdown } from './FitMeter.jsx'
import { BookmarkIcon, CheckIcon, SendIcon, ClockIcon, TrashIcon } from './Icons.jsx'

export default function JobDetail({ job, fit, onApply, onRemovePosting, asPage = false }) {
  // On the board this panel previews a job beside the list, so its title is an h2
  // under the board's own h1. On the job route it is the page, so it is the h1.
  const Title = asPage ? 'h1' : 'h2'
  const { isSaved, toggleSave, hasApplied } = useApp()
  const saved = isSaved(job.id)
  const applied = hasApplied(job.id)
  const daysAgo = Math.round((Date.now() - job.postedAt) / 86400000)
  const daysLeft = Math.max(0, Math.round((job.closesAt - Date.now()) / 86400000))
  const level = LEVELS.find((l) => l.id === job.level)

  return (
    <div className="detail">
      <header className="detail-head">
        <div className="detail-identity">
          <CompanyLogo company={job.companyProfile} name={job.company} size={54} />
          <div className="detail-identity-body">
            <Title className="detail-title">{job.title}</Title>
            <div className="detail-company">
              {job.companyProfile ? (
                <Link to={`/companies/${job.companyId}`}>{job.company}</Link>
              ) : (
                <strong>{job.company}</strong>
              )}
              <span className="muted">· {job.companyKind}</span>
            </div>
            <div className="tag-row" style={{ marginTop: 'var(--s-3)' }}>
              <span className="chip chip-accent">{labelFor(WORK_MODES, job.workMode)}</span>
              <span className="chip">{labelFor(JOB_TYPES, job.type)}</span>
              <span className="chip">{level?.label} · {level?.years}</span>
              <span className="chip">{labelFor(CATEGORIES, job.category)}</span>
              {job.postedByMe ? <span className="chip chip-positive">Your listing</span> : null}
            </div>
          </div>
        </div>

        <div className="detail-actions">
          {applied ? (
            // Not a disabled button: this is a completed state, not an unavailable
            // one, and it should lead somewhere useful.
            <p className="detail-applied">
              <CheckIcon size={16} />
              <span>
                Application sent. <Link to="/applications">Track it</Link>
              </span>
            </p>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => onApply(job)}>
              <SendIcon /> Apply for this role
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            aria-pressed={saved}
            onClick={() => toggleSave(job)}
          >
            <BookmarkIcon filled={saved} /> {saved ? 'Saved' : 'Save'}
          </button>
          {job.postedByMe && onRemovePosting ? (
            <button type="button" className="btn btn-danger" onClick={() => onRemovePosting(job)}>
              <TrashIcon /> Take down
            </button>
          ) : null}
        </div>

        <dl className="detail-facts">
          <div className="detail-fact">
            <span>Salary, fixed</span>
            <strong className="mono">{formatSalary(job.salary)}</strong>
          </div>
          <div className="detail-fact">
            <span>Location</span>
            <strong>{job.location}</strong>
          </div>
          <div className="detail-fact">
            <span>Posted</span>
            <strong>{relativeDays(daysAgo)}</strong>
          </div>
          <div className="detail-fact">
            <span>Applicants</span>
            <strong className="mono">{job.applicants}</strong>
          </div>
        </dl>
      </header>

      <section className="fit-card" aria-labelledby="fit-heading">
        <div className="fit-card-head">
          <h2 id="fit-heading">Why this scored {fit.score}</h2>
          <FitMeter score={fit.score} size={44} />
        </div>
        <FitBreakdown fit={fit} />
        <div className="fit-gap">
          {fit.missing.length ? (
            <>
              <strong>Gaps to address in your cover note:</strong>{' '}
              {fit.missing.join(', ')}.
            </>
          ) : (
            <>
              <strong>No skill gaps.</strong> Every skill this role lists is on your profile.
            </>
          )}
        </div>
      </section>

      <section className="detail-section">
        <h2>About the role</h2>
        <p>{job.summary}</p>
      </section>

      <section className="detail-section">
        <h2>Skills</h2>
        <div className="tag-row">
          {job.skills.map((skill) => {
            const matched = fit.matched.includes(skill)
            return (
              <span key={skill} className={`skill-chip ${matched ? 'is-matched' : 'is-missing'}`}>
                {matched ? <CheckIcon size={12} /> : null}
                {skill}
              </span>
            )
          })}
        </div>
      </section>

      {job.responsibilities.length ? (
        <section className="detail-section">
          <h2>What you will do</h2>
          <ul className="bullets">
            {job.responsibilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {job.requirements.length ? (
        <section className="detail-section">
          <h2>What the team expects</h2>
          <ul className="bullets">
            {job.requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {job.benefits.length ? (
        <section className="detail-section">
          <h2>What you get</h2>
          <ul className="bullets bullets--check">
            {job.benefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="detail-section">
        <p className="muted" style={{ fontSize: 'var(--t-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClockIcon size={15} />
          {closingLabel(daysLeft)} · {plural(job.applicants, 'person has', 'people have')} applied
        </p>
      </footer>
    </div>
  )
}
