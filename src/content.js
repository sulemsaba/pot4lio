// Everything the site says lives in this file, in English (en) and Kiswahili (sw).
// Edit text and links here; the components never need to change.
// A link left empty ('') is hidden on the site.

export const profile = {
  name: 'Suleiman Msaba',
  city: 'Dar es Salaam',
  timeZone: 'Africa/Dar_es_Salaam',
  links: {
    email: '', // e.g. 'name@example.com'
    whatsapp: '', // international format, digits only, e.g. '2557XXXXXXXX'
    github: 'https://github.com/sulemsaba',
    linkedin: '', // e.g. 'https://www.linkedin.com/in/your-handle'
    cv: '', // put the PDF in /public and write its file name, e.g. 'suleiman-msaba-cv.pdf'
  },
}

export const copy = {
  en: {
    role: 'Developer',
    statement: 'I build websites, Android apps and business systems in Dar es Salaam.',
    intro:
      'I came to software from banking and finance, so I like work where the details have to be right: the numbers, the paperwork, the process. I also help with data analysis and reporting.',
    now: 'Currently at Exxonim. Open to new roles and freelance projects.',
    getInTouch: 'Get in touch',
    work: 'Work',
    experience: 'Experience',
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
    role: 'Msanidi programu',
    statement: 'Ninatengeneza tovuti, programu za Android na mifumo ya biashara, jijini Dar es Salaam.',
    intro:
      'Nilianzia kwenye benki na fedha, kwa hiyo napenda kazi ambayo kila undani lazima uwe sahihi: hesabu, nyaraka na utaratibu. Pia nasaidia katika uchambuzi wa takwimu na utayarishaji wa ripoti.',
    now: 'Kwa sasa niko Exxonim. Niko tayari kwa ajira mpya na miradi binafsi.',
    getInTouch: 'Wasiliana nami',
    work: 'Kazi',
    experience: 'Uzoefu',
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
    status: { en: 'In testing · English and Kiswahili', sw: 'Kwenye majaribio · Kiingereza na Kiswahili' },
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
    status: { en: '', sw: '' },
    summary: {
      en: 'Android app. A full write-up is coming soon.',
      sw: 'Programu ya Android. Maelezo kamili yanakuja hivi karibuni.',
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
    role: { en: '', sw: '' },
    period: { en: 'Since Jan 2025', sw: 'Tangu Jan 2025' },
  },
  {
    org: 'Tanzania Commercial Bank',
    role: { en: 'Banking intern', sw: 'Mafunzo kwa vitendo, benki' },
    period: { en: 'Jul to Sep 2024', sw: 'Jul hadi Sep 2024' },
  },
]
