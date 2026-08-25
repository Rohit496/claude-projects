import { useDocumentTitle } from './lib/useDocumentTitle.js'
import { useEffect } from 'react'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Toasts from './components/Toasts.jsx'
import Home from './pages/Home.jsx'
import Jobs from './pages/Jobs.jsx'
import JobPage from './pages/JobPage.jsx'
import Saved from './pages/Saved.jsx'
import Applications from './pages/Applications.jsx'
import Companies from './pages/Companies.jsx'
import CompanyPage from './pages/CompanyPage.jsx'
import Profile from './pages/Profile.jsx'
import PostJob from './pages/PostJob.jsx'
import Terms from './pages/Terms.jsx'

function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <div className="page">
      <div className="panel empty">
        <h1 className="empty-title">That page does not exist</h1>
        <p>The link may be out of date. The board is where most things start.</p>
        <Link to="/jobs" className="btn btn-primary">
          Browse open roles
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  const location = useLocation()

  // Each route sets its own tab title; this only restores scroll position.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:jobId" element={<JobPage />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:companyId" element={<CompanyPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/post" element={<PostJob />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toasts />
    </>
  )
}
