// Company profiles and their logo marks.
//
// Every mark is drawn here as SVG rather than loaded from a CDN: the portal then
// renders identically offline, with no broken-image state and no third-party
// request on every card. Marks are authored on a 24×24 grid and inherit
// `currentColor`, so <CompanyLogo> only has to set a colour and a size.

export const COMPANIES = [
  {
    id: 'northwind-labs',
    name: 'Northwind Labs',
    brand: '#1F5F8B',
    tagline: 'Deployment tooling for teams that ship daily',
    industry: 'Developer tools',
    size: '120 people',
    hq: 'Bengaluru',
    founded: 2018,
    website: 'northwind.example',
    about:
      'Northwind builds the deploy pipeline and observability layer used by around 40,000 engineers each weekday. The company is remote-first across India, with a written-first culture: every significant decision lands as a document before it lands as a meeting.',
    perks: ['Remote-first', '₹1L learning budget', 'Sabbatical every third year', 'Four-day week in December'],
    mark: (
      <g fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8h9.5a3 3 0 1 0-3-3" />
        <path d="M4 12h12.5a3 3 0 1 1-3 3" />
        <path d="M4 16h7" />
      </g>
    ),
  },
  {
    id: 'tessellate',
    name: 'Tessellate',
    brand: '#6D3FBF',
    tagline: 'One design system, every surface',
    industry: 'Design systems',
    size: '45 people',
    hq: 'Pune',
    founded: 2020,
    website: 'tessellate.example',
    about:
      'Tessellate maintains component libraries and token pipelines for enterprise product teams. Small studio, unusually senior: designers read code, engineers sit in critique, and the library ships on a fixed fortnightly train.',
    perks: ['Three days in studio', 'Hardware of your choice', 'Open-source time', 'Annual studio week in Goa'],
    mark: (
      <g fill="currentColor">
        <path d="M3 3h8.5v8.5H3z" opacity=".95" />
        <path d="M12.5 3H21v8.5h-8.5z" opacity=".55" />
        <path d="M3 12.5h8.5V21H3z" opacity=".55" />
        <path d="M12.5 12.5H21V21h-8.5z" opacity=".95" />
      </g>
    ),
  },
  {
    id: 'windmill-payments',
    name: 'Windmill Payments',
    brand: '#0F766E',
    tagline: 'Settlement infrastructure that balances to the paisa',
    industry: 'Fintech infrastructure',
    size: '210 people',
    hq: 'Mumbai',
    founded: 2016,
    website: 'windmill.example',
    about:
      'Windmill runs the ledger and settlement rails behind several large Indian marketplaces, clearing north of two million transactions a day. Engineering is on-site by design: payments incidents are resolved in a room, together.',
    perks: ['Lower Parel office', 'Health cover for parents', 'Quarterly on-call bonus', 'Annual bonus tied to uptime'],
    mark: (
      <g fill="currentColor">
        <path d="M12 12 4.5 9.2A1 1 0 0 1 4.3 7.5l2.6-2.6a1 1 0 0 1 1.7.2z" />
        <path d="m12 12 2.8-7.5a1 1 0 0 1 1.7-.2l2.6 2.6a1 1 0 0 1-.2 1.7z" opacity=".7" />
        <path d="m12 12 7.5 2.8a1 1 0 0 1 .2 1.7l-2.6 2.6a1 1 0 0 1-1.7-.2z" />
        <path d="m12 12-2.8 7.5a1 1 0 0 1-1.7.2l-2.6-2.6a1 1 0 0 1 .2-1.7z" opacity=".7" />
      </g>
    ),
  },
  {
    id: 'lumen-analytics',
    name: 'Lumen Analytics',
    brand: '#B45309',
    tagline: 'Retail numbers the buying team can trust',
    industry: 'Retail intelligence',
    size: '80 people',
    hq: 'Hyderabad',
    founded: 2019,
    website: 'lumen.example',
    about:
      'Lumen turns point-of-sale and supply data from 900 stores into weekly decisions about what to buy and where to put it. Analysts sit with merchants, not in a separate reporting function.',
    perks: ['Two days remote', 'Certification budget', 'Full health cover', 'Profit share'],
    mark: (
      <g fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.6v3M12 18.4v3M2.6 12h3M18.4 12h3M5.4 5.4l2.1 2.1M16.5 16.5l2.1 2.1M18.6 5.4l-2.1 2.1M7.5 16.5l-2.1 2.1" />
      </g>
    ),
  },
  {
    id: 'ironbark-cloud',
    name: 'Ironbark Cloud',
    brand: '#3F3F46',
    tagline: 'Boring infrastructure, on purpose',
    industry: 'Cloud infrastructure',
    size: '340 people',
    hq: 'Remote (India)',
    founded: 2015,
    website: 'ironbark.example',
    about:
      'Ironbark operates managed Kubernetes and build infrastructure for companies that would rather not run their own. Fully distributed since founding, with error budgets that leadership actually respects.',
    perks: ['Remote-first', 'On-call compensated', 'ESOP with a ten-year window', 'Quarterly meetups'],
    mark: (
      <g fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
        <path d="M3.5 15.5c2.8-2.6 5.7-2.6 8.5 0s5.7 2.6 8.5 0" />
        <path d="M3.5 10.5c2.8-2.6 5.7-2.6 8.5 0s5.7 2.6 8.5 0" opacity=".65" />
        <path d="M3.5 20c2.8-2.6 5.7-2.6 8.5 0s5.7 2.6 8.5 0" opacity=".4" />
        <circle cx="12" cy="5" r="1.9" fill="currentColor" stroke="none" />
      </g>
    ),
  },
  {
    id: 'bluejay-health',
    name: 'Bluejay Health',
    brand: '#2563EB',
    tagline: 'Software for the twelve-hour shift',
    industry: 'Clinical software',
    size: '150 people',
    hq: 'Chennai',
    founded: 2017,
    website: 'bluejay.example',
    about:
      'Bluejay builds the charting and vitals software used across 60 hospitals in south India. Every product person shadows a real shift each quarter, because the difference between a good screen and a bad one is measured in minutes of a nurse’s night.',
    perks: ['Health cover from day one', 'Structured mentoring', 'Clinical shadowing', 'Three days on-site'],
    mark: (
      <g fill="currentColor">
        <path d="M20.4 4.6c-4.6-.9-8.6.6-11.4 3.7C6.6 10.9 5.4 14 4.6 18l2.6-1.6c2.1.5 4.4.2 6.4-1 2.9-1.7 4.7-4.6 5.3-8.2z" opacity=".9" />
        <path d="M3 21c.9-2.2 2.2-4 3.9-5.6" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'orchid-bio',
    name: 'Orchid Bio',
    brand: '#BE185D',
    tagline: 'Genomics, from sequencer to clinic',
    industry: 'Genomics',
    size: '95 people',
    hq: 'Bengaluru',
    founded: 2019,
    website: 'orchidbio.example',
    about:
      'Orchid runs a clinical genomics lab and the software that interprets what comes out of it. Engineering works to a regulated bar: every model decision is versioned, evaluated and auditable.',
    perks: ['Whitefield lab campus', 'Publication support', 'Relocation assistance', 'Sequencing for family'],
    mark: (
      <g fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
        <path d="M8 3c0 4.5 8 5.5 8 9s-8 4.5-8 9" />
        <path d="M16 3c0 4.5-8 5.5-8 9s8 4.5 8 9" opacity=".55" />
        <path d="M9 7.5h6M9 16.5h6" opacity=".8" />
      </g>
    ),
  },
  {
    id: 'marigold-studio',
    name: 'Marigold Studio',
    brand: '#A16207',
    tagline: 'Consumer apps with a point of view',
    industry: 'Consumer apps',
    size: '60 people',
    hq: 'Remote (India)',
    founded: 2021,
    website: 'marigold.example',
    about:
      'Marigold designs and operates its own consumer products, currently a savings app used by 400,000 people. Small teams, short cycles, and a house rule that research findings are reported without softening.',
    perks: ['Fully remote', 'Flexible hours', 'Credit on published work', 'Research travel covered'],
    mark: (
      <g fill="currentColor">
        <circle cx="12" cy="5.4" r="3.1" opacity=".9" />
        <circle cx="18.6" cy="12" r="3.1" opacity=".7" />
        <circle cx="12" cy="18.6" r="3.1" opacity=".9" />
        <circle cx="5.4" cy="12" r="3.1" opacity=".7" />
        <circle cx="12" cy="12" r="2.5" />
      </g>
    ),
  },
  {
    id: 'chakra-logistics',
    name: 'Chakra Logistics',
    brand: '#C2410C',
    tagline: 'Moving freight, and the data behind it',
    industry: 'Supply chain',
    size: '400 people',
    hq: 'Gurugram',
    founded: 2014,
    website: 'chakra.example',
    about:
      'Chakra coordinates line-haul and last-mile freight across 22 states. The technology group is a genuine product organisation inside a logistics business, which is as interesting and as difficult as it sounds.',
    perks: ['Three days in office', 'On-call compensated', 'Cloud certification budget', 'Flexible hours'],
    mark: (
      <g fill="none" stroke="currentColor" strokeWidth="2.1">
        <circle cx="12" cy="12" r="8.6" />
        <circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" />
        <path d="M12 3.4v4.2M12 16.4v4.2M3.4 12h4.2M16.4 12h4.2M5.9 5.9l3 3M15.1 15.1l3 3M18.1 5.9l-3 3M8.9 15.1l-3 3" strokeLinecap="round" opacity=".75" />
      </g>
    ),
  },
  {
    id: 'trailhead-learning',
    name: 'Trailhead Learning',
    brand: '#15803D',
    tagline: 'Courses that people actually finish',
    industry: 'Edtech',
    size: '175 people',
    hq: 'Remote (India)',
    founded: 2018,
    website: 'trailhead.example',
    about:
      'Trailhead teaches vocational skills to 1.2 million learners, and is honest internally about the fact that most of them stop early. Fixing that is the company’s whole roadmap.',
    perks: ['Remote-first', 'Learning stipend', 'Course access for family', 'Annual offsite'],
    mark: (
      <g fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.8 19.5h18.4" />
        <path d="m5.5 19.5 5.2-9 3 4.6 2-3 3.8 7.4" />
        <path d="M15.4 3.2v5.4M15.4 3.6l4.4 1.3-4.4 1.6" fill="currentColor" />
      </g>
    ),
  },
  {
    id: 'kavach-security',
    name: 'Kavach Security',
    brand: '#1E293B',
    tagline: 'The security review teams ask for',
    industry: 'Application security',
    size: '70 people',
    hq: 'Remote (India)',
    founded: 2020,
    website: 'kavach.example',
    about:
      'Kavach embeds application-security engineers into product teams and runs bug-bounty triage for its clients. The stated goal is to be the review that developers request, rather than the gate they route around.',
    perks: ['Fully remote', 'Research Fridays', 'Conference budget', 'Bounty split'],
    mark: (
      <g fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round">
        <path d="M12 2.8 4.6 6v6.1c0 4.3 3 8.1 7.4 9.1 4.4-1 7.4-4.8 7.4-9.1V6z" />
        <path d="m8.9 12.1 2.2 2.3 4-4.6" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'peppercorn',
    name: 'Peppercorn',
    brand: '#7C2D12',
    tagline: 'Banking built for the corner shop',
    industry: 'SMB fintech',
    size: '130 people',
    hq: 'Bengaluru',
    founded: 2019,
    website: 'peppercorn.example',
    about:
      'Peppercorn provides accounts, invoicing and credit to small businesses that larger banks find inconvenient. Support is treated as a product function, and its contact drivers set the roadmap each month.',
    perks: ['Koramangala office', 'Team performance bonus', 'Byline on your work', 'Leadership coaching'],
    mark: (
      <g fill="currentColor">
        <circle cx="12" cy="12" r="4.4" />
        <circle cx="12" cy="4.4" r="2.1" opacity=".8" />
        <circle cx="19.6" cy="12" r="2.1" opacity=".6" />
        <circle cx="12" cy="19.6" r="2.1" opacity=".8" />
        <circle cx="4.4" cy="12" r="2.1" opacity=".6" />
      </g>
    ),
  },
  {
    id: 'fernweh-travel',
    name: 'Fernweh Travel',
    brand: '#0E7490',
    tagline: 'Booking that works on two bars of signal',
    industry: 'Travel booking',
    size: '220 people',
    hq: 'Bengaluru',
    founded: 2016,
    website: 'fernweh.example',
    about:
      'Fernweh sells rail, bus and flight travel to a mostly mobile audience, much of it on low-end Android devices and unreliable networks. Performance work here is a product feature, not a chore.',
    perks: ['Two days remote', 'Annual travel credit', 'Device budget', 'Pro-rated leave on contracts'],
    mark: (
      <g fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8.8" />
        <path d="m15.6 8.4-2 5.2-5.2 2 2-5.2z" fill="currentColor" />
      </g>
    ),
  },
  {
    id: 'sable-robotics',
    name: 'Sable Robotics',
    brand: '#4338CA',
    tagline: 'Two hundred robots, one warehouse floor',
    industry: 'Warehouse robotics',
    size: '110 people',
    hq: 'Pune',
    founded: 2017,
    website: 'sable.example',
    about:
      'Sable builds autonomous mobile robots and the fleet software that keeps them out of each other’s way. Software people spend real time on the floor, because the floor is where the requirements are.',
    perks: ['Hinjawadi facility', 'Hardware lab access', 'Shift allowance', 'Patent bonus'],
    mark: (
      <g fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round">
        <rect x="3.6" y="7.6" width="16.8" height="12.4" rx="3.4" />
        <path d="M12 3v4.6" strokeLinecap="round" />
        <circle cx="12" cy="2.6" r="1.6" fill="currentColor" stroke="none" />
        <path d="M9 13.2v1.8M15 13.2v1.8" strokeLinecap="round" />
      </g>
    ),
  },
]

export const COMPANY_BY_ID = new Map(COMPANIES.map((c) => [c.id, c]))

export const companySlug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const getCompany = (nameOrId) =>
  COMPANY_BY_ID.get(nameOrId) ?? COMPANY_BY_ID.get(companySlug(nameOrId ?? ''))
