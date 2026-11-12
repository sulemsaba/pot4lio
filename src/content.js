// Everything the site says lives in this file, in English (en) and Kiswahili (sw).
// Edit text and links here; the components never need to change.
// A link left empty ('') is hidden on the site.

export const profile = {
  name: 'Suleiman Msaba',
  city: 'Dar es Salaam',
  timeZone: 'Africa/Dar_es_Salaam',
  links: {
    email: 'suleimanmsaba1@gmail.com',
    whatsapp: '255768944291', // international format, digits only
    github: 'https://github.com/sulemsaba',
    linkedin: '', // e.g. 'https://www.linkedin.com/in/your-handle'
    cv: 'suleiman-msaba-cv.pdf', // file in /public
  },
}

export const copy = {
  en: {
    role: 'Banking · Business · Software',
    statement: 'I build websites, Android apps and business systems in Dar es Salaam.',
    intro:
      'I studied Banking and Financial Services at the University of Dar es Salaam. At Exxonim Company Limited I work across software development and business operations: building websites, apps and internal systems, and supporting budgets, accounting, reporting and audit.',
    now: 'Studying Computer Science at University of the People. Open to new roles and freelance projects.',
    getInTouch: 'Get in touch',
    downloadCv: 'Download CV',
    work: 'Work',
    privateWork: 'Other websites, business systems and client applications are private or confidential, so they are not listed here.',
    experience: 'Experience',
    skills: 'Skills',
    education: 'Education',
    certificates: 'Certificates',
    contact: 'Contact',
    contactLine: 'Have a role or a project in mind? I would like to hear about it.',
    email: 'Email',
    whatsapp: 'WhatsApp',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    cv: 'CV (PDF)',
    visit: 'Visit',
    localTime: 'Local time in Dar es Salaam',
    language: 'Language',
    skip: 'Skip to content',
    opensNewTab: 'opens in a new tab',
  },
  sw: {
    role: 'Benki · Biashara · Programu',
    statement: 'Ninatengeneza tovuti, programu za Android na mifumo ya biashara, jijini Dar es Salaam.',
    intro:
      'Nilisoma Benki na Huduma za Fedha katika Chuo Kikuu cha Dar es Salaam. Katika Exxonim Company Limited ninafanya kazi ya uundaji wa programu na uendeshaji wa biashara: kujenga tovuti, programu na mifumo ya ndani, na kusaidia bajeti, uhasibu, ripoti na ukaguzi.',
    now: 'Ninasoma Sayansi ya Kompyuta katika University of the People. Niko tayari kwa ajira mpya na miradi binafsi.',
    getInTouch: 'Wasiliana nami',
    downloadCv: 'Pakua CV',
    work: 'Kazi',
    privateWork: 'Tovuti nyingine, mifumo ya biashara na programu za wateja ni za siri au binafsi, kwa hiyo hazijaorodheshwa hapa.',
    experience: 'Uzoefu',
    skills: 'Ujuzi',
    education: 'Elimu',
    certificates: 'Vyeti',
    contact: 'Mawasiliano',
    contactLine: 'Una nafasi ya kazi au mradi? Ningependa kusikia kutoka kwako.',
    email: 'Barua pepe',
    whatsapp: 'WhatsApp',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    cv: 'CV (PDF)',
    visit: 'Tembelea',
    localTime: 'Saa za Dar es Salaam',
    language: 'Lugha',
    skip: 'Ruka hadi maudhui',
    opensNewTab: 'inafunguka kwenye kichupo kipya',
  },
}

