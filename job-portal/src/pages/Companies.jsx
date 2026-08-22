import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/AppStore.jsx'
import { COMPANIES } from '../data/companies.jsx'
import { plural } from '../lib/format.js'
import CompanyLogo from '../components/CompanyLogo.jsx'
import { SearchIcon, BuildingIcon } from '../components/Icons.jsx'

export default function Companies() {
  const { jobs } = useApp()
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return COMPANIES.map((company) => ({
      company,
      open: jobs.filter((job) => job.companyId === company.id).length,
    }))
      .filter(({ company }) =>
        !needle ||
        [company.name, company.industry, company.hq, company.tagline]
          .join(' ')
          .toLowerCase()
          .includes(needle),
      )
      .sort((a, b) => b.open - a.open || a.company.name.localeCompare(b.company.name))
  }, [jobs, q])

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Directory</p>
          <h1>Companies hiring on Shortlist</h1>
          <p>{COMPANIES.length} teams across engineering, design, data, product, marketing and operations.</p>
        </div>
        <div className="search-field" style={{ minWidth: 260 }}>
          <SearchIcon size={16} />
          <input
            className="input"
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search companies"
            aria-label="Search companies"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="panel empty">
          <span className="empty-mark">
            <BuildingIcon size={22} />
          </span>
          <h3>No company matches “{q}”</h3>
          <p>Try an industry, a city, or part of the name.</p>
          <button type="button" className="btn btn-secondary" onClick={() => setQ('')}>
            Clear search
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {rows.map(({ company, open }) => (
            <Link key={company.id} to={`/companies/${company.id}`} className="panel panel-pad company-card">
              <div className="row" style={{ gap: 'var(--s-3)', marginBottom: 'var(--s-3)' }}>
                <CompanyLogo company={company} size={46} />
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: 'var(--t-md)', fontFamily: 'var(--font-body)' }}>{company.name}</h3>
                  <p className="muted" style={{ fontSize: 'var(--t-xs)' }}>
                    {company.industry} · {company.hq}
                  </p>
                </div>
              </div>
              <p className="muted" style={{ fontSize: 'var(--t-sm)' }}>
                {company.tagline}
              </p>
              <div className="row" style={{ gap: 'var(--s-2)', marginTop: 'var(--s-4)' }}>
                <span className={`chip ${open > 0 ? 'chip-accent' : ''}`}>
                  {open > 0 ? plural(open, 'open role') : 'No open roles'}
                </span>
                <span className="chip">{company.size}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
