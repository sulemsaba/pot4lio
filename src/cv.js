// The CV: shown on the CV page, and printed from that page to the PDF in /public
// (run `npm run cv:pdf`), so the two always match. Keep it short and scannable:
// one line per point, facts only.

export const cv = {
  name: 'Suleiman Msaba',
  headline: ['Software Developer and Business Operations', 'Banking and Finance Graduate'],
  // Two groups: how to reach him, then where to see the work.
  contact: [
    [
      { text: 'Dar es Salaam, Tanzania' },
      { text: '+255 768 944 291', href: 'tel:+255768944291' },
      { text: 'suleimanmsaba1@gmail.com', href: 'mailto:suleimanmsaba1@gmail.com' },
    ],
    [
      { text: 'Portfolio: sulemsaba.github.io/pot4lio', href: 'https://sulemsaba.github.io/pot4lio/' },
      { text: 'github.com/sulemsaba', href: 'https://github.com/sulemsaba' },
    ],
  ],

  profile:
    'Banking and finance graduate who builds websites, Android apps and business systems. At Exxonim Company Limited I combine software development with finance and operations: budgets, accounting records, reporting and audit support.',

  experience: [
    {
      role: 'Software Development and Business Operations',
      org: 'Exxonim Company Limited, Dar es Salaam',
      dates: 'Jan 2025 to present',
      bullets: [
        'Build and maintain websites, web apps, Android apps and internal business systems.',
        'Develop database-backed features and APIs; test, troubleshoot and improve them.',
        'Support budgets, expenditure tracking, accounting records and internal reporting.',
        'Assist with audit-related processes and financial and operational analysis.',
        'Work with stakeholders to turn requirements into tools that improve accuracy and efficiency.',
      ],
    },
    {
      role: 'Banking Intern',
      org: 'Tanzania Commercial Bank, Dar es Salaam',
      dates: 'Jul 2024 to Sep 2024',
      bullets: [
        'Served customers at the front office and teller desk, including account-related enquiries.',
        'Assisted with daily transaction processing and back-office book balancing.',
        'Supported accurate records and compliance documentation.',
      ],
    },
  ],

  projects: [
    { name: 'LigiPlay', what: 'Android app for eFootball leagues: fixtures, results read from screenshots, player confirmation and live tables.', tech: 'Flutter, FastAPI, PostgreSQL · Google Play' },
    { name: 'MangiPlus', what: 'Android app for small and medium-sized businesses.', tech: 'Google Play' },
    { name: 'consult.exxonim.tz', what: 'Website for company registration, licences, permits and compliance services.', tech: '' },
    { name: 'levo.or.tz', what: 'Website for Legal Vision Organization (LEVO), a legal aid and advocacy organisation.', tech: '' },
    { name: 'JOTOFA Group', what: 'Website proposal for a Tanzanian holding company in ICT, cleaning and staffing.', tech: 'frontendjotofa.vercel.app' },
    { name: 'Drax Raw', what: 'Portfolio website for a filmmaker: films, galleries and WhatsApp booking.', tech: 'sulemsaba.github.io/draxraw' },
  ],
  projectsNote: 'Other client and internal systems are private.',

  education: [
    { degree: 'Bachelor of Commerce, Banking and Financial Services', school: 'University of Dar es Salaam', dates: 'Sep 2022 to Oct 2025' },
    { degree: 'BSc Computer Science (in progress)', school: 'University of the People, online', dates: 'Sep 2025 to Aug 2027' },
  ],

  skills: [
    ['Development', 'Python, JavaScript, TypeScript, Dart, Flutter, React, HTML, CSS'],
    ['Backend and data', 'FastAPI, REST APIs, PostgreSQL, MySQL, SQL'],
    ['Tools', 'Git, GitHub, Docker Compose, Linux'],
    ['Finance and analysis', 'Budgeting, accounting records, financial reporting, audit support, Excel (PivotTables, Power Query), Power BI, Oracle Analytics, pandas'],
    ['Banking', 'Customer service, teller operations, transaction processing, compliance documentation'],
  ],

  certifications: [
    'CS50’s Introduction to Programming with Python (CS50P), HarvardX',
    'Software Architecture, Udemy',
    'NDG Hackathon 2025, Copenhagen',
  ],

  languages: 'Kiswahili, English, Arabic',
  interests: 'Charity and helping people',
}
