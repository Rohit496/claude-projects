import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useApp } from '../store/AppStore.jsx'
import { SunIcon, MoonIcon, MenuIcon, CloseIcon, BriefcaseIcon } from './Icons.jsx'

const LINKS = [
  { to: '/jobs', label: 'Find jobs' },
  { to: '/companies', label: 'Companies' },
  { to: '/saved', label: 'Saved', count: 'saved' },
  { to: '/applications', label: 'Applications', count: 'applications' },
  { to: '/profile', label: 'Profile' },
]

export default function Header() {
  const { theme, toggleTheme, savedIds, applications } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // A route change closes the mobile sheet. Tapping the link for the page you are
  // already on does not change the pathname, so the links also close it directly.
  useEffect(() => setMenuOpen(false), [location.pathname])

  const counts = { saved: savedIds.length, applications: applications.length }

  const links = LINKS.map((link) => {
    const count = link.count ? counts[link.count] : 0
    return (
      <NavLink
        key={link.to}
        to={link.to}
        onClick={() => setMenuOpen(false)}
        className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
      >
        {link.label}
        {count > 0 ? <span className="nav-count">{count}</span> : null}
      </NavLink>
    )
  })

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <NavLink to="/" className="brand" aria-label="Shortlist, home">
            <span className="brand-mark">
              <BriefcaseIcon size={16} />
            </span>
            Shortlist
          </NavLink>

          <nav className="nav" aria-label="Main">
            {links}
          </nav>

          <div className="header-actions">
            <NavLink to="/post" className="btn btn-secondary btn-sm">
              Post a job
            </NavLink>
            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              type="button"
              className="icon-btn nav-toggle"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <nav className="mobile-nav" id="mobile-nav" aria-label="Main">
          {links}
        </nav>
      ) : null}
    </>
  )
}
