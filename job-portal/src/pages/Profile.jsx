import { useDocumentTitle } from '../lib/useDocumentTitle.js'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/AppStore.jsx'
import { LEVELS, WORK_MODES } from '../data/taxonomy.js'
import { scoreFit } from '../lib/fit.js'
import { sortJobs } from '../lib/filters.js'
import { plural } from '../lib/format.js'
import FitMeter from '../components/FitMeter.jsx'
import { ConfirmDialog } from '../components/Dialog.jsx'
import { PlusIcon, CloseIcon, ChartIcon } from '../components/Icons.jsx'

// Skills the dataset actually asks for, so the suggestions can move a score.
const SUGGESTED = [
  'React', 'TypeScript', 'JavaScript', 'CSS', 'Node.js', 'Python', 'Go', 'Kotlin',
  'SQL', 'PostgreSQL', 'Kubernetes', 'AWS', 'Terraform', 'Figma', 'Design systems',
  'User research', 'Accessibility', 'Testing', 'Analytics', 'Writing',
]

export default function Profile() {
  useDocumentTitle('Your profile')
  const { profile, updateProfile, jobs, applications, savedIds, resetEverything } = useApp()
  const [skillDraft, setSkillDraft] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  // Scores update as the profile is edited — the page shows its own effect.
  const scored = useMemo(
    () => sortJobs(jobs.map((job) => ({ job, fit: scoreFit(job, profile) })), 'fit'),
    [jobs, profile],
  )
  const strong = scored.filter((entry) => entry.fit.score >= 78).length
  const good = scored.filter((entry) => entry.fit.score >= 58 && entry.fit.score < 78).length
  const average = scored.length
    ? Math.round(scored.reduce((sum, entry) => sum + entry.fit.score, 0) / scored.length)
    : 0

  const addSkill = (skill) => {
    const clean = skill.trim()
    if (!clean) return
    if (profile.skills.some((existing) => existing.toLowerCase() === clean.toLowerCase())) return
    updateProfile({ skills: [...profile.skills, clean] })
    setSkillDraft('')
  }

  const toggleMode = (mode) => {
    const has = profile.workModes.includes(mode)
    updateProfile({
      workModes: has ? profile.workModes.filter((m) => m !== mode) : [...profile.workModes, mode],
    })
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Your profile</p>
          <h1>What the scores are measured against</h1>
          <p>
            Change anything here and every score on the board updates immediately. Stored in this
            browser, never sent anywhere.
          </p>
        </div>
        <Link to="/jobs" className="btn btn-secondary">
          See your matches
        </Link>
      </div>

      <div className="split-content">
        <div>
          <section className="form-section">
            <h2>Who you are</h2>
            <p>Used to pre-fill applications. Optional until you apply.</p>
            <div className="form-grid">
              <div className="form-row">
                <div className="field">
                  <label className="field-label" htmlFor="p-name">
                    Full name
                  </label>
                  <input
                    id="p-name"
                    className="input"
                    value={profile.name}
                    onChange={(event) => updateProfile({ name: event.target.value })}
                    autoComplete="name"
                  />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="p-email">
                    Email
                  </label>
                  <input
                    id="p-email"
                    type="email"
                    className="input"
                    value={profile.email}
                    onChange={(event) => updateProfile({ email: event.target.value })}
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label className="field-label" htmlFor="p-phone">
                    Phone
                  </label>
                  <input
                    id="p-phone"
                    className="input"
                    value={profile.phone}
                    onChange={(event) => updateProfile({ phone: event.target.value })}
                    autoComplete="tel"
                  />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="p-portfolio">
                    Portfolio or GitHub
                  </label>
                  <input
                    id="p-portfolio"
                    className="input"
                    value={profile.portfolio}
                    onChange={(event) => updateProfile({ portfolio: event.target.value })}
                    placeholder="github.com/you"
                  />
                </div>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="p-headline">
                  Headline
                </label>
                <input
                  id="p-headline"
                  className="input"
                  value={profile.headline}
                  onChange={(event) => updateProfile({ headline: event.target.value })}
                  placeholder="Frontend engineer"
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>What you are looking for</h2>
            <p>These four inputs are the entire fit calculation.</p>
            <div className="form-grid">
              <div className="form-row">
                <div className="field">
                  <label className="field-label" htmlFor="p-level">
                    Seniority — worth 20 points
                  </label>
                  <select
                    id="p-level"
                    className="select"
                    value={profile.level}
                    onChange={(event) => updateProfile({ level: event.target.value })}
                  >
                    {LEVELS.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.label} · {level.years}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="p-location">
                    Your city — part of 20 points
                  </label>
                  <input
                    id="p-location"
                    className="input"
                    value={profile.location}
                    onChange={(event) => updateProfile({ location: event.target.value })}
                    placeholder="Bengaluru"
                  />
                </div>
              </div>

              <div className="field">
                <span className="field-label">Work modes you will accept</span>
                <div className="tag-row">
                  {WORK_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      className="chip"
                      aria-pressed={profile.workModes.includes(mode.id)}
                      onClick={() => toggleMode(mode.id)}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="p-salary">
                  Salary floor — worth 15 points ·{' '}
                  <span className="mono">₹{profile.minSalary}L</span>
                </label>
                <input
                  id="p-salary"
                  className="range"
                  type="range"
                  min="0"
                  max="70"
                  step="1"
                  value={profile.minSalary}
                  onChange={(event) => updateProfile({ minSalary: Number(event.target.value) })}
                />
                <span className="field-hint">
                  {profile.minSalary === 0
                    ? 'No floor set — every role scores full marks on pay.'
                    : `Roles whose whole band clears ₹${profile.minSalary}L score full marks.`}
                </span>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Skills — worth 45 points</h2>
            <p>The heaviest input. A role scores on how many of its listed skills you hold.</p>

            <div className="tag-row" style={{ marginBottom: 'var(--s-4)' }}>
              {profile.skills.length === 0 ? (
                <p className="muted" style={{ fontSize: 'var(--t-sm)' }}>
                  No skills yet. Every role will score zero on its heaviest input.
                </p>
              ) : (
                profile.skills.map((skill) => (
                  <span key={skill} className="chip chip-accent">
                    {skill}
                    <button
                      type="button"
                      className="chip-dismiss"
                      onClick={() =>
                        updateProfile({ skills: profile.skills.filter((s) => s !== skill) })
                      }
                      aria-label={`Remove ${skill}`}
                    >
                      <CloseIcon size={9} />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="list-editor-row">
              <input
                className="input"
                value={skillDraft}
                onChange={(event) => setSkillDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addSkill(skillDraft)
                  }
                }}
                placeholder="Add a skill and press Enter"
                aria-label="Add a skill"
              />
              <button type="button" className="btn btn-secondary" onClick={() => addSkill(skillDraft)}>
                <PlusIcon size={15} /> Add
              </button>
            </div>

            <p className="field-hint" style={{ marginTop: 'var(--s-4)', marginBottom: 'var(--s-2)' }}>
              Common on this board:
            </p>
            <div className="tag-row">
              {SUGGESTED.filter(
                (skill) => !profile.skills.some((s) => s.toLowerCase() === skill.toLowerCase()),
              )
                .slice(0, 12)
                .map((skill) => (
                  <button key={skill} type="button" className="chip" onClick={() => addSkill(skill)}>
                    <PlusIcon size={11} /> {skill}
                  </button>
                ))}
            </div>
          </section>

          <div className="form-foot">
            <button type="button" className="btn btn-danger" onClick={() => setConfirmReset(true)}>
              Clear all local data
            </button>
          </div>
        </div>

        <aside className="side-panel">
          <div className="panel panel-pad">
            <div className="row" style={{ gap: 'var(--s-3)', marginBottom: 'var(--s-4)' }}>
              <ChartIcon size={18} />
              <h3 style={{ fontSize: 'var(--t-base)', fontFamily: 'var(--font-body)' }}>
                Your profile against the board
              </h3>
            </div>
            <div className="stack" style={{ gap: 'var(--s-4)' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="muted" style={{ fontSize: 'var(--t-sm)' }}>
                  Average score
                </span>
                <FitMeter score={average} size={44} />
              </div>
              <hr className="divider" />
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 'var(--t-sm)' }}>
                <span className="muted">Strong matches</span>
                <strong className="mono">{strong}</strong>
              </div>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 'var(--t-sm)' }}>
                <span className="muted">Good matches</span>
                <strong className="mono">{good}</strong>
              </div>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 'var(--t-sm)' }}>
                <span className="muted">Roles on the board</span>
                <strong className="mono">{jobs.length}</strong>
              </div>
              <hr className="divider" />
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 'var(--t-sm)' }}>
                <span className="muted">Saved</span>
                <strong className="mono">{savedIds.length}</strong>
              </div>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 'var(--t-sm)' }}>
                <span className="muted">Applications sent</span>
                <strong className="mono">{applications.length}</strong>
              </div>
            </div>
          </div>

          {scored.length > 0 ? (
            <div className="panel panel-pad">
              <h3 style={{ fontSize: 'var(--t-base)', fontFamily: 'var(--font-body)', marginBottom: 'var(--s-3)' }}>
                Best match right now
              </h3>
              <Link to={`/jobs/${scored[0].job.id}`} style={{ display: 'block' }}>
                <strong style={{ fontSize: 'var(--t-base)' }}>{scored[0].job.title}</strong>
                <p className="muted" style={{ fontSize: 'var(--t-sm)' }}>
                  {scored[0].job.company} · scored {scored[0].fit.score}
                </p>
              </Link>
              {scored[0].fit.missing.length ? (
                <p className="field-hint" style={{ marginTop: 'var(--s-3)' }}>
                  Add {plural(scored[0].fit.missing.length, 'skill')} to close the gap:{' '}
                  {scored[0].fit.missing.join(', ')}.
                </p>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={resetEverything}
        title="Clear everything stored on this device?"
        description="Your profile, saved roles, applications and posted listings will be reset to defaults."
        confirmLabel="Clear it all"
        tone="danger"
      />
    </div>
  )
}
