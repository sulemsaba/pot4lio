// What each content file holds, field by field: the admin page builds its forms from this.
// A new field on the site needs a line here to become editable (the data itself is free).
//
// Field types: text, textarea, url, email, slug, date, number, color, select, bool,
// list (lines of text), i18n (English and Kiswahili side by side), image, object, array,
// pair (two texts), blocks (an essay body), svg (an icon path).
// Options: label, help, placeholder, optional (may be left out), omitFalse (a bool that is
// removed when off), rows, of (the inner type of i18n and array), fields (of an object).

const t = (label, more = {}) => ({ type: 'text', label, ...more })
const area = (label, more = {}) => ({ type: 'textarea', label, rows: 3, ...more })
const both = (label, of = 'text', more = {}) => ({ type: 'i18n', label, of, ...more })

const RICH = 'Put **two stars** around words to show them a shade stronger.'

export const sections = [
  { id: 'overview', label: 'Overview', icon: 'home' },
  { id: 'profile', label: 'Profile and links', icon: 'user', key: 'profile', page: '' },
  { id: 'projects', label: 'Projects', icon: 'grid', key: 'projects', page: 'work' },
  { id: 'essays', label: 'Writing', icon: 'pen', key: 'essays', page: 'writing' },
  { id: 'about', label: 'About page', icon: 'list', keys: ['experience', 'skills', 'education', 'certificates', 'tools'], page: 'about' },
  { id: 'cv', label: 'CV', icon: 'file', key: 'cv', page: 'cv' },
  { id: 'words', label: 'Kiswahili words', icon: 'chat', key: 'words', page: '' },
  { id: 'copy', label: 'Site text', icon: 'type', key: 'copy', page: '' },
  { id: 'inbox', label: 'Inbox', icon: 'inbox', needs: 'server' },
  { id: 'history', label: 'History', icon: 'clock' },
  { id: 'settings', label: 'Settings', icon: 'gear' },
]

export const titles = {
  profile: 'Profile and links',
  copy: 'Site text',
  words: 'Kiswahili words',
  projects: 'Projects',
  experience: 'Experience',
  skills: 'Skills',
  education: 'Education',
  certificates: 'Certificates',
  cv: 'CV',
  essays: 'Writing',
  tools: 'Tools',
}

const imageI18n = (label, more = {}) => ({ type: 'image', label, alt: 'i18n', ...more })

