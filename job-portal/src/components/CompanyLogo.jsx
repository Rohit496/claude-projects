import { getCompany } from '../data/companies.jsx'
import { initials } from '../lib/format.js'

// Renders a company's drawn mark, falling back to tinted initials for a
// company that was posted locally and has no profile in the dataset.
export default function CompanyLogo({ company, name, size = 44, rounded }) {
  const profile = company || getCompany(name)
  const label = profile?.name || name || 'Company'
  const brand = profile?.brand || '#6c6c76'

  return (
    <div
      className="logo"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        borderRadius: rounded ? '50%' : undefined,
        '--brand': brand,
        '--brand-wash': `color-mix(in srgb, ${brand} 12%, var(--surface))`,
      }}
      aria-hidden="true"
    >
      {profile?.mark ? (
        <svg viewBox="0 0 24 24" role="presentation">
          {profile.mark}
        </svg>
      ) : (
        initials(label)
      )}
    </div>
  )
}
