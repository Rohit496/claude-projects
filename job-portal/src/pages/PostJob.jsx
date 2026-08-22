import { useDocumentTitle } from '../lib/useDocumentTitle.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppStore.jsx'
import { WORK_MODES, JOB_TYPES, LEVELS, CATEGORIES } from '../data/taxonomy.js'
import { emptyJobDraft, hydrateJob } from '../lib/jobs.js'
import { scoreFit } from '../lib/fit.js'
import { formatSalary } from '../lib/format.js'
import FitMeter from '../components/FitMeter.jsx'
import CompanyLogo from '../components/CompanyLogo.jsx'
import { PlusIcon, CloseIcon, TrashIcon } from '../components/Icons.jsx'

// A repeated text row (responsibilities, requirements, benefits).
function ListEditor({ label, hint, items, onChange, placeholder }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      {hint ? <span className="field-hint">{hint}</span> : null}
      <div className="list-editor">
        {items.map((item, index) => (
          <div className="list-editor-row" key={index}>
            <input
              className="input"
              value={item}
              placeholder={placeholder}
              aria-label={`${label}, item ${index + 1}`}
              onChange={(event) => {
                const next = [...items]
                next[index] = event.target.value
                onChange(next)
              }}
            />
            <button
              type="button"
              className="icon-btn"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              aria-label={`Remove ${label.toLowerCase()} item ${index + 1}`}
              disabled={items.length === 1}
            >
              <TrashIcon size={16} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => onChange([...items, ''])}
        style={{ justifySelf: 'start' }}
      >
        <PlusIcon size={14} /> Add another
      </button>
    </div>
  )
}

export default function PostJob() {
  useDocumentTitle('Post a job')
  const { postJob, profile } = useApp()
  const navigate = useNavigate()
  const [draft, setDraft] = useState(emptyJobDraft)
  const [skillDraft, setSkillDraft] = useState('')
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState(false)
  const [failedSubmits, setFailedSubmits] = useState(0)
  const formRef = useRef(null)

  const set = (key) => (event) => setDraft((current) => ({ ...current, [key]: event.target.value }))

  const validation = useMemo(() => {
    const next = {}
    if (!draft.title.trim()) next.title = 'Give the role a title candidates would search for.'
    if (!draft.company.trim()) next.company = 'Name the hiring company.'
    if (!draft.location.trim()) next.location = 'Say where this role is based, or write Remote.'
    if (!draft.summary.trim()) next.summary = 'One sentence on what this person will actually do.'
    else if (draft.summary.trim().length < 30) next.summary = 'Too short to be useful. Write a full sentence.'
    const min = Number(draft.salary.min)
    const max = Number(draft.salary.max)
    if (draft.salary.min && draft.salary.max && min > max)
      next.salary = 'The minimum is above the maximum.'
    if (draft.skills.length === 0) next.skills = 'Add at least one skill — this is 45% of every candidate’s score.'
    return next
  }, [draft])

  const shown = touched ? validation : errors

  // Live preview: the listing is scored by the same engine candidates see.
  const preview = useMemo(() => {
    const job = hydrateJob({
      ...draft,
      id: 'preview',
      company: draft.company || 'Your company',
      title: draft.title || 'Untitled role',
      location: draft.location || 'Location',
      salary: {
        min: Number(draft.salary.min) || 0,
        max: Number(draft.salary.max) || 0,
      },
      applicants: 0,
      postedDaysAgo: 0,
      closesInDays: 30,
    })
    return { job, fit: scoreFit(job, profile) }
  }, [draft, profile])

  useEffect(() => {
    if (!failedSubmits) return
    const first = formRef.current?.querySelector('[aria-invalid="true"]')
    first?.focus({ preventScroll: false })
  }, [failedSubmits])

  const addSkill = (skill) => {
    const clean = skill.trim()
    if (!clean) return
    if (draft.skills.some((s) => s.toLowerCase() === clean.toLowerCase())) return
    setDraft((current) => ({ ...current, skills: [...current.skills, clean] }))
    setSkillDraft('')
  }

  const submit = (event) => {
    event.preventDefault()
    setTouched(true)
    if (Object.keys(validation).length) {
      setErrors(validation)
      // Focus is moved in an effect, not here: the aria-invalid attributes do not
      // exist in the DOM until React has committed this state change.
      setFailedSubmits((n) => n + 1)
      return
    }
    const job = postJob({
      ...draft,
      title: draft.title.trim(),
      company: draft.company.trim(),
      location: draft.location.trim(),
      summary: draft.summary.trim(),
      salary: { min: Number(draft.salary.min) || 0, max: Number(draft.salary.max) || 0 },
      responsibilities: draft.responsibilities.map((s) => s.trim()).filter(Boolean),
      requirements: draft.requirements.map((s) => s.trim()).filter(Boolean),
      benefits: draft.benefits.map((s) => s.trim()).filter(Boolean),
    })
    navigate(`/jobs/${job.id}`)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">For employers</p>
          <h1>Post a role</h1>
          <p>
            It goes live on the board immediately and is scored against every visitor’s profile by the
            same maths they see everywhere else. Stored in this browser only.
          </p>
        </div>
      </div>

      <form ref={formRef} onSubmit={submit} noValidate>
        <div className="split-content">
          <div>
            <section className="form-section">
              <h2>The basics</h2>
              <p>What the role is, and where.</p>
              <div className="form-grid">
                <div className="form-row">
                  <div className="field">
                    <label className="field-label" htmlFor="j-title">
                      Job title
                    </label>
                    <input
                      id="j-title"
                      className="input"
                      value={draft.title}
                      onChange={set('title')}
                      aria-invalid={Boolean(shown.title)}
                      aria-describedby={shown.title ? 'j-title-error' : undefined}
                      placeholder="Senior Frontend Engineer"
                    />
                    {shown.title ? (
                      <span className="field-error" id="j-title-error">
                        {shown.title}
                      </span>
                    ) : null}
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="j-company">
                      Company
                    </label>
                    <input
                      id="j-company"
                      className="input"
                      value={draft.company}
                      onChange={set('company')}
                      aria-invalid={Boolean(shown.company)}
                      aria-describedby={shown.company ? 'j-company-error' : undefined}
                      placeholder="Northwind Labs"
                    />
                    {shown.company ? (
                      <span className="field-error" id="j-company-error">
                        {shown.company}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="form-row">
                  <div className="field">
                    <label className="field-label" htmlFor="j-location">
                      Location
                    </label>
                    <input
                      id="j-location"
                      className="input"
                      value={draft.location}
                      onChange={set('location')}
                      aria-invalid={Boolean(shown.location)}
                      aria-describedby={shown.location ? 'j-location-error' : undefined}
                      placeholder="Bengaluru"
                    />
                    {shown.location ? (
                      <span className="field-error" id="j-location-error">
                        {shown.location}
                      </span>
                    ) : null}
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="j-category">
                      Function
                    </label>
                    <select id="j-category" className="select" value={draft.category} onChange={set('category')}>
                      {CATEGORIES.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="field">
                    <label className="field-label" htmlFor="j-mode">
                      Work mode
                    </label>
                    <select id="j-mode" className="select" value={draft.workMode} onChange={set('workMode')}>
                      {WORK_MODES.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="j-type">
                      Employment type
                    </label>
                    <select id="j-type" className="select" value={draft.type} onChange={set('type')}>
                      {JOB_TYPES.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="field">
                    <label className="field-label" htmlFor="j-level">
                      Seniority
                    </label>
                    <select id="j-level" className="select" value={draft.level} onChange={set('level')}>
                      {LEVELS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label} · {option.years}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <span className="field-label">Salary band, ₹ lakh per year</span>
                    <div className="list-editor-row">
                      <input
                        className="input"
                        type="number"
                        min="0"
                        value={draft.salary.min}
                        onChange={(event) =>
                          setDraft((c) => ({ ...c, salary: { ...c.salary, min: event.target.value } }))
                        }
                        aria-label="Minimum salary in lakh"
                        placeholder="Min"
                      />
                      <input
                        className="input"
                        type="number"
                        min="0"
                        value={draft.salary.max}
                        onChange={(event) =>
                          setDraft((c) => ({ ...c, salary: { ...c.salary, max: event.target.value } }))
                        }
                        aria-label="Maximum salary in lakh"
                        placeholder="Max"
                      />
                    </div>
                    {shown.salary ? <span className="field-error">{shown.salary}</span> : null}
                    <span className="field-hint">
                      Leave blank for “not disclosed”, and expect fewer good applications.
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="form-section">
              <h2>The pitch</h2>
              <p>What shows on the card, and the skills that drive every candidate’s score.</p>
              <div className="form-grid">
                <div className="field">
                  <label className="field-label" htmlFor="j-summary">
                    One-line summary
                  </label>
                  <textarea
                    id="j-summary"
                    className="textarea"
                    style={{ minHeight: 80 }}
                    value={draft.summary}
                    onChange={set('summary')}
                    aria-invalid={Boolean(shown.summary)}
                    aria-describedby={shown.summary ? 'j-summary-error' : undefined}
                    placeholder="Own the editor surface of a deployment tool used by 40,000 engineers every weekday."
                  />
                  {shown.summary ? (
                    <span className="field-error" id="j-summary-error">
                      {shown.summary}
                    </span>
                  ) : null}
                </div>

                <div className="field">
                  <span className="field-label">Skills</span>
                  <span className="field-hint">
                    45 of every candidate’s 100 points. List what the job needs, not everything you like.
                  </span>
                  {draft.skills.length ? (
                    <div className="tag-row" style={{ marginBottom: 'var(--s-2)' }}>
                      {draft.skills.map((skill) => (
                        <span key={skill} className="chip chip-accent">
                          {skill}
                          <button
                            type="button"
                            className="chip-dismiss"
                            onClick={() =>
                              setDraft((c) => ({ ...c, skills: c.skills.filter((s) => s !== skill) }))
                            }
                            aria-label={`Remove ${skill}`}
                          >
                            <CloseIcon size={9} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
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
                      aria-invalid={Boolean(shown.skills)}
                    />
                    <button type="button" className="btn btn-secondary" onClick={() => addSkill(skillDraft)}>
                      <PlusIcon size={15} /> Add
                    </button>
                  </div>
                  {shown.skills ? <span className="field-error">{shown.skills}</span> : null}
                </div>
              </div>
            </section>

            <section className="form-section">
              <h2>The detail</h2>
              <p>Empty rows are dropped, so leave out anything you have nothing real to say about.</p>
              <div className="form-grid">
                <ListEditor
                  label="What they will do"
                  items={draft.responsibilities}
                  placeholder="Ship the new log viewer, from prototype to rollout."
                  onChange={(responsibilities) => setDraft((c) => ({ ...c, responsibilities }))}
                />
                <ListEditor
                  label="What you expect"
                  items={draft.requirements}
                  placeholder="Six or more years writing production React."
                  onChange={(requirements) => setDraft((c) => ({ ...c, requirements }))}
                />
                <ListEditor
                  label="What they get"
                  items={draft.benefits}
                  placeholder="Fully remote within India"
                  onChange={(benefits) => setDraft((c) => ({ ...c, benefits }))}
                />
              </div>
            </section>

            <div className="form-foot">
              <button type="button" className="btn btn-secondary" onClick={() => setDraft(emptyJobDraft())}>
                Reset form
              </button>
              <button type="submit" className="btn btn-primary btn-lg">
                Publish listing
              </button>
            </div>
          </div>

          <aside className="side-panel">
            <div className="panel panel-pad">
              <p className="eyebrow" style={{ marginBottom: 'var(--s-3)' }}>
                Live preview
              </p>
              <div className="row" style={{ gap: 'var(--s-3)', marginBottom: 'var(--s-3)' }}>
                <CompanyLogo name={draft.company || 'Your company'} size={42} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3 style={{ fontSize: 'var(--t-base)', fontFamily: 'var(--font-body)' }}>
                    {draft.title || 'Untitled role'}
                  </h3>
                  <p className="muted" style={{ fontSize: 'var(--t-xs)' }}>
                    {draft.company || 'Your company'} · {draft.location || 'Location'}
                  </p>
                </div>
                <FitMeter score={preview.fit.score} size={40} />
              </div>
              <p className="muted" style={{ fontSize: 'var(--t-sm)' }}>
                {draft.summary || 'Your one-line summary appears here.'}
              </p>
              <div className="tag-row" style={{ marginTop: 'var(--s-3)' }}>
                <span className="chip chip-mono">{formatSalary(preview.job.salary)}</span>
                <span className="chip">{WORK_MODES.find((m) => m.id === draft.workMode)?.label}</span>
              </div>
              <p className="field-hint" style={{ marginTop: 'var(--s-4)' }}>
                Scored {preview.fit.score} against your own profile — a rough check on whether the
                listing describes who you actually want.
              </p>
            </div>
          </aside>
        </div>
      </form>
    </div>
  )
}
