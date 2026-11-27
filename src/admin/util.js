export const clone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)))
export const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
export const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

// Lowercase letters, numbers and single hyphens: "Drax Raw!" becomes "drax-raw".
export const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export function debounce(fn, ms) {
  let timer = 0
  const run = (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
  run.flush = (...args) => {
    clearTimeout(timer)
    fn(...args)
  }
  return run
}

export function getPath(root, path) {
  return path.reduce((value, key) => (value == null ? undefined : value[key]), root)
}

// Sets one value deep inside, or removes it when value is undefined.
export function setPath(root, path, value) {
  const parent = getPath(root, path.slice(0, -1))
  const key = path[path.length - 1]
  if (parent == null) return
  if (value === undefined) {
    if (Array.isArray(parent)) parent.splice(key, 1)
    else delete parent[key]
  } else parent[key] = value
}

// Where two versions differ, as a list of paths. Objects are compared key by key and lists
// of the same length item by item; a list that grew or shrank counts as one change.
export function diff(before, after, path = [], out = []) {
  if (same(before, after)) return out
  if (isObject(before) && isObject(after)) {
    for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) diff(before[key], after[key], [...path, key], out)
    return out
  }
  if (Array.isArray(before) && Array.isArray(after) && before.length === after.length) {
    before.forEach((item, i) => diff(item, after[i], [...path, i], out))
    return out
  }
  out.push({ path, before, after })
  return out
}

// A short readable version of any value, for the list of changes.
export function preview(value, max = 90) {
  if (value === undefined) return 'nothing'
  if (typeof value === 'string') return value ? (value.length > max ? `${value.slice(0, max - 1)}...` : value) : 'empty'
  if (Array.isArray(value)) return `${value.length} ${value.length === 1 ? 'item' : 'items'}`
  if (isObject(value)) return 'a group of fields'
  return String(value)
}

export function ago(time) {
  if (!time) return ''
  const seconds = Math.round((Date.now() - new Date(time).getTime()) / 1000)
  if (seconds < 45) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  return new Date(time).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
}

// The site is one folder up from the admin page; pictures not yet published are in the draft.
export function assetUrl(src, files) {
  if (!src) return ''
  if (files?.[src]) return files[src]
  if (/^(https?:|data:|blob:)/.test(src)) return src
  return `../${src.replace(/^\.?\//, '')}`
}

export function download(name, text, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const link = Object.assign(document.createElement('a'), { href: url, download: name })
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const toJson = (value) => `${JSON.stringify(value, null, 2)}\n`
