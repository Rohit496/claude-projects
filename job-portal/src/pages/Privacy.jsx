import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../lib/useDocumentTitle.js'
import { useApp } from '../store/AppStore.jsx'
import { KEYS } from '../lib/storage.js'
import { ConfirmDialog } from '../components/Dialog.jsx'

// Read off KEYS rather than retyping the strings: if a key is renamed or versioned,
// the policy renames with it instead of quietly describing storage that no longer exists.
const STORED = [
  { key: KEYS.profile, what: 'Your skills, seniority, city, work mode and salary floor — the five inputs every fit score is measured against.' },
  { key: KEYS.saved, what: 'The ids of the roles you bookmarked.' },
  { key: KEYS.applications, what: 'Applications you sent: the role, the stage you moved it to, and anything you typed into the form.' },
  { key: KEYS.postedJobs, what: 'Listings you posted yourself.' },
  { key: KEYS.recentSearches, what: 'Your last six searches, offered back as suggestions.' },
  { key: KEYS.theme, what: 'Light or dark, so the page does not flash the wrong one on load.' },
]

export default function Privacy() {
  useDocumentTitle('Privacy Policy')
  const { resetEverything } = useApp()
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Privacy</p>
          <h1>Privacy Policy</h1>
          <p>
            Shortlist has no server behind it. Nothing you type here is transmitted anywhere — it is
            written to this browser&rsquo;s <span className="mono">localStorage</span> and stays on this
            device.
          </p>
        </div>
      </div>

      <div className="panel panel-pad stack" style={{ gap: 'var(--s-6)' }}>
        <section className="detail-section">
          <h2>What is stored</h2>
          <p>Six keys under this site, and nothing else.</p>
          <ul className="bullets" style={{ marginTop: 'var(--s-3)' }}>
            {STORED.map((entry) => (
              <li key={entry.key}>
                <span className="mono">{entry.key}</span> — {entry.what}
              </li>
            ))}
          </ul>
        </section>

        <section className="detail-section">
          <h2>What is not collected</h2>
          <ul className="bullets bullets--check">
            <li>No account and no sign-in. The portal never asks for an email address or a password.</li>
            <li>No cookies, no analytics, no trackers, no advertising.</li>
            <li>
              No third-party requests. Company logos are inline SVG and the fonts ship with the app, so
              the page renders identically offline.
            </li>
            <li>
              Nothing is shared with an employer. The companies and roles are invented, and an
              application has no one on the other end to receive it.
            </li>
          </ul>
        </section>

        <section className="detail-section">
          <h2>Erasing it</h2>
          <p>
            Clearing site data in your browser removes all of it. You can also do it here — this wipes
            your profile, saved roles, applications, posted listings and recent searches, and puts the
            portal back to how it looked on a first visit.
          </p>
          <div style={{ marginTop: 'var(--s-4)' }}>
            <button type="button" className="btn btn-danger" onClick={() => setConfirming(true)}>
              Erase everything stored here
            </button>
          </div>
        </section>

        <p className="muted" style={{ fontSize: 'var(--t-sm)' }}>
          Shortlist is a demonstration project rather than a commercial service, so this page describes
          what the code actually does — see{' '}
          <Link to="/jobs" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            the board
          </Link>{' '}
          for the rest of it.
        </p>
      </div>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={resetEverything}
        title="Erase everything stored here?"
        description="Your profile, saved roles, applications, posted listings and recent searches will be deleted. This cannot be undone."
        confirmLabel="Erase it all"
        tone="danger"
      />
    </div>
  )
}
