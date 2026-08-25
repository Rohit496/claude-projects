import { Link } from 'react-router-dom'
import { BriefcaseIcon } from './Icons.jsx'
import Tooltip from './Tooltip.jsx'

// Every footer link carries a hint, so a column reads the same way whichever row the
// cursor lands on. Keep them to one line — the bubble is capped at 16rem.
const CANDIDATE_LINKS = [
  { to: '/jobs', label: 'Browse jobs', hint: 'Every listing, scored against your profile.' },
  { to: '/saved', label: 'Saved jobs', hint: 'Roles you bookmarked to come back to.' },
  { to: '/applications', label: 'Your applications', hint: 'What you sent, and where each one stands.' },
  { to: '/profile', label: 'Tune your profile', hint: 'Edit skills, seniority, location and pay to re-score every role.' },
]

const EMPLOYER_LINKS = [
  { to: '/post', label: 'Post a job', hint: 'Publish a role and see which candidates fit it.' },
  { to: '/companies', label: 'Company directory', hint: 'Browse every company hiring on Shortlist.' },
]

function FooterLinks({ links }) {
  return (
    <ul>
      {links.map((link) => (
        <li key={link.to}>
          <Tooltip label={link.hint}>
            <Link to={link.to}>{link.label}</Link>
          </Tooltip>
        </li>
      ))}
    </ul>
  )
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <span className="brand">
            <span className="brand-mark">
              <BriefcaseIcon size={16} />
            </span>
            Shortlist
          </span>
          <p className="footer-blurb">
            A job board that scores every opening against your profile, so you can apply to four roles
            properly instead of forty badly.
          </p>
        </div>
        <div>
          <h4>Candidates</h4>
          <FooterLinks links={CANDIDATE_LINKS} />
        </div>
        <div>
          <h4>Employers</h4>
          <FooterLinks links={EMPLOYER_LINKS} />
        </div>
        <div>
          <h4>How it works</h4>
          <ul>
            <li>Fit is scored on skills, seniority, location and pay.</li>
            <li>Everything is stored in this browser only.</li>
          </ul>
        </div>
      </div>
      <div className="footer-note">
        <span>Shortlist — a demonstration portal. The companies and roles are invented.</span>
        <span className="mono">No server · No account · localStorage only</span>
      </div>
    </footer>
  )
}
