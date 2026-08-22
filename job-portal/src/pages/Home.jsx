import { useDocumentTitle } from '../lib/useDocumentTitle.js'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppStore.jsx'
import { sortJobs, filterJobs, EMPTY_FILTERS } from '../lib/filters.js'
import { COMPANIES } from '../data/companies.jsx'
import { formatCount, plural } from '../lib/format.js'
import JobCard from '../components/JobCard.jsx'
import CompanyLogo from '../components/CompanyLogo.jsx'
import FitMeter, { FitBreakdown } from '../components/FitMeter.jsx'
import { SearchIcon, PinIcon, ArrowRightIcon, SparkIcon } from '../components/Icons.jsx'

const POPULAR = ['React', 'Python', 'Design systems', 'Kubernetes', 'SQL', 'Remote']

export default function Home() {
  useDocumentTitle(null)
  const { jobs, profile, recentSearches, rememberSearch } = useApp()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [location, setLocation] = useState('')

  // The hero panel cycles through real listings, scoring each one live against
  // the visitor's profile. It is the product's whole argument in one component.
  const scored = useMemo(
    () => sortJobs(filterJobs(jobs, EMPTY_FILTERS, profile), 'fit'),
    [jobs, profile],
  )
  const [demoIndex, setDemoIndex] = useState(0)

  useEffect(() => {
    if (scored.length === 0) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const id = setInterval(() => setDemoIndex((i) => (i + 1) % Math.min(5, scored.length)), 4200)
    return () => clearInterval(id)
  }, [scored.length])

  const demo = scored[demoIndex % Math.max(1, scored.length)]
  const freshCount = jobs.filter((job) => Date.now() - job.postedAt < 3 * 86400000).length
  const remoteCount = jobs.filter((job) => job.workMode === 'remote').length
  const strongCount = scored.filter((entry) => entry.fit.score >= 78).length

  const search = (event) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (location.trim()) params.set('location', location.trim())
    rememberSearch(q)
    navigate(`/jobs?${params.toString()}`)
  }

  const topMatches = scored.slice(0, 6)
  const recent = sortJobs(scored, 'recent').slice(0, 3)

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-copy">
              <p className="eyebrow">{formatCount(jobs.length)} open roles · scored, not listed</p>
              <h1>
                Stop applying to <em>forty</em> jobs.
              </h1>
              <p className="hero-lede">
                Shortlist scores every opening against your skills, seniority, location and pay floor —
                and shows its working, so you know which four are worth a real application.
              </p>
            </div>

            <form className="search-console" onSubmit={search} role="search">
              <div className="search-row">
                <div className="search-field">
                  <SearchIcon size={16} />
                  <input
                    className="input"
                    type="search"
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    placeholder="Role, company or skill"
                    aria-label="Search by role, company or skill"
                  />
                </div>
                <div className="search-field">
                  <PinIcon size={16} />
                  <input
                    className="input"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="City, or “remote”"
                    aria-label="Location"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Search
                </button>
              </div>
              <div className="search-recent">
                <span>{recentSearches.length ? 'Recent:' : 'Try:'}</span>
                {(recentSearches.length ? recentSearches : POPULAR).slice(0, 5).map((term) => (
                  <Link key={term} to={`/jobs?q=${encodeURIComponent(term)}`} className="chip">
                    {term}
                  </Link>
                ))}
              </div>
            </form>

            <div className="hero-stats">
              <div className="hero-stat">
                <strong className="mono">{jobs.length}</strong>
                <span>Open roles</span>
              </div>
              <div className="hero-stat">
                <strong className="mono">{strongCount}</strong>
                <span>Strong matches for you</span>
              </div>
              <div className="hero-stat">
                <strong className="mono">{remoteCount}</strong>
                <span>Fully remote</span>
              </div>
              <div className="hero-stat">
                <strong className="mono">{freshCount}</strong>
                <span>Posted this week</span>
              </div>
            </div>
          </div>

          {demo ? (
            <aside className="fit-demo" aria-label="Live fit scoring example">
              <div className="fit-demo-head">
                <div className="fit-demo-job">
                  <CompanyLogo company={demo.job.companyProfile} name={demo.job.company} size={40} />
                  <div style={{ minWidth: 0 }}>
                    <h3>{demo.job.title}</h3>
                    <p>
                      {demo.job.company} · {demo.job.location}
                    </p>
                  </div>
                </div>
                <FitMeter score={demo.fit.score} size={52} />
              </div>
              <FitBreakdown key={demo.job.id} fit={demo.fit} />
              <p className="fit-demo-foot">
                Scored against your profile: {profile.level} level, {profile.location},{' '}
                {plural(profile.skills.length, 'skill')}, ₹{profile.minSalary}L floor.{' '}
                <Link to="/profile" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                  Tune it
                </Link>
                .
              </p>
            </aside>
          ) : null}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Ranked for you</p>
            <h2>Your strongest matches today</h2>
            <p>
              Ordered by fit, not by how recently someone paid to promote them.
            </p>
          </div>
          <Link to="/jobs" className="btn btn-secondary">
            See all {jobs.length} roles <ArrowRightIcon size={15} />
          </Link>
        </div>
        <div className="card-grid">
          {topMatches.map(({ job, fit }) => (
            <JobCard key={job.id} job={job} fit={fit} onSelect={() => navigate(`/jobs/${job.id}`)} />
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingBlock: 0 }}>
        <div className="section-head">
          <div>
            <p className="eyebrow">How it works</p>
            <h2>Four inputs, one number, no mystery</h2>
            <p>
              Every score is the sum of four weighted parts. Open any role and you can see exactly
              which part cost you points.
            </p>
          </div>
        </div>
        <div className="steps">
          <div className="step">
            <h3>Tell it what you want</h3>
            <p>
              Skills, seniority, where you will work and the least you will accept. Five fields, one
              minute, stored on this device.
            </p>
          </div>
          <div className="step">
            <h3>Every role gets scored</h3>
            <p>
              Skills carry 45 points, seniority 20, location 20, pay 15. The same maths runs on every
              listing on the board.
            </p>
          </div>
          <div className="step">
            <h3>Read the breakdown</h3>
            <p>
              A 62 that is short on pay is a different problem from a 62 that is short on skills. The
              panel names the gap.
            </p>
          </div>
          <div className="step">
            <h3>Apply to the few</h3>
            <p>
              Track what you sent and where it got to, from applied through to offer, without a
              spreadsheet.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Hiring now</p>
            <h2>Companies on the board</h2>
            <p>{COMPANIES.length} teams, from a 45-person studio to a 400-person logistics operator.</p>
          </div>
          <Link to="/companies" className="btn btn-secondary">
            Company directory <ArrowRightIcon size={15} />
          </Link>
        </div>
        <div className="company-grid">
          {COMPANIES.slice(0, 12).map((company) => {
            const open = jobs.filter((job) => job.companyId === company.id).length
            return (
              <Link key={company.id} to={`/companies/${company.id}`} className="company-tile">
                <CompanyLogo company={company} size={40} />
                <div className="company-tile-body">
                  <h3>{company.name}</h3>
                  <p>{open > 0 ? plural(open, 'open role') : company.industry}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Just posted</p>
            <h2>Newest on the board</h2>
          </div>
        </div>
        <div className="card-grid">
          {recent.map(({ job, fit }) => (
            <JobCard key={job.id} job={job} fit={fit} onSelect={() => navigate(`/jobs/${job.id}`)} />
          ))}
        </div>
      </section>

      <section>
        <div className="cta-band">
          <div>
            <p className="eyebrow" style={{ color: 'var(--signal-bright)' }}>
              For employers
            </p>
            <h2>Post a role and see who it actually fits</h2>
            <p>
              Your listing is scored by the same four-part maths every candidate sees. Write it
              honestly and the right people find it.
            </p>
          </div>
          <Link to="/post" className="btn btn-secondary btn-lg">
            <SparkIcon size={16} /> Post a job
          </Link>
        </div>
      </section>
    </>
  )
}
