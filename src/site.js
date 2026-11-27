// Everything the site says lives in the JSON files in src/data, one per collection. The
// admin page (/admin/) edits them; the build carries them, so the site works on any
// static host with no server. Two things can replace them while the site runs:
//
//  - Preview: with ?preview in the address, the site shows the admin's unpublished draft
//    from this same browser, and follows each edit live.
//  - Your own server: build with VITE_API_URL=https://your-server and the site loads the
//    latest content from it (see server/README.md). The built-in content stays as the
//    fallback, so the site never goes blank when the server is down.
//
// Components import from content.js, cv.js, writing.js and tools.js as before. Those
// objects are reactive and are updated in place, so the pages follow any change.
import { reactive } from 'vue'
import { bundled, KEYS } from './data/index.js'
import { onDraftChange, readDraft, withFiles } from './draft.js'

export { bundled, KEYS }

const clone = (value) => JSON.parse(JSON.stringify(value))
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

export const site = reactive(clone(bundled))

// Replace collections in place, so every component that holds them sees the change.
// A collection of the wrong shape is skipped: bad data must never break the site.
export function replaceContent(collections) {
  for (const key of KEYS) {
    if (!collections || !(key in collections)) continue
    const next = clone(collections[key])
    const target = site[key]
    if (Array.isArray(target) && Array.isArray(next)) target.splice(0, target.length, ...next)
    else if (isObject(target) && isObject(next)) {
      for (const k of Object.keys(target)) if (!(k in next)) delete target[k]
      Object.assign(target, next)
    }
  }
}

const params = new URLSearchParams(window.location.search)
export const preview = reactive({
  on: params.has('preview'),
  framed: window.self !== window.top, // inside the admin page's preview pane
  savedAt: null,
})

export const API = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
const CACHE = 'pot4lio:content'

async function applyDraft() {
  const draft = await readDraft()
  if (!draft) return
  replaceContent(withFiles(draft.collections, draft.files))
  preview.savedAt = draft.savedAt
}

async function refreshFromServer() {
  try {
    const response = await fetch(`${API}/api/content`, { headers: { Accept: 'application/json' } })
    if (!response.ok) return
    const data = await response.json()
    if (!data.version || !data.collections) return
    replaceContent(data.collections)
    try {
      localStorage.setItem(CACHE, JSON.stringify({ version: data.version, collections: data.collections }))
    } catch {
      // Storage full or blocked: the next visit fetches again.
    }
  } catch {
    // Offline or the server is down: keep what the page already shows.
  }
}

// Called once before the app mounts. It waits only for the draft in preview mode, which is
// local and fast; the server's copy shows from cache at once and refreshes in the background.
export async function loadContent() {
  if (preview.on) {
    await applyDraft()
    onDraftChange(() => applyDraft())
    return
  }
  if (!API) return
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE) || 'null')
    if (cached?.collections) replaceContent(cached.collections)
  } catch {
    // No cache: the built-in content shows until the server answers.
  }
  refreshFromServer()
}

// The contact form posts here when a server is connected (see EmailCompose.vue).
export async function sendMessage(message) {
  const response = await fetch(`${API}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  })
  if (!response.ok) throw new Error(`The server answered ${response.status}`)
}
