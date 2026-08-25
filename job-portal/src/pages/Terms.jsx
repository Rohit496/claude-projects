import { useDocumentTitle } from '../lib/useDocumentTitle.js'
import { Link } from 'react-router-dom'
import { WEIGHTS } from '../lib/fit.js'

// Stated, not computed: a terms page that re-dated itself on every visit would be
// worthless as a record of what was agreed to.
const LAST_REVIEWED = '25 August 2026'

export default function Terms() {
  useDocumentTitle('Terms of Service')

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Legal</p>
          <h1>Terms of Service</h1>
          <p>
            Shortlist is a demonstration job board. These terms set out what that means for you,
            and what it does not.
          </p>
        </div>
      </div>

      <div className="panel panel-pad legal">
        <section>
          <h2>What Shortlist is</h2>
          <p>
            A worked example of a job board, not a hiring service. Every company, role, salary band
            and logo shipped with the app is invented. No real employer sees anything you do here,
            and nothing on this site is an offer of employment.
          </p>
        </section>

        <section>
          <h2>There is no account</h2>
          <p>
            You are not registering for anything and there is nothing to sign in to. Your profile,
            saved roles, applications and posted jobs are written to this browser&rsquo;s local
            storage and go no further — there is no server to send them to.
          </p>
          <ul className="bullets">
            <li>Clearing site data, or opening the site in a private window, erases all of it.</li>
            <li>Anyone who can use this browser can read it and change it.</li>
            <li>Nothing is backed up, and nothing can be recovered for you.</li>
          </ul>
        </section>

        <section>
          <h2>Applying and posting</h2>
          <p>
            Applying to a role records it locally so the board can show you where it stands. Nobody
            receives it and nobody will reply. Posting a job adds a listing to your own copy of the
            board; no other visitor can see it. Keep real personal details — yours or anyone
            else&rsquo;s — out of both.
          </p>
        </section>

        <section>
          <h2>Fit scores are a heuristic</h2>
          <p>
            Every role is scored out of 100 from four weighted parts: skills {WEIGHTS.skills},
            seniority {WEIGHTS.level}, location {WEIGHTS.place} and pay {WEIGHTS.pay}. That is a way
            to sort a list, not an assessment of you or advice about your career. Read a low score as
            a prompt to look closer, not as a verdict.
          </p>
        </section>

        <section>
          <h2>No warranty</h2>
          <p>
            The site is provided as it is, with no promise that it works, stays available, or keeps
            your data intact. Since everything runs in your browser and nothing is transmitted, the
            most that can go wrong is losing what is stored here — so do not keep anything here you
            would miss.
          </p>
        </section>

        <section>
          <h2>Changes</h2>
          <p>
            These terms may change as the demonstration does. The current version is always the one
            on this page, dated below.
          </p>
          <p className="legal-date mono">Last reviewed {LAST_REVIEWED}</p>
        </section>
      </div>

      <p className="legal-back">
        <Link to="/jobs">Back to the board</Link>
      </p>
    </div>
  )
}