// Projects, in the order they appear. `layout` decides how the images sit:
// 'phones' (tall app screens), 'browser' (a website screenshot) or 'banner'.
export const projects = [
  {
    id: 'ligiplay',
    name: 'LigiPlay',
    type: { en: 'Android app', sw: 'Programu ya Android' },
    status: {
      en: 'On Google Play · Flutter, Dart, FastAPI, PostgreSQL · English and Kiswahili',
      sw: 'Iko Google Play · Flutter, Dart, FastAPI, PostgreSQL · Kiingereza na Kiswahili',
    },
    summary: {
      en: 'Leagues and cups for eFootball players. LigiPlay makes the fixtures, reads the final score from a screenshot, asks both players to confirm it, and keeps the table up to date. It is built to work well on slow networks.',
      sw: 'Ligi na makombe kwa wachezaji wa eFootball. LigiPlay inapanga ratiba, inasoma matokeo ya mwisho kutoka kwenye picha ya skrini, inawaomba wachezaji wote wawili kuyathibitisha, na inasasisha jedwali la msimamo. Imejengwa kufanya kazi vizuri hata kwenye mtandao wa polepole.',
    },
    url: '',
    layout: 'phones',
    images: [
      { src: 'work/ligiplay-1.webp', w: 540, h: 960, alt: { en: 'LigiPlay home screen with tonight’s match and the matchday list', sw: 'Skrini kuu ya LigiPlay yenye mechi ya leo usiku na ratiba ya siku' } },
      { src: 'work/ligiplay-2.webp', w: 540, h: 960, alt: { en: 'LigiPlay screen for discovering open leagues', sw: 'Skrini ya LigiPlay ya kutafuta ligi zilizo wazi' } },
      { src: 'work/ligiplay-3.webp', w: 540, h: 960, alt: { en: 'LigiPlay league table', sw: 'Jedwali la msimamo wa ligi kwenye LigiPlay' } },
      { src: 'work/ligiplay-4.webp', w: 540, h: 960, alt: { en: 'LigiPlay statistics screen', sw: 'Skrini ya takwimu kwenye LigiPlay' } },
    ],
  },
  {
    id: 'exxonim-consult',
    name: 'Exxonim Consult',
    type: { en: 'Website', sw: 'Tovuti' },
    status: { en: 'Live', sw: 'Iko hewani' },
    summary: {
      en: 'Website for Exxonim Consult, which handles company registration, TIN, licences, work permits, NGO registration and annual returns in Tanzania.',
      sw: 'Tovuti ya Exxonim Consult, inayoshughulikia usajili wa kampuni, TIN, leseni, vibali vya kazi, usajili wa NGO na taarifa za mwaka nchini Tanzania.',
    },
    url: 'https://consult.exxonim.tz',
    layout: 'browser',
    images: [
      { src: 'work/exxonim-consult.webp', w: 1200, h: 750, alt: { en: 'Exxonim Consult home page', sw: 'Ukurasa wa mwanzo wa Exxonim Consult' } },
    ],
  },
  {
    id: 'levo',
    name: 'LEVO',
    type: { en: 'Website', sw: 'Tovuti' },
    status: { en: 'Live', sw: 'Iko hewani' },
    summary: {
      en: 'Website for Legal Vision Organization (LEVO), a Tanzanian organization working on legal aid, legal education and advocacy.',
      sw: 'Tovuti ya Legal Vision Organization (LEVO), shirika la Kitanzania linalofanya kazi ya msaada wa kisheria, elimu ya sheria na utetezi.',
    },
    url: 'https://levo.or.tz',
    layout: 'browser',
    images: [
      { src: 'work/levo.webp', w: 1200, h: 750, alt: { en: 'LEVO home page', sw: 'Ukurasa wa mwanzo wa LEVO' } },
    ],
  },
  {
    id: 'mangiplus',
    name: 'MangiPlus',
    type: { en: 'Android app', sw: 'Programu ya Android' },
    status: { en: 'On Google Play', sw: 'Iko Google Play' },
    summary: {
      en: 'An Android app for small and medium-sized businesses (SMEs).',
      sw: 'Programu ya Android kwa biashara ndogo na za kati.',
    },
    url: '',
    layout: 'banner',
    images: [
      { src: 'work/mangiplus.webp', w: 1024, h: 500, alt: { en: 'MangiPlus logo', sw: 'Nembo ya MangiPlus' } },
    ],
  },
]

export const experience = [
  {
    org: 'Exxonim Company Limited',
    role: { en: 'Software development and business operations', sw: 'Uundaji wa programu na uendeshaji wa biashara' },
    summary: {
      en: 'Websites, web and Android apps and internal business systems, plus budgets, expenditure tracking, accounting records, reporting and audit support.',
      sw: 'Tovuti, programu za wavuti na Android na mifumo ya ndani ya biashara, pamoja na bajeti, ufuatiliaji wa matumizi, kumbukumbu za uhasibu, ripoti na ukaguzi.',
    },
    period: { en: 'Since Jan 2025', sw: 'Tangu Jan 2025' },
  },
  {
    org: 'Tanzania Commercial Bank',
    role: { en: 'Banking intern', sw: 'Mafunzo kwa vitendo, benki' },
    summary: {
      en: 'Customer service, front office and teller support, daily transactions, book balancing and banking documentation.',
      sw: 'Huduma kwa wateja, dawati la mbele na kaunta, miamala ya kila siku, kusawazisha vitabu na nyaraka za kibenki.',
    },
    period: { en: 'Jul to Sep 2024', sw: 'Jul hadi Sep 2024' },
  },
]

