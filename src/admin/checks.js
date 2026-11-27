// Things worth a look before publishing, found by reading the draft. Each one says where it
// is, so the Overview can take you straight to the field.
import { schema, titles } from './schema.js'
import { isObject } from './util.js'

const DASHES = /[\u2012-\u2015\u2212]/

// "Projects, MangiPlus, Wins (Kiswahili)" for a path inside a collection.
export function describe(key, path, draft) {
  if (key === 'copy') {
    const [lang, ...rest] = path
    const words = rest.map((part) => (typeof part === 'number' ? String(part + 1) : part.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase())).join(', ')
    return `Site text, ${words.charAt(0).toUpperCase()}${words.slice(1)}${lang ? (lang === 'sw' ? ' (Kiswahili)' : ' (English)') : ''}`
  }
  const parts = [titles[key]]
  let node = schema[key]
  let value = draft[key]
  for (const segment of path) {
    if (!node) {
      parts.push(String(segment))
      continue
    }
    if (node.type === 'array') {
      const item = value?.[segment]
      parts.push(node.itemLabel ? node.itemLabel(item || {}, segment) : `Item ${segment + 1}`)
      node = node.of
    } else if (node.type === 'object') {
      const field = node.fields?.[segment]
      if (field?.label) parts.push(field.label)
      node = field
    } else if (node.type === 'i18n') {
      parts.push(segment === 'sw' ? '(Kiswahili)' : '(English)')
      node = null
    } else if (node.type === 'image') {
      const name = { alt: 'description', src: 'file', w: 'width', h: 'height', small: 'small file' }[segment]
      if (name) parts.push(name)
      node = segment === 'alt' && node.alt === 'i18n' ? { type: 'i18n' } : null
    } else node = null
    value = value?.[segment]
  }
  return parts.join(', ').replace(', (', ' (')
}

// Where a path lives in the admin page: the section, and the item for projects and essays.
export function locate(key, path, draft) {
  const section = ['experience', 'skills', 'education', 'certificates', 'tools'].includes(key) ? 'about' : key
  if ((key === 'projects' || key === 'essays') && typeof path[0] === 'number') {
    const item = draft[key][path[0]]
    return { section, item: schema[key].itemId(item) }
  }
  return { section, item: '' }
}

export const fieldId = (key, path) => `f-${key}-${path.join('-')}`

function walkStrings(value, path, visit) {
  if (typeof value === 'string') visit(value, path)
  else if (Array.isArray(value)) value.forEach((item, i) => walkStrings(item, [...path, i], visit))
  else if (isObject(value)) for (const [k, v] of Object.entries(value)) walkStrings(v, [...path, k], visit)
}

const empty = (v) => (Array.isArray(v) ? v.length === 0 : !String(v ?? '').trim())

function walkPairs(value, path, visit) {
  if (isObject(value)) {
    const keys = Object.keys(value)
    if (keys.length === 2 && 'en' in value && 'sw' in value) return visit(value, path)
    for (const [k, v] of Object.entries(value)) walkPairs(v, [...path, k], visit)
  } else if (Array.isArray(value)) value.forEach((item, i) => walkPairs(item, [...path, i], visit))
}

export function runChecks(draft) {
  const found = []
  const add = (level, text, key, path = [], fix) => found.push({ level, text, key, path, where: describe(key, path, draft), fix })

  // Long dashes: the site uses only the plain hyphen.
  for (const key of Object.keys(draft)) {
    walkStrings(draft[key], [], (text, path) => {
      if (DASHES.test(text)) add('warn', 'Has a long dash. The site uses only the plain hyphen.', key, path, 'dash')
    })
  }

  // One language filled in and the other left empty.
  for (const key of Object.keys(draft)) {
    if (key === 'copy') continue
    walkPairs(draft[key], [], (pair, path) => {
      if (empty(pair.en) && !empty(pair.sw)) add('warn', 'Has Kiswahili but no English.', key, [...path, 'en'])
      else if (empty(pair.sw) && !empty(pair.en)) add('warn', 'Has English but no Kiswahili.', key, [...path, 'sw'])
    })
  }
  const copyWalk = (en, sw, path) => {
    if (typeof en === 'string' || typeof sw === 'string') {
      // Only Kiswahili is checked: a few notes are for Kiswahili readers alone, on purpose.
      if (empty(sw) && !empty(en)) add('warn', 'Site text with no Kiswahili.', 'copy', ['sw', ...path])
      return
    }
    if (Array.isArray(en) && en.every((x) => typeof x === 'string')) {
      if ((sw || []).length !== en.length) add('info', 'The two languages have a different number of lines.', 'copy', ['sw', ...path])
      return
    }
    for (const k of new Set([...Object.keys(en || {}), ...Object.keys(sw || {})])) copyWalk(en?.[k], sw?.[k], [...path, k])
  }
  copyWalk(draft.copy?.en, draft.copy?.sw, [])

  // Projects.
  const ids = new Set()
  ;(draft.projects || []).forEach((project, i) => {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(project.id || '')) add('error', 'The address needs lowercase letters, numbers and hyphens only.', 'projects', [i, 'id'])
    else if (ids.has(project.id)) add('error', 'Two projects have the same address.', 'projects', [i, 'id'])
    ids.add(project.id)
    if (empty(project.wins?.en) && empty(project.wins?.sw)) add('info', 'No wins yet: say what it does for the people who use it.', 'projects', [i, 'wins'])
    if (!project.images?.length) add('warn', 'No images yet.', 'projects', [i, 'images'])
    ;(project.images || []).forEach((image, j) => {
      if (!image.src) add('error', 'An image with no picture.', 'projects', [i, 'images', j])
      if (empty(image.alt?.en)) add('warn', 'An image with no description, for people who cannot see it.', 'projects', [i, 'images', j, 'alt', 'en'])
    })
  })

  // Essays.
  const slugs = new Set()
  ;(draft.essays || []).forEach((essay, i) => {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(essay.slug || '')) add('error', 'The address needs lowercase letters, numbers and hyphens only.', 'essays', [i, 'slug'])
    else if (slugs.has(essay.slug)) add('error', 'Two essays have the same address.', 'essays', [i, 'slug'])
    slugs.add(essay.slug)
    if (!essay.image?.src) add('warn', 'No photo yet.', 'essays', [i, 'image'])
    else if (!essay.image.by) add('info', 'The photo has no credit.', 'essays', [i, 'image'])
    if (empty(essay.title)) add('error', 'No title.', 'essays', [i, 'title'])
  })

  // The CV's referees: names and roles only, never contact details.
  ;(draft.cv?.referees || []).forEach((ref, i) => {
    const text = Object.values(ref).join(' ')
    if (/@|\+?\d[\d\s-]{7,}/.test(text)) add('error', 'A referee has an email or phone number. Those stay private: remove it.', 'cv', ['referees', i])
  })

  if (!draft.profile?.links?.linkedin) add('info', 'LinkedIn is hidden until you add a link.', 'profile', ['links', 'linkedin'])

  const order = { error: 0, warn: 1, info: 2 }
  return found.sort((a, b) => order[a.level] - order[b.level])
}

// Swap every long dash for a plain hyphen, keeping the spacing readable.
export function fixDashes(value) {
  if (typeof value === 'string') return value.replace(/\s*[\u2014\u2015]\s*/g, ' - ').replace(/[\u2012\u2013\u2212]/g, '-')
  if (Array.isArray(value)) return value.map(fixDashes)
  if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fixDashes(v)]))
  return value
}
