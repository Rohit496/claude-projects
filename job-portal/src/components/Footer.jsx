import { Link } from 'react-router-dom'
import { BriefcaseIcon } from './Icons.jsx'

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
          <ul>
            <li>
              <Link to="/jobs">Browse jobs</Link>
            </li>
            <li>
              <Link to="/saved">Saved jobs</Link>
            </li>
            <li>
              <Link to="/applications">Your applications</Link>
            </li>
            <li>
              <Link to="/profile">Tune your profile</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>Employers</h4>
          <ul>
            <li>
              <Link to="/post">Post a job</Link>
            </li>
            <li>
              <Link to="/companies">Company directory</Link>
            </li>
          </ul>
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
