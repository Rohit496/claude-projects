import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../store/AppStore.jsx'
import { COMPANY_BY_ID } from '../data/companies.jsx'
import { scoreFit } from '../lib/fit.js'
import { sortJobs } from '../lib/filters.js'
import { plural } from '../lib/format.js'
import CompanyLogo from '../components/CompanyLogo.jsx'
import JobCard from '../components/JobCard.jsx'
import { ArrowLeftIcon, BuildingIcon, CheckIcon } from '../components/Icons.jsx'

export default function CompanyPage() {
  const { companyId } = useParams()
  const navigate = useNavigate()
  const { jobs, profile } = useApp()
  const company = COMPANY_BY_ID.get(companyId)

  if (!company) {
    return (
      <div className="page">
        <div className="panel empty">
          <span className="empty-mark">
            <BuildingIcon size={22} />
          </span>
          <h3>No such company</h3>
          <p>The link may be wrong, or the company may have left the board.</p>
          <Link to="/companies" className="btn btn-primary">
            Company directory
          </Link>
        </div>
      </div>
    )
  }

  const openRoles = sortJobs(
    jobs.filter((job) => job.companyId === company.id).map((job) => ({ job, fit: scoreFit(job, profile) })),
    'fit',
  )

  return (
    <div className="page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/companies">
          <ArrowLeftIcon size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> Companies
        </Link>
        <span aria-hidden="true">/</span>
        <span>{company.name}</span>
      </nav>

      <header className="company-hero" style={{ '--brand': company.brand }}>
        <CompanyLogo company={company} size={82} />
        <div className="company-hero-body">
          <p className="eyebrow">{company.industry}</p>
          <h1>{company.name}</h1>
          <p>{company.tagline}</p>
        </div>
        <Link to={`/jobs?q=${encodeURIComponent(company.name)}`} className="btn btn-primary">
          {openRoles.length > 0 ? `See ${plural(openRoles.length, 'open role')}` : 'Search the board'}
        </Link>
      </header>

      <div className="split-content" style={{ marginTop: 'var(--s-5)' }}>
        <div>
          <section className="panel panel-pad">
            <h2 style={{ fontSize: 'var(--t-md)', fontFamily: 'var(--font-body)', marginBottom: 'var(--s-3)' }}>
              About {company.name}
            </h2>
            <p style={{ color: 'var(--ink-2)' }}>{company.about}</p>
            <dl className="company-facts">
              <div className="company-fact">
                <span>Headquarters</span>
                <strong>{company.hq}</strong>
              </div>
              <div className="company-fact">
                <span>Size</span>
                <strong>{company.size}</strong>
              </div>
              <div className="company-fact">
                <span>Founded</span>
                <strong className="mono">{company.founded}</strong>
              </div>
              <div className="company-fact">
                <span>Website</span>
                <strong className="mono" style={{ fontSize: 'var(--t-sm)' }}>
                  {company.website}
                </strong>
              </div>
            </dl>
          </section>

          <section style={{ marginTop: 'var(--s-5)' }}>
            <div className="section-head" style={{ marginBottom: 'var(--s-4)' }}>
              <div>
                <h2 style={{ fontSize: 'var(--t-lg)' }}>
                  {openRoles.length > 0 ? plural(openRoles.length, 'open role') : 'No open roles'}
                </h2>
                {openRoles.length > 0 ? (
                  <p className="muted" style={{ fontSize: 'var(--t-sm)' }}>
                    Scored against your profile, best fit first.
                  </p>
                ) : null}
              </div>
            </div>
            {openRoles.length === 0 ? (
              <div className="panel empty">
                <h3>Nothing open here right now</h3>
                <p>{company.name} has no live listings. Other teams on the board are hiring.</p>
                <Link to="/jobs" className="btn btn-secondary">
                  Browse all roles
                </Link>
              </div>
            ) : (
              <div className="stack" style={{ gap: 'var(--s-3)' }}>
                {openRoles.map(({ job, fit }) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    fit={fit}
                    onSelect={(next) => navigate(`/jobs/${next.id}`)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="side-panel">
          <div className="panel panel-pad">
            <h3 style={{ fontSize: 'var(--t-base)', fontFamily: 'var(--font-body)', marginBottom: 'var(--s-3)' }}>
              What they offer
            </h3>
            <ul className="bullets bullets--check">
              {company.perks.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
