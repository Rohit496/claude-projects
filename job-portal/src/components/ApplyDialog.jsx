import { useEffect, useMemo, useState } from 'react'
import Dialog from './Dialog.jsx'
import CompanyLogo from './CompanyLogo.jsx'
import FitMeter from './FitMeter.jsx'
import { useApp } from '../store/AppStore.jsx'
import { SendIcon } from './Icons.jsx'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function ApplyDialog({ job, fit, open, onClose }) {
  const { profile, applyToJob } = useApp()
  const [form, setForm] = useState(() => ({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    portfolio: profile.portfolio,
    note: '',
    resumeName: '',
  }))
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState(false)

  // Reopening for a different role should start from the profile again, not
  // from whatever was half-typed last time.
  useEffect(() => {
    if (!open) return
    setForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      portfolio: profile.portfolio,
      note: '',
      resumeName: '',
    })
    setErrors({})
    setTouched(false)
  }, [open, job?.id, profile])

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const validation = useMemo(() => {
    const next = {}
    if (!form.name.trim()) next.name = 'Enter the name the employer should see.'
    if (!form.email.trim()) next.email = 'Enter an email address they can reply to.'
    else if (!EMAIL.test(form.email.trim())) next.email = 'That email address is missing something.'
    if (form.note.trim().length > 0 && form.note.trim().length < 40)
      next.note = 'A note this short reads as filler. Write 40 characters or more, or leave it empty.'
    return next
  }, [form])

  if (!job) return null

  const submit = (event) => {
    event.preventDefault()
    setTouched(true)
    if (Object.keys(validation).length) {
      setErrors(validation)
      return
    }
    applyToJob(job, {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      portfolio: form.portfolio.trim(),
      note: form.note.trim(),
      resumeName: form.resumeName || 'No file attached',
    })
    onClose()
  }

  const shown = touched ? validation : errors

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={`Apply to ${job.title}`}
      description={`${job.company} · ${job.location}`}
      labelledBy="apply-title"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="apply-form" className="btn btn-primary">
            <SendIcon /> Send application
          </button>
        </>
      }
    >
      <div className="row" style={{ gap: 'var(--s-3)', justifyContent: 'space-between' }}>
        <div className="row" style={{ gap: 'var(--s-3)' }}>
          <CompanyLogo company={job.companyProfile} name={job.company} size={40} />
          <div>
            <strong style={{ fontSize: 'var(--t-base)' }}>{job.company}</strong>
            <p className="muted" style={{ fontSize: 'var(--t-xs)' }}>
              {job.companyKind}
            </p>
          </div>
        </div>
        {fit ? <FitMeter score={fit.score} size={40} /> : null}
      </div>

      <hr className="divider" />

      <form id="apply-form" className="form-grid" onSubmit={submit} noValidate>
        <div className="form-row">
          <div className="field">
            <label className="field-label" htmlFor="apply-name">
              Full name
            </label>
            <input
              id="apply-name"
              className="input"
              value={form.name}
              onChange={set('name')}
              aria-invalid={Boolean(shown.name)}
              aria-describedby={shown.name ? 'apply-name-error' : undefined}
              autoComplete="name"
              data-autofocus
            />
            {shown.name ? (
              <span className="field-error" id="apply-name-error">
                {shown.name}
              </span>
            ) : null}
          </div>
          <div className="field">
            <label className="field-label" htmlFor="apply-email">
              Email
            </label>
            <input
              id="apply-email"
              type="email"
              className="input"
              value={form.email}
              onChange={set('email')}
              aria-invalid={Boolean(shown.email)}
              aria-describedby={shown.email ? 'apply-email-error' : undefined}
              autoComplete="email"
            />
            {shown.email ? (
              <span className="field-error" id="apply-email-error">
                {shown.email}
              </span>
            ) : null}
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label className="field-label" htmlFor="apply-phone">
              Phone <span className="muted">(optional)</span>
            </label>
            <input
              id="apply-phone"
              className="input"
              value={form.phone}
              onChange={set('phone')}
              autoComplete="tel"
              placeholder="+91"
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="apply-portfolio">
              Portfolio or GitHub <span className="muted">(optional)</span>
            </label>
            <input
              id="apply-portfolio"
              className="input"
              value={form.portfolio}
              onChange={set('portfolio')}
              placeholder="github.com/you"
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="apply-resume">
            Résumé
          </label>
          <input
            id="apply-resume"
            type="file"
            className="input"
            accept=".pdf,.doc,.docx"
            onChange={(event) =>
              setForm((current) => ({ ...current, resumeName: event.target.files?.[0]?.name || '' }))
            }
          />
          <span className="field-hint">
            Nothing is uploaded. The file name is recorded on this device so you can see what you sent.
          </span>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="apply-note">
            Cover note <span className="muted">(optional)</span>
          </label>
          <textarea
            id="apply-note"
            className="textarea"
            value={form.note}
            onChange={set('note')}
            aria-invalid={Boolean(shown.note)}
            aria-describedby={shown.note ? 'apply-note-error' : 'apply-note-hint'}
            placeholder={
              fit?.missing?.length
                ? `Address the gaps directly: ${fit.missing.slice(0, 2).join(' and ')}.`
                : 'Say why this role, in your own words.'
            }
          />
          {shown.note ? (
            <span className="field-error" id="apply-note-error">
              {shown.note}
            </span>
          ) : (
            <span className="field-hint" id="apply-note-hint">
              {form.note.trim().length} characters. Short and specific beats long and general.
            </span>
          )}
        </div>
      </form>
    </Dialog>
  )
}