export const skills = [
  {
    name: { en: 'Banking and financial services', sw: 'Benki na huduma za fedha' },
    items: {
      en: 'Customer service, front office and teller support, transaction processing, banking documentation, compliance procedures',
      sw: 'Huduma kwa wateja, dawati la mbele na kaunta, uchakataji wa miamala, nyaraka za kibenki, taratibu za uzingatiaji',
    },
  },
  {
    name: { en: 'Finance and business operations', sw: 'Fedha na uendeshaji wa biashara' },
    items: {
      en: 'Budgets and expenditure tracking, accounting operations, financial records and reporting, internal audit support, process improvement',
      sw: 'Bajeti na ufuatiliaji wa matumizi, shughuli za uhasibu, kumbukumbu na ripoti za fedha, msaada wa ukaguzi wa ndani, uboreshaji wa michakato',
    },
  },
  {
    name: { en: 'Digital business solutions', sw: 'Suluhisho za kidijitali kwa biashara' },
    items: {
      en: 'Websites and web apps, Android apps, business and administration systems, APIs, testing',
      sw: 'Tovuti na programu za wavuti, programu za Android, mifumo ya biashara na utawala, API, majaribio',
    },
  },
  {
    name: { en: 'Data and reporting', sw: 'Takwimu na ripoti' },
    items: {
      en: 'Excel (PivotTables, Power Query), Power BI, Oracle Analytics, SQL, Python (pandas, NumPy, Matplotlib)',
      sw: 'Excel (PivotTables, Power Query), Power BI, Oracle Analytics, SQL, Python (pandas, NumPy, Matplotlib)',
    },
  },
  {
    name: { en: 'Programming', sw: 'Lugha za programu' },
    items: {
      en: 'Python, JavaScript, TypeScript, SQL, Dart, Flutter, React, HTML, CSS',
      sw: 'Python, JavaScript, TypeScript, SQL, Dart, Flutter, React, HTML, CSS',
    },
  },
  {
    name: { en: 'Backend and tools', sw: 'Backend na zana' },
    items: {
      en: 'FastAPI, REST APIs, PostgreSQL, MySQL, Git, GitHub, Docker Compose, Linux',
      sw: 'FastAPI, REST APIs, PostgreSQL, MySQL, Git, GitHub, Docker Compose, Linux',
    },
  },
  {
    name: { en: 'Languages', sw: 'Lugha' },
    items: { en: 'Kiswahili, English, Arabic', sw: 'Kiswahili, Kiingereza, Kiarabu' },
  },
]

export const education = [
  {
    org: 'University of Dar es Salaam',
    detail: { en: 'Bachelor of Commerce in Banking and Financial Services', sw: 'Shahada ya Biashara katika Benki na Huduma za Fedha' },
    period: { en: '2022 to 2025', sw: '2022 hadi 2025' },
  },
  {
    org: 'University of the People',
    detail: { en: 'BSc Computer Science, in progress (online)', sw: 'Shahada ya Sayansi ya Kompyuta, inaendelea (mtandaoni)' },
    period: { en: '2025 to 2027', sw: '2025 hadi 2027' },
  },
]

export const certificates = [
  { name: { en: 'CS50’s Introduction to Programming with Python (CS50P)', sw: 'CS50’s Introduction to Programming with Python (CS50P)' }, issuer: { en: 'HarvardX', sw: 'HarvardX' } },
  { name: { en: 'Software Architecture', sw: 'Software Architecture' }, issuer: { en: 'Udemy', sw: 'Udemy' } },
  { name: { en: 'NDG Hackathon 2025, Copenhagen', sw: 'NDG Hackathon 2025, Copenhagen' }, issuer: { en: 'Certificate', sw: 'Cheti' } },
]