export const schema = {
  profile: {
    type: 'object',
    fields: {
      name: t('Name'),
      city: t('City'),
      timeZone: t('Time zone', { help: 'For the clock on Home, as a time zone name: Africa/Dar_es_Salaam.' }),
      photo: { type: 'image', label: 'Photo', pathOnly: true, dir: '', max: 640, help: 'A square photo. It shows next to your name and on the About page.' },
      links: {
        type: 'object',
        label: 'Links',
        fields: {
          email: { type: 'email', label: 'Email' },
          whatsapp: t('WhatsApp number', { help: 'International format, digits only: 255768944291.' }),
          github: { type: 'url', label: 'GitHub' },
          linkedin: { type: 'url', label: 'LinkedIn', help: 'Leave empty to hide it on the site.' },
          cv: t('CV file', { help: 'The PDF in the site folder. The deploy rebuilds it from the CV section.' }),
          cvPreview: { type: 'image', label: 'CV picture', pathOnly: true, dir: '', max: 1200, help: 'A picture of the first page of the CV, for the CV card on Home.' },
        },
      },
    },
  },

  projects: {
    type: 'array',
    view: 'detail',
    itemLabel: (item) => item.name || 'New project',
    itemMeta: (item, lang = 'en') => [item.type?.[lang], item.status?.[lang]].filter(Boolean).join(' · '),
    itemThumb: (item) => item.images?.[0]?.src || '',
    itemId: (item) => item.id,
    newItem: () => ({
      id: 'new-project',
      name: '',
      type: { en: '', sw: '' },
      status: { en: '', sw: '' },
      summary: { en: '', sw: '' },
      url: '',
      layout: 'browser',
      tint: '',
      pitch: { en: '', sw: '' },
      wins: { en: [], sw: [] },
      ask: { en: '', sw: '' },
      images: [],
    }),
    of: {
      type: 'object',
      fields: {
        name: t('Name'),
        id: { type: 'slug', label: 'Address', help: 'Used in links to the project: #/work/levo. Lowercase letters, numbers and hyphens.' },
        type: both('Kind', 'text', { placeholder: 'Website' }),
        status: both('Status line', 'text', { help: 'Under the name: Live, On Google Play, the tools it uses.' }),
        summary: both('Summary', 'textarea'),
        pitch: both('Pitch', 'textarea', { rows: 2, help: 'One line on what it does for the people who use it.' }),
        wins: both('Wins', 'list', { help: 'One short line each. Advantages only, never invented numbers.' }),
        url: { type: 'url', label: 'Live link', help: 'Leave empty when there is none.' },
        linkLabel: both('Link text', 'text', { optional: true, help: 'Instead of "Visit ...", for a proposal or a demo.' }),
        ask: both('WhatsApp message', 'textarea', { rows: 2, help: 'Sent when someone taps "Want one like this?".' }),
        layout: {
          type: 'select',
          label: 'Layout',
          options: [
            ['phones', 'Phones: tall app screens side by side'],
            ['browser', 'Browser: a website screenshot in a window'],
            ['banner', 'Banner: one wide picture'],
          ],
        },
        tint: { type: 'color', label: 'Background colour', allowEmpty: true, help: 'Behind the images. Empty uses the soft card grey.' },
        demo: { type: 'bool', label: 'Show the "confirm a result" demo', omitFalse: true, showIf: (item) => item.id === 'ligiplay' || item.demo, help: 'The small demo of confirming a match result.' },
        phone: imageI18n('Phone screenshot', { optional: true, dir: 'work', max: 600, help: 'Shown in front of the browser shot. 600 by 1298 works best.' }),
        images: { type: 'array', label: 'Images', of: imageI18n('Image', { dir: 'work', max: 1600 }), compact: true, itemLabel: (item, i) => `Image ${i + 1}`, newItem: () => ({ src: '', w: 0, h: 0, alt: { en: '', sw: '' } }), help: 'Phones: app screens, 540 by 960. Browser: one 1200 by 750 screenshot. Banner: one wide picture.' },
      },
    },
  },

  essays: {
    type: 'array',
    view: 'detail',
    itemLabel: (item) => item.title || 'New essay',
    itemMeta: (item) => [item.date, item.topic].filter(Boolean).join(' · '),
    itemThumb: (item) => item.image?.small || item.image?.src || '',
    itemId: (item) => item.slug,
    newItem: () => ({
      slug: 'new-essay',
      topic: 'technology',
      tone: '',
      date: new Date().toISOString().slice(0, 10),
      title: '',
      dek: '',
      image: { src: '', small: '', w: 0, h: 0, focus: '50% 50%', alt: '', by: '', license: '', licenseUrl: '', page: '' },
      body: [''],
    }),
    of: {
      type: 'object',
      fields: {
        title: t('Title'),
        slug: { type: 'slug', label: 'Address', help: 'Used in links to the essay: #/writing/<address>.' },
        dek: area('Standfirst', { rows: 2, help: 'One or two sentences under the title.' }),
        date: { type: 'date', label: 'Date' },
        topic: { type: 'select', label: 'Topic', options: (draft) => Object.entries(draft.copy?.en?.writingTopics || {}), help: 'To add a topic, give it a name in Site text, Writing.' },
        tone: { type: 'select', label: 'Card colour', options: [['', 'None'], ['sand', 'Sand'], ['palm', 'Palm'], ['sky', 'Sky']] },
        image: {
          type: 'image',
          label: 'Photo',
          alt: 'text',
          dir: 'writing',
          max: 1600,
          small: 800,
          help: 'From Wikimedia Commons or your own, with its credit below.',
          extra: {
            focus: t('Focus point', { help: 'Which part stays in view when the photo is cropped: 50% 50% is the centre.' }),
            by: t('Photo by'),
            license: t('Licence', { placeholder: 'CC BY-SA 4.0' }),
            licenseUrl: { type: 'url', label: 'Licence link' },
            page: { type: 'url', label: 'Photo page', help: 'Where the photo comes from.' },
          },
        },
        body: { type: 'blocks', label: 'Text', help: 'Paragraphs, headings, quotes and lists. In text, **words** are bold and *words* italic.' },
      },
    },
  },

  experience: {
    type: 'array',
    itemLabel: (item) => item.org || 'New entry',
    newItem: () => ({ org: '', role: { en: '', sw: '' }, period: { en: '', sw: '' } }),
    of: { type: 'object', fields: { org: t('Organisation'), role: both('Role'), period: both('When') } },
  },

  skills: {
    type: 'array',
    itemLabel: (item) => item.name?.en || 'New group',
    newItem: () => ({ name: { en: '', sw: '' }, items: { en: '', sw: '' } }),
    of: { type: 'object', fields: { name: both('Group'), items: both('Skills', 'textarea', { rows: 2 }) } },
  },

  education: {
    type: 'array',
    itemLabel: (item) => item.org || 'New entry',
    newItem: () => ({ org: '', detail: { en: '', sw: '' }, period: { en: '', sw: '' } }),
    of: { type: 'object', fields: { org: t('School'), detail: both('Course'), period: both('When') } },
  },

  certificates: {
    type: 'array',
    itemLabel: (item) => item.name?.en || 'New certificate',
    newItem: () => ({ name: { en: '', sw: '' }, issuer: { en: '', sw: '' } }),
    of: { type: 'object', fields: { name: both('Certificate'), issuer: both('From') } },
  },

  tools: {
    type: 'array',
    itemLabel: (item) => item.name?.en || 'New group',
    newItem: () => ({ name: { en: '', sw: '' }, tools: [] }),
    of: {
      type: 'object',
      fields: {
        name: both('Group'),
        tools: {
          type: 'array',
          label: 'Tools',
          compact: true,
          itemLabel: (item) => item.name || 'New tool',
          newItem: () => ({ name: '', hex: '#111111', on: '#ffffff', path: '' }),
          of: {
            type: 'object',
            fields: {
              name: t('Name'),
              hex: { type: 'color', label: 'Brand colour', help: 'The tile lights up in it.' },
              on: { type: 'color', label: 'Logo colour on it' },
              path: { type: 'svg', label: 'Logo', help: 'The path from simpleicons.org (24 by 24). Paste the d="..." value.' },
              stroke: { type: 'number', label: 'Line weight', optional: true, step: 0.25, help: 'Only for line drawings. Leave it out for filled logos.' },
            },
          },
        },
      },
    },
  },

  words: {
    type: 'array',
    itemLabel: (item) => item.word || 'New word',
    newItem: () => ({ word: '', say: '', meaning: '', short: '' }),
    of: {
      type: 'object',
      fields: {
        word: t('Word'),
        say: t('Say it', { help: 'How it sounds, with the strong part in capitals: kah-REE-boo.' }),
        meaning: t('Meaning'),
        short: t('Short meaning', { help: 'For small screens.' }),
      },
    },
  },

  cv: {
    type: 'object',
    fields: {
      name: t('Name'),
      headline: { type: 'list', label: 'Headline', help: 'One line each, under your name.' },
      contact: {
        type: 'array',
        label: 'Contact lines',
        help: 'Two groups: how to reach you, then where to see the work.',
        itemLabel: (item, i) => (i === 0 ? 'How to reach you' : i === 1 ? 'Where to see the work' : `Group ${i + 1}`),
        newItem: () => [],
        of: {
          type: 'array',
          compact: true,
          itemLabel: (item) => item.text || 'New line',
          newItem: () => ({ text: '' }),
          of: { type: 'object', fields: { text: t('Text'), href: { type: 'url', label: 'Link', optional: true, help: 'mailto:, tel: or https:' } } },
        },
      },
      profile: area('Profile', { rows: 4, help: RICH }),
      experience: {
        type: 'array',
        label: 'Experience',
        itemLabel: (item) => [item.role, item.org].filter(Boolean).join(', ') || 'New job',
        newItem: () => ({ role: '', org: '', dates: '', bullets: [] }),
        of: { type: 'object', fields: { role: t('Role'), org: t('Organisation'), dates: t('Dates'), bullets: { type: 'list', label: 'Points', help: 'One line per point, facts only.' } } },
      },
      projects: {
        type: 'array',
        label: 'Projects',
        compact: true,
        itemLabel: (item) => item.name || 'New project',
        newItem: () => ({ name: '', what: '', tech: '' }),
        of: { type: 'object', fields: { name: t('Name'), what: t('What it is'), tech: t('Tools or link') } },
      },
      projectsNote: t('Note under the projects'),
      education: {
        type: 'array',
        label: 'Education',
        itemLabel: (item) => item.school || 'New entry',
        newItem: () => ({ degree: '', school: '', dates: '' }),
        of: { type: 'object', fields: { degree: t('Degree'), school: t('School'), dates: t('Dates') } },
      },
      skills: { type: 'array', label: 'Skills', compact: true, itemLabel: (item) => item[0] || 'New group', newItem: () => ['', ''], of: { type: 'pair', labels: ['Group', 'Skills'] } },
      certifications: { type: 'list', label: 'Certifications' },
      languages: t('Languages'),
      interests: t('Interests'),
      referees: {
        type: 'array',
        label: 'Referees',
        compact: true,
        warn: 'Names and roles only. Their phone numbers and emails stay in private/referees.json and never go on the website.',
        itemLabel: (item) => item.name || 'New referee',
        newItem: () => ({ name: '', role: '', org: '' }),
        of: { type: 'object', fields: { name: t('Name'), role: t('Role'), org: t('Organisation') } },
      },
      refereesNote: t('Note under the referees'),
    },
  },
}

// Site text (copy.json) has its own editor: every line, in both languages, by page.
export const copyGroups = [
  ['Home', /^(head|builds|lede|hero|play|needs|cta|orEmail|say|sky|word|swahiliTime|periods|grass|cvTitle|cvMeta|readCv|githubLine|githubButton)/],
  ['Work', /^(work|motion|wins|likeThis|demo|visit|privateWork)/],
  ['About', /^(aboutPageTitle|story|experience|education|skills|tools|certificates)/],
  ['Writing', /^writing/],
  ['CV', /^(cvPageTitle|downloadPdf|print|cvLanguageNote)/],
  ['Contact', /^(contact|chat|compose|phoneLabel)/],
  ['Menu and buttons', /./],
]
