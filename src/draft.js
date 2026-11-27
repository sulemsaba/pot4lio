// The admin page's working copy (the draft), kept in this browser's IndexedDB so it
// survives a refresh and holds new pictures too. The site reads it only in preview mode
// (?preview in the address). Nothing here ever leaves the browser.
//
// A draft is { collections, files, savedAt }:
//   collections  every content collection, as the admin is editing it
//   files        pictures added but not yet published: { 'work/new.webp': 'data:image/webp;base64,...' }

const DB = 'pot4lio-admin'
const STORE = 'kv'
const KEY = 'draft'
const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('pot4lio-draft') : null

function open() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function run(mode, action) {
  const db = await open()
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode)
      const request = action(tx.objectStore(STORE))
      tx.oncomplete = () => resolve(request?.result)
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}

export async function readDraft() {
  try {
    return (await run('readonly', (store) => store.get(KEY))) || null
  } catch {
    return null // private windows and blocked storage: no draft
  }
}

export async function writeDraft(draft) {
  await run('readwrite', (store) => store.put(draft, KEY))
  channel?.postMessage({ type: 'draft', savedAt: draft.savedAt })
}

export async function clearDraft() {
  await run('readwrite', (store) => store.delete(KEY))
  channel?.postMessage({ type: 'cleared' })
}

export function onDraftChange(callback) {
  if (!channel) return () => {}
  const listener = (event) => callback(event.data)
  channel.addEventListener('message', listener)
  return () => channel.removeEventListener('message', listener)
}

// Swap the paths of pictures that are not published yet for their data, so the preview
// can show them. The stored draft keeps the real paths, ready for publishing.
export function withFiles(value, files) {
  if (!files || !Object.keys(files).length) return value
  const walk = (item) => {
    if (typeof item === 'string') return files[item] || item
    if (Array.isArray(item)) return item.map(walk)
    if (item && typeof item === 'object') return Object.fromEntries(Object.entries(item).map(([k, v]) => [k, walk(v)]))
    return item
  }
  return walk(value)
}
