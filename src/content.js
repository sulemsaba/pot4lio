// Everything the site says lives in this file, in English (en) and Kiswahili (sw).
// Edit text and links here; the components never need to change.
// A link left empty ('') is hidden on the site.

export const profile = {
  name: 'Suleiman Msaba',
  city: 'Dar es Salaam',
  timeZone: 'Africa/Dar_es_Salaam',
  photo: 'suleiman.webp', // square photo in /public
  links: {
    email: 'suleimanmsaba1@gmail.com',
    whatsapp: '255768944291', // international format, digits only
    github: 'https://github.com/sulemsaba',
    linkedin: '', // e.g. 'https://www.linkedin.com/in/your-handle'
    cv: 'suleiman-msaba-cv.pdf', // file in /public
    cvPreview: 'cv-preview.webp', // picture of the first page, in /public
  },
}

// In any text below, **words like this** are shown a shade stronger.
export const copy = {
  en: {
    nav: { home: 'Home', about: 'About', work: 'Work', writing: 'Writing', cv: 'CV', contact: 'Contact' },
    navLabel: 'Pages',
    language: 'Language',
    themeToDark: 'Switch to the dark theme',
    themeToLight: 'Switch to the light theme',
    skip: 'Skip to content',
    opensNewTab: 'opens in a new tab',
    photoAlt: 'Suleiman Msaba smiling, with palm trees and a blue sky behind him',

    // Home
    headBuilds: 'I build',
    builds: ['websites', 'Android apps', 'business systems'],
    buildsAll: 'websites, Android apps and business systems',
    headWin: 'that help your business win.',
    sticker: 'Hi, I’m Suleiman',
    lede: '**Code and finance, in one person.** From idea to launch.',
    heroCta: 'Tell me what you need',
    heroWork: 'See the work',
    heroCv: 'Hiring? Read my CV',
    workTitle: '**Built to help your business win.** Here is what each project does for the people who use it.',
    needsTitle: '**What does your business need?** Pick one.',
    needsLabel: 'What your business needs',
    needsOr: 'or email me',
    needs: [
      {
        id: 'website',
        label: 'A website',
        pitch: '**Get found online,** and make the next step obvious.',
        points: ['Your services up front, with one clear first step.', 'Call or WhatsApp in one tap.', 'In English, Kiswahili or both.'],
        proof: 'Like Exxonim Consult, LEVO, JOTOFA Group and Drax Raw.',
        proofLink: '#/work/exxonim-consult',
        cta: 'Ask me about a website',
        message: 'Hi Suleiman, I need a website for my business.',
      },
      {
        id: 'app',
        label: 'An Android app',
        pitch: '**Put your service in your customers’ pockets.**',
        points: ['Built with Flutter and published on Google Play.', 'Made to work well on slow networks.', 'In English and Kiswahili.'],
        proof: 'Like LigiPlay and MangiPlus.',
        proofLink: '#/work/ligiplay',
        cta: 'Ask me about an app',
        message: 'Hi Suleiman, I need an Android app.',
      },
      {
        id: 'system',
        label: 'A business system',
        pitch: '**Records, reports and workflows,** in one place.',
        points: ['A proper database, with the APIs behind it.', 'Clear reports for decisions.', 'Built by someone who also does budgets and accounting.'],
        proof: 'Like the internal systems I build at Exxonim Company Limited.',
        proofLink: '#/about',
        cta: 'Ask me about a system',
        message: 'Hi Suleiman, I need a system for my business.',
      },
      {
        id: 'numbers',
        label: 'Help with the numbers',
        pitch: '**Budgets, records and reports,** in order.',
        points: ['Budgets and expenditure tracking.', 'Accounting records and reporting.', 'Internal audit support.'],
        proof: 'From a banking and finance graduate who does this at Exxonim.',
        proofLink: '#/about',
        cta: 'Ask me about your numbers',
        message: 'Hi Suleiman, I need help with budgets and reporting.',
      },
    ],
    winsTitle: 'What it does for you',
    likeThis: 'Want one like this?',
    demoTitle: 'Try it: confirm a result',
    demoBadge: 'Demo',
    demoRead: 'sent a screenshot. LigiPlay read the score:',
    demoAsk: 'is that right?',
    demoConfirm: 'Yes, confirm',
    demoDone: 'Confirmed by both players. The table updated itself.',
    demoNext: 'Next match',
    demoAgain: 'Start again',
    demoPlayer: 'Player',
    demoPlayed: 'Played',
    demoPoints: 'Points',
    ctaTitle: '**Have a role or a project in mind?** Send me a message.',
    orEmail: 'Or email me at',

    // Footer: the sign-off, with its middle word changing, and the grass.
    sayStart: 'Let’s',
    sayWords: ['design', 'shape', 'elevate'],
    sayAll: 'design, shape and elevate',
    sayEnd: 'incredible work together.',
    sayButton: 'Say hello',
    grassHint: 'Go on, touch the grass.',
    grassLabel: 'Grass. Brush across it, tap it, or press the left and right arrow keys.',
    periods: { dawn: 'Early morning', morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Night' },
    swahiliTime: 'Swahili time',
    skyTitle: 'Now in Dar es Salaam',
    wordTitle: 'A word of Kiswahili',
    wordFlip: 'Tap to see what it means',
    wordNext: 'Tap for another word',
    wordMeaning: 'Meaning',
    cvTitle: 'My CV',
    cvMeta: 'One page, in English',
    readCv: 'Read my CV',
    githubLine: 'My code, including this website.',
    githubButton: 'View GitHub',

    // About
    aboutPageTitle: '**Suleiman**, in short.',
    story: [
      {
        label: 'What I studied',
        text: '**Banking and Financial Services** at the **University of Dar es Salaam**, from 2022 to 2025. Along the way I interned at **Tanzania Commercial Bank**, at the front office and the teller desk.',
      },
      {
        label: 'What I do now',
        text: 'At **Exxonim Company Limited** I build **websites, Android apps and internal systems**. I also work on the business side: budgets, accounting records, reporting and audit support.',
      },
      {
        label: 'What I’m learning',
        text: '**Computer Science** at **University of the People**, online, until 2027.',
      },
      {
        label: 'What I’m looking for',
        text: 'A new role or a freelance project in **software, finance or business operations**.',
      },
      {
        label: 'Outside work',
        text: 'I love **charity and helping people**.',
      },
    ],
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    tools: 'Tools I use',
    certificates: 'Certificates',

    // Work
    privateWork: 'Other websites, business systems and client applications are private or confidential, so they are not listed here.',
    visit: 'Visit',

    // Writing
    writingTitle: '**Writing.** Essays on how we think, learn and live, and where it is all going.',
    writingNote: '',
    writingAll: 'All writing',
    writingNext: 'Next essay',
    writingBy: 'By',
    writingMinutes: '{n} min read',
    writingTopics: { career: 'Career', business: 'Business', philosophy: 'Philosophy', education: 'Education', future: 'The future', technology: 'Technology', life: 'Life' },
    writingPhoto: 'Photo',
    writingPhotos: 'Photos from Wikimedia Commons. Each essay credits its photo and its licence.',
    writingSearch: 'Search essays',
    writingClear: 'Clear search',
    writingTopicsLabel: 'Topics',
    writingAllTopics: 'All',
    writingOne: '1 essay',
    writingMany: '{n} essays',
    writingNone: 'Nothing matches “{q}”.',
    writingShowAll: 'Show all essays',
    writingContents: 'In this essay',
    writingIntro: 'Introduction',
    writingPainting: 'Painting',

    // CV
    cvPageTitle: '**My CV**, to read here or download.',
    downloadPdf: 'Download PDF',
    print: 'Print',
    cvLanguageNote: '',

    // Contact
    contactTitle: '**Say hello**, in English or Kiswahili.',
    chatChannel: 'on WhatsApp',
    chatGreeting: 'Have a role or a project in mind? Write to me here and the message opens in WhatsApp.',
    chatLabel: 'Your message',
    chatPlaceholder: 'Write a message',
    chatSend: 'Send on WhatsApp',
    chatSent: 'Opened in WhatsApp',
    composeTitle: 'Email',
    composeTo: 'To',
    composeSubject: 'Subject',
    composeSubjectPlaceholder: 'What is it about?',
    composeMessage: 'Message',
    composeMessagePlaceholder: 'Write your message',
    composeSend: 'Open in my email app',
    phoneLabel: 'Phone',
    copy: 'Copy',
    copied: 'Copied',
    github: 'GitHub',
    linkedin: 'LinkedIn',
  },
  sw: {
    nav: { home: 'Mwanzo', about: 'Kunihusu', work: 'Kazi', writing: 'Makala', cv: 'CV', contact: 'Wasiliana' },
    navLabel: 'Kurasa',
    language: 'Lugha',
    themeToDark: 'Badili kwenda mandhari meusi',
    themeToLight: 'Badili kwenda mandhari meupe',
    skip: 'Ruka hadi maudhui',
    opensNewTab: 'inafunguka kwenye kichupo kipya',
    photoAlt: 'Suleiman Msaba akitabasamu, nyuma yake mitende na anga la buluu',

    // Home
    headBuilds: 'Ninatengeneza',
    builds: ['tovuti', 'programu za Android', 'mifumo ya biashara'],
    buildsAll: 'tovuti, programu za Android na mifumo ya biashara',
    headWin: 'ili biashara yako ishinde.',
    sticker: 'Habari, mimi ni Suleiman',
    lede: '**Teknolojia na fedha, kwa mtu mmoja.** Kuanzia wazo hadi uzinduzi.',
    heroCta: 'Niambie unachohitaji',
    heroWork: 'Tazama kazi',
    heroCv: 'Unaajiri? Soma CV yangu',
    workTitle: '**Imejengwa kusaidia biashara yako kushinda.** Hiki ndicho kila mradi unawafanyia wanaoutumia.',
    needsTitle: '**Biashara yako inahitaji nini?** Chagua kimoja.',
    needsLabel: 'Biashara yako inahitaji nini',
    needsOr: 'au niandikie barua pepe',
    needs: [
      {
        id: 'website',
        label: 'Tovuti',
        pitch: '**Patikana mtandaoni,** na fanya hatua inayofuata iwe wazi.',
        points: ['Huduma zako mbele, na hatua moja ya kwanza iliyo wazi.', 'Piga simu au WhatsApp kwa kubofya mara moja.', 'Kwa Kiingereza, Kiswahili au zote mbili.'],
        proof: 'Kama Exxonim Consult, LEVO, JOTOFA Group na Drax Raw.',
        proofLink: '#/work/exxonim-consult',
        cta: 'Niulize kuhusu tovuti',
        message: 'Habari Suleiman, ninahitaji tovuti kwa ajili ya biashara yangu.',
      },
      {
        id: 'app',
        label: 'Programu ya Android',
        pitch: '**Weka huduma yako mfukoni mwa wateja wako.**',
        points: ['Imejengwa kwa Flutter na kuwekwa Google Play.', 'Imetengenezwa kufanya kazi vizuri hata kwenye mtandao wa polepole.', 'Kwa Kiingereza na Kiswahili.'],
        proof: 'Kama LigiPlay na MangiPlus.',
        proofLink: '#/work/ligiplay',
        cta: 'Niulize kuhusu programu',
        message: 'Habari Suleiman, ninahitaji programu ya Android.',
      },
      {
        id: 'system',
        label: 'Mfumo wa biashara',
        pitch: '**Kumbukumbu, ripoti na michakato,** mahali pamoja.',
        points: ['Hifadhidata imara, pamoja na API zake.', 'Ripoti zilizo wazi kwa maamuzi.', 'Umejengwa na mtu anayeshughulikia pia bajeti na uhasibu.'],
        proof: 'Kama mifumo ya ndani ninayoijenga katika Exxonim Company Limited.',
        proofLink: '#/about',
        cta: 'Niulize kuhusu mfumo',
        message: 'Habari Suleiman, ninahitaji mfumo kwa ajili ya biashara yangu.',
      },
      {
        id: 'numbers',
        label: 'Msaada wa hesabu',
        pitch: '**Bajeti, kumbukumbu na ripoti,** kwa mpangilio.',
        points: ['Bajeti na ufuatiliaji wa matumizi.', 'Kumbukumbu za uhasibu na ripoti.', 'Msaada wa ukaguzi wa ndani.'],
        proof: 'Kutoka kwa mhitimu wa benki na fedha anayefanya kazi hii Exxonim.',
        proofLink: '#/about',
        cta: 'Niulize kuhusu hesabu zako',
        message: 'Habari Suleiman, ninahitaji msaada wa bajeti na ripoti.',
      },
    ],
    winsTitle: 'Inakufanyia nini',
    likeThis: 'Unataka kama hii?',
    demoTitle: 'Jaribu: thibitisha matokeo',
    demoBadge: 'Mfano',
    demoRead: 'ametuma picha ya skrini. LigiPlay imesoma matokeo:',
    demoAsk: 'ni sahihi?',
    demoConfirm: 'Ndiyo, thibitisha',
    demoDone: 'Wachezaji wote wawili wamethibitisha. Jedwali limejisasisha lenyewe.',
    demoNext: 'Mechi inayofuata',
    demoAgain: 'Anza upya',
    demoPlayer: 'Mchezaji',
    demoPlayed: 'Mechi',
    demoPoints: 'Pointi',
    ctaTitle: '**Una nafasi ya kazi au mradi?** Niandikie ujumbe.',
    orEmail: 'Au niandikie barua pepe',

    sayStart: 'Hebu',
    sayWords: ['tubuni', 'tuunde', 'tujenge'],
    sayAll: 'tubuni, tuunde na tujenge',
    sayEnd: 'kazi ya kipekee pamoja.',
    sayButton: 'Niandikie',
    grassHint: 'Haya, gusa nyasi.',
    grassLabel: 'Nyasi. Zipitie kwa kidole au kipanya, zigonge, au bonyeza vitufe vya mshale wa kushoto na kulia.',
    periods: { dawn: 'Alfajiri', morning: 'Asubuhi', afternoon: 'Mchana', evening: 'Jioni', night: 'Usiku' },
    swahiliTime: 'Saa za Kiswahili',
    skyTitle: 'Sasa hivi Dar es Salaam',
    wordTitle: 'Neno la Kiswahili',
    wordFlip: 'Gusa kuona maana kwa Kiingereza',
    wordNext: 'Gusa kupata neno jingine',
    wordMeaning: 'Kwa Kiingereza',

    cvTitle: 'CV yangu',
    cvMeta: 'Ukurasa mmoja, kwa Kiingereza',
    readCv: 'Soma CV yangu',
    githubLine: 'Msimbo wangu, pamoja na tovuti hii.',
    githubButton: 'Tazama GitHub',

    // About
    aboutPageTitle: '**Suleiman**, kwa ufupi.',
    story: [
      {
        label: 'Nilichosoma',
        text: '**Benki na Huduma za Fedha** katika **Chuo Kikuu cha Dar es Salaam**, kuanzia 2022 hadi 2025. Katikati ya masomo nilifanya mafunzo kwa vitendo katika **Tanzania Commercial Bank**, kwenye dawati la mbele na kaunta.',
      },
      {
        label: 'Ninachofanya sasa',
        text: 'Katika **Exxonim Company Limited** ninatengeneza **tovuti, programu za Android na mifumo ya ndani**. Pia ninafanya kazi upande wa biashara: bajeti, kumbukumbu za uhasibu, ripoti na msaada wa ukaguzi.',
      },
      {
        label: 'Ninachojifunza',
        text: '**Sayansi ya Kompyuta** katika **University of the People**, mtandaoni, hadi 2027.',
      },
      {
        label: 'Ninachotafuta',
        text: 'Ajira mpya au mradi binafsi katika **teknolojia, fedha au uendeshaji wa biashara**.',
      },
      {
        label: 'Nje ya kazi',
        text: 'Ninapenda **kazi za hisani na kusaidia watu**.',
      },
    ],
    experience: 'Uzoefu',
    education: 'Elimu',
    skills: 'Ujuzi',
    tools: 'Zana ninazotumia',
    certificates: 'Vyeti',

    // Work
    privateWork: 'Tovuti nyingine, mifumo ya biashara na programu za wateja ni za siri au binafsi, kwa hiyo hazijaorodheshwa hapa.',
    visit: 'Tembelea',

    // Writing
    writingTitle: '**Makala.** Insha kuhusu jinsi tunavyofikiri, tunavyojifunza na tunavyoishi, na tunakoelekea.',
    writingNote: 'Insha hizi ziko kwa Kiingereza kwa sasa.',
    writingAll: 'Makala zote',
    writingNext: 'Insha inayofuata',
    writingBy: 'Na',
    writingMinutes: 'Dakika {n} za kusoma',
    writingTopics: { career: 'Kazi', business: 'Biashara', philosophy: 'Falsafa', education: 'Elimu', future: 'Wakati ujao', technology: 'Teknolojia', life: 'Maisha' },
    writingPhoto: 'Picha',
    writingPhotos: 'Picha kutoka Wikimedia Commons. Kila insha inataja mpiga picha na leseni yake.',
    writingSearch: 'Tafuta insha',
    writingClear: 'Futa utafutaji',
    writingTopicsLabel: 'Mada',
    writingAllTopics: 'Zote',
    writingOne: 'Insha 1',
    writingMany: 'Insha {n}',
    writingNone: 'Hakuna insha inayolingana na “{q}”.',
    writingShowAll: 'Onyesha insha zote',
    writingContents: 'Ndani ya insha hii',
    writingIntro: 'Utangulizi',
    writingPainting: 'Mchoro',

    // CV
    cvPageTitle: '**CV yangu**, isome hapa au uipakue.',
    downloadPdf: 'Pakua PDF',
    print: 'Chapisha',
    cvLanguageNote: 'CV hii imeandikwa kwa Kiingereza.',

    // Contact
    contactTitle: '**Nisalimie**, kwa Kiswahili au Kiingereza.',
    chatChannel: 'kwenye WhatsApp',
    chatGreeting: 'Una nafasi ya kazi au mradi? Niandikie hapa na ujumbe utafunguka kwenye WhatsApp.',
    chatLabel: 'Ujumbe wako',
    chatPlaceholder: 'Andika ujumbe',
    chatSend: 'Tuma kwa WhatsApp',
    chatSent: 'Umefunguliwa kwenye WhatsApp',
    composeTitle: 'Barua pepe',
    composeTo: 'Kwa',
    composeSubject: 'Kichwa',
    composeSubjectPlaceholder: 'Ni kuhusu nini?',
    composeMessage: 'Ujumbe',
    composeMessagePlaceholder: 'Andika ujumbe wako',
    composeSend: 'Fungua kwenye programu ya barua pepe',
    phoneLabel: 'Simu',
    copy: 'Nakili',
    copied: 'Imenakiliwa',
    github: 'GitHub',
    linkedin: 'LinkedIn',
  },
}

// The "word of Kiswahili" card on Home: tap to flip, tap again for the next word.
export const swahiliWords = [
  { word: 'Karibu', say: 'kah-REE-boo', meaning: 'Welcome', short: 'Welcome' },
  { word: 'Habari?', say: 'hah-BAH-ree', meaning: 'Hello, how are you? (literally: any news?)', short: 'Hello, how are you?' },
  { word: 'Asante', say: 'ah-SAHN-teh', meaning: 'Thank you', short: 'Thank you' },
  { word: 'Kazi', say: 'KAH-zee', meaning: 'Work, a job', short: 'Work' },
  { word: 'Pole pole', say: 'POH-leh POH-leh', meaning: 'Slowly, slowly. Take it easy.', short: 'Slowly' },
  { word: 'Rafiki', say: 'rah-FEE-kee', meaning: 'Friend', short: 'Friend' },
  { word: 'Hakuna matata', say: 'hah-KOO-nah mah-TAH-tah', meaning: 'No worries', short: 'No worries' },
]

// Projects, in the order they appear. `layout` decides how the images sit:
// 'phones' (tall app screens), 'browser' (a website screenshot) or 'banner'.
// `tint` is the colour behind the images ('' uses the soft card grey).
// `pitch` and `wins` say what the project does for the people who use it: advantages
// only, never invented numbers. `ask` is the WhatsApp message behind "Want one like this?".
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
    tint: '#123d31',
    pitch: {
      en: 'Run a whole league from your phone, and end the “who really won?” arguments.',
      sw: 'Endesha ligi nzima kwa simu yako, na umalize mabishano ya “nani alishinda kweli?”.',
    },
    wins: {
      en: ['Fixtures are made for you.', 'Scores are read from a screenshot. No typing.', 'Both players confirm every result.', 'The table updates itself.', 'Works well on slow networks.', 'In English and Kiswahili.'],
      sw: ['Ratiba inapangwa kwa ajili yako.', 'Matokeo yanasomwa kutoka kwenye picha ya skrini. Bila kuandika.', 'Wachezaji wote wawili wanathibitisha kila matokeo.', 'Jedwali linajisasisha lenyewe.', 'Inafanya kazi vizuri hata kwenye mtandao wa polepole.', 'Kwa Kiingereza na Kiswahili.'],
    },
    demo: true, // shows the small "confirm a result" demo
    ask: {
      en: 'Hi Suleiman, I saw LigiPlay. I would like an app like this.',
      sw: 'Habari Suleiman, nimeona LigiPlay. Ningependa programu kama hii.',
    },
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
    tint: '',
    pitch: {
      en: 'From “I want to start a business” to “Start My Registration”, in one visit.',
      sw: 'Kutoka “nataka kuanzisha biashara” hadi “Start My Registration”, kwa ziara moja.',
    },
    wins: {
      en: ['Every service on one site: company registration, TIN, licences, work permits, NGO registration and annual returns.', 'One clear first step: Start My Registration.', 'Clients can track their consultation.', 'Call or WhatsApp in one tap.'],
      sw: ['Huduma zote kwenye tovuti moja: usajili wa kampuni, TIN, leseni, vibali vya kazi, usajili wa NGO na taarifa za mwaka.', 'Hatua moja ya kwanza iliyo wazi: Start My Registration.', 'Wateja wanaweza kufuatilia ushauri wao.', 'Piga simu au WhatsApp kwa kubofya mara moja.'],
    },
    ask: {
      en: 'Hi Suleiman, I saw the Exxonim Consult website. I would like a website like this.',
      sw: 'Habari Suleiman, nimeona tovuti ya Exxonim Consult. Ningependa tovuti kama hii.',
    },
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
    tint: '#123b62',
    pitch: {
      en: 'Help people find legal aid, and help supporters give.',
      sw: 'Wasaidie watu kupata msaada wa kisheria, na wafadhili kuchangia.',
    },
    wins: {
      en: ['“Need legal support?” is right on the front page.', 'A Donate button for supporters.', 'Its work at a glance: legal aid, environment, water access and education.', 'A language switch, and WhatsApp in one tap.'],
      sw: ['“Need legal support?” iko kwenye ukurasa wa mbele.', 'Kitufe cha Donate kwa wafadhili.', 'Kazi yake kwa haraka: msaada wa kisheria, mazingira, maji na elimu.', 'Kubadili lugha, na WhatsApp kwa kubofya mara moja.'],
    },
    ask: {
      en: 'Hi Suleiman, I saw the LEVO website. I would like a website for my organisation.',
      sw: 'Habari Suleiman, nimeona tovuti ya LEVO. Ningependa tovuti kwa ajili ya shirika langu.',
    },
    images: [
      { src: 'work/levo.webp', w: 1200, h: 750, alt: { en: 'LEVO home page', sw: 'Ukurasa wa mwanzo wa LEVO' } },
    ],
  },
  {
    id: 'jotofa',
    name: 'JOTOFA Group',
    type: { en: 'Website proposal', sw: 'Pendekezo la tovuti' },
    status: { en: 'Proposal', sw: 'Pendekezo' },
    summary: {
      en: 'A website I proposed to JOTOFA Group, a Tanzanian holding company with three businesses: ICT and telecommunications, professional cleaning, and staffing.',
      sw: 'Tovuti niliyoipendekeza kwa JOTOFA Group, kampuni mama ya Kitanzania yenye biashara tatu: TEHAMA na mawasiliano, usafi wa kitaalamu, na huduma za wafanyakazi.',
    },
    url: 'https://frontendjotofa.vercel.app',
    linkLabel: { en: 'See the proposal', sw: 'Tazama pendekezo' }, // instead of "Visit ..."; this is not JOTOFA's own site
    layout: 'browser',
    tint: '#073b60',
    pitch: {
      en: 'Three businesses, one clear front door.',
      sw: 'Biashara tatu, mlango mmoja ulio wazi.',
    },
    wins: {
      en: ['Each business shows its own services: ICT and telecoms, cleaning, and staffing.', 'News, careers and contact, a click away.', 'Call or WhatsApp in one tap.', 'Light and dark mode.'],
      sw: ['Kila biashara inaonyesha huduma zake: TEHAMA na mawasiliano, usafi, na wafanyakazi.', 'Habari, nafasi za kazi na mawasiliano, kwa kubofya mara moja.', 'Piga simu au WhatsApp kwa kubofya mara moja.', 'Mandhari meupe na meusi.'],
    },
    ask: {
      en: 'Hi Suleiman, I saw your JOTOFA Group proposal. I would like a website for my company.',
      sw: 'Habari Suleiman, nimeona pendekezo lako la JOTOFA Group. Ningependa tovuti kwa ajili ya kampuni yangu.',
    },
    images: [
      { src: 'work/jotofa.webp', w: 1200, h: 750, alt: { en: 'Home page of the JOTOFA Group website proposal', sw: 'Ukurasa wa mwanzo wa pendekezo la tovuti ya JOTOFA Group' } },
    ],
  },
  {
    id: 'drax-raw',
    name: 'Drax Raw',
    type: { en: 'Portfolio website', sw: 'Tovuti ya kazi' },
    status: { en: 'Live', sw: 'Iko hewani' },
    summary: {
      en: 'Portfolio website for Drax Raw, a filmmaker, video editor and photographer in Dar es Salaam.',
      sw: 'Tovuti ya kuonyesha kazi za Drax Raw, mtengeneza filamu, mhariri wa video na mpiga picha jijini Dar es Salaam.',
    },
    url: 'https://sulemsaba.github.io/draxraw/',
    layout: 'browser',
    tint: '#cb2f29',
    pitch: {
      en: 'A filmmaker’s work up front, and bookings straight to WhatsApp.',
      sw: 'Kazi za mtengeneza filamu mbele kabisa, na maombi ya kazi moja kwa moja WhatsApp.',
    },
    wins: {
      en: ['Films play right on the page.', 'Photos and phone wallpapers in their own galleries.', 'Book on WhatsApp from anywhere on the site.', 'A bold look, as loud as the films.'],
      sw: ['Filamu zinachezwa papo hapo kwenye ukurasa.', 'Picha na wallpapers za simu kwenye maonyesho yake.', 'Weka miadi kwa WhatsApp kutoka popote kwenye tovuti.', 'Muonekano wenye nguvu, kama filamu zenyewe.'],
    },
    ask: {
      en: 'Hi Suleiman, I saw the Drax Raw website. I would like a portfolio website.',
      sw: 'Habari Suleiman, nimeona tovuti ya Drax Raw. Ningependa tovuti ya kuonyesha kazi zangu.',
    },
    images: [
      { src: 'work/draxraw.webp', w: 1200, h: 750, alt: { en: 'Drax Raw home page', sw: 'Ukurasa wa mwanzo wa Drax Raw' } },
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
    tint: '#f46906',
    pitch: {
      en: 'Made for small and medium-sized businesses, in an Android app.',
      sw: 'Imetengenezwa kwa biashara ndogo na za kati, kama programu ya Android.',
    },
    wins: { en: [], sw: [] }, // add what MangiPlus does for a business, one short line each
    ask: {
      en: 'Hi Suleiman, I saw MangiPlus. I would like an app for my business.',
      sw: 'Habari Suleiman, nimeona MangiPlus. Ningependa programu kwa ajili ya biashara yangu.',
    },
    images: [
      { src: 'work/mangiplus.webp', w: 1024, h: 500, alt: { en: 'MangiPlus logo', sw: 'Nembo ya MangiPlus' } },
    ],
  },
]

export const experience = [
  {
    org: 'Exxonim Company Limited',
    role: { en: 'Software development and business operations', sw: 'Uundaji wa programu na uendeshaji wa biashara' },
    period: { en: 'Since Jan 2025', sw: 'Tangu Jan 2025' },
  },
  {
    org: 'Tanzania Commercial Bank',
    role: { en: 'Banking intern', sw: 'Mafunzo kwa vitendo, benki' },
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
