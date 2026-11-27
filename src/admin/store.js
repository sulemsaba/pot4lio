// The admin page's state. There are two copies of the content:
//   published  what the live site has (built in, or loaded from GitHub or the server)
//   draft      your working copy, saved in this browser on every change
// Publishing sends the difference to wherever "mode" says (see Settings).
import { computed, reactive, ref, watch } from 'vue'
import { bundled, fileOf, KEYS } from '../data/index.js'
import { clearDraft, readDraft, writeDraft } from '../draft.js'
import { createGitHub } from './github.js'
import { prepareImage } from './images.js'
import { titles } from './schema.js'
import { createServer } from './server.js'
import { clone, debounce, isObject, same, setPath, slugify, toJson } from './util.js'

const SETTINGS = 'pot4lio:admin'
const TOKENS = 'pot4lio:admin-tokens'

function readJson(storage, key) {
  try {
    return JSON.parse(storage.getItem(key) || 'null')
  } catch {
    return null
  }
}
function writeJson(storage, key, value) {
  try {
    if (value == null) storage.removeItem(key)
    else storage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage blocked: settings last until the page closes.
  }
}

export const state = reactive({
  ready: false,
  mode: 'local', // local, github, server
  remember: true,
  github: { owner: 'sulemsaba', repo: 'pot4lio', branch: 'main', token: '', login: '', avatar: '' },
  server: { url: '', token: '', email: '', name: '' },
  connected: false,
  published: clone(bundled),
  base: clone(bundled), // what the draft was started from, to spot edits made elsewhere
  shas: {}, // GitHub: the version of each file
  version: null, // server: the content version
  draft: clone(bundled),
  files: {}, // pictures not yet published: { 'work/x.webp': 'data:...' }
  recent: {}, // pictures published in this visit, shown until the deploy serves them
  savedAt: null,
  busy: '', // loading, publishing
  error: '',
  conflicts: [], // collections changed both here and elsewhere
  lastPublish: null, // { at, url, sha, deploy }
  toasts: [],
})

// A field the page was asked to show (from Overview or Changes): lists open up to reveal it.
export const reveal = ref(null)

// ---------- Changes ----------

const publishedJson = computed(() => Object.fromEntries(KEYS.map((key) => [key, JSON.stringify(state.published[key])])))
export const changedKeys = computed(() => KEYS.filter((key) => JSON.stringify(state.draft[key]) !== publishedJson.value[key]))
// Pictures still in use by the draft (one added and then removed again is left behind).
export const pendingFiles = computed(() => {
  const text = JSON.stringify(state.draft)
  return Object.keys(state.files).filter((path) => text.includes(JSON.stringify(path)))
})
export const hasChanges = computed(() => changedKeys.value.length > 0 || pendingFiles.value.length > 0)

export function revertKey(key) {
  state.draft[key] = clone(state.published[key])
}

export function revertPath(key, path, value) {
  if (!path.length) return revertKey(key)
  setPath(state.draft[key], path, clone(value))
}

export function discardAll() {
  for (const key of KEYS) state.draft[key] = clone(state.published[key])
  state.files = {}
  state.conflicts = []
  toast('All changes discarded. The draft is the published content again.')
}

// ---------- Toasts ----------

let toastId = 0
export function toast(text, { action, run, tone = 'info', ms = 5200 } = {}) {
  const id = ++toastId
  state.toasts.push({ id, text, action, run, tone })
  setTimeout(() => dismiss(id), ms)
  return id
}
export function dismiss(id) {
  const i = state.toasts.findIndex((item) => item.id === id)
  if (i >= 0) state.toasts.splice(i, 1)
}

// ---------- Saving the draft in this browser ----------

const persist = debounce(async () => {
  const savedAt = new Date().toISOString()
  try {
    await writeDraft({ collections: clone(state.draft), files: { ...state.files }, base: clone(state.base), savedAt })
    state.savedAt = savedAt
  } catch {
    state.error = 'This browser would not save the draft (storage full or blocked). Download the content file in Settings to keep your work.'
  }
}, 350)

watch(() => [state.draft, state.files], () => state.ready && persist(), { deep: true })

// ---------- Settings ----------

function saveSettings() {
  writeJson(localStorage, SETTINGS, {
    mode: state.mode,
    remember: state.remember,
    github: { owner: state.github.owner, repo: state.github.repo, branch: state.github.branch, login: state.github.login, avatar: state.github.avatar },
    server: { url: state.server.url, email: state.server.email, name: state.server.name },
  })
  const tokens = { github: state.github.token, server: state.server.token }
  writeJson(state.remember ? localStorage : sessionStorage, TOKENS, tokens)
  writeJson(state.remember ? sessionStorage : localStorage, TOKENS, null)
}

function loadSettings() {
  const saved = readJson(localStorage, SETTINGS)
  if (saved) {
    state.mode = saved.mode || 'local'
    state.remember = saved.remember !== false
    Object.assign(state.github, saved.github || {})
    Object.assign(state.server, saved.server || {})
  }
  const tokens = readJson(localStorage, TOKENS) || readJson(sessionStorage, TOKENS) || {}
  state.github.token = tokens.github || ''
  state.server.token = tokens.server || ''
}

export const github = () => createGitHub(state.github)
export const server = () => createServer(state.server)

export const where = computed(() => {
  if (state.mode === 'github') return { label: `GitHub: ${state.github.owner}/${state.github.repo}`, short: 'GitHub', ok: state.connected }
  if (state.mode === 'server') return { label: `Server: ${state.server.url.replace(/^https?:\/\//, '')}`, short: 'Server', ok: state.connected }
  return { label: 'This browser only', short: 'This browser', ok: true }
})

// ---------- Loading ----------

// New published content arrived (from GitHub or the server). Collections you have not
// touched simply follow it; ones changed in both places wait for your choice.
function rebase(remote) {
  const conflicts = []
  for (const key of KEYS) {
    if (!(key in remote)) continue
    const mine = !same(state.draft[key], state.base[key])
    const theirs = !same(remote[key], state.base[key])
    if (!mine) state.draft[key] = clone(remote[key])
    else if (theirs && !same(state.draft[key], remote[key])) conflicts.push(key)
    state.published[key] = clone(remote[key])
  }
  for (const key of KEYS) if (!conflicts.includes(key) && key in remote) state.base[key] = clone(remote[key])
  state.conflicts = conflicts
}

export function resolveConflict(key, keep) {
  if (keep === 'theirs') state.draft[key] = clone(state.published[key])
  state.base[key] = clone(state.published[key])
  state.conflicts = state.conflicts.filter((k) => k !== key)
}

async function loadRemote() {
  if (state.mode === 'github') {
    if (!state.github.token) throw new Error('Paste your GitHub token in Settings to connect.')
    const { collections, shas } = await github().load()
    state.shas = shas
    rebase(collections)
  } else if (state.mode === 'server') {
    if (!state.server.url) throw new Error('Add your server address in Settings.')
    const data = await server().content()
    state.version = data.version
    // An empty server starts from the content built into the site.
    if (data.version) rebase(data.collections)
    if (state.server.token) {
      const me = await server().me()
      state.server.name = me.name || ''
      state.server.email = me.email || state.server.email
    }
  }
}

export async function connect() {
  state.error = ''
  state.connected = false
  if (state.mode === 'local') return
  state.busy = 'loading'
  try {
    await loadRemote()
    state.connected = state.mode === 'github' || Boolean(state.server.token)
  } catch (error) {
    state.error = error.message
  } finally {
    state.busy = ''
  }
}

export async function init() {
  loadSettings()
  const saved = await readDraft()
  if (saved?.collections) {
    for (const key of KEYS) if (key in saved.collections) state.draft[key] = saved.collections[key]
    state.files = saved.files || {}
    if (saved.base) for (const key of KEYS) if (key in saved.base) state.base[key] = saved.base[key]
    state.savedAt = saved.savedAt
  }
  // The site may have been rebuilt since the draft began: follow it where you made no edits.
  rebase(clone(bundled))
  state.ready = true
  await connect()
}

export async function setMode(mode) {
  state.mode = mode
  saveSettings()
  await connect()
}

export async function connectGitHub({ owner, repo, branch, token, remember }) {
  Object.assign(state.github, { owner, repo, branch, token })
  state.remember = remember
  const who = await createGitHub(state.github).check()
  state.github.login = who.login
  state.github.avatar = who.avatar
  state.mode = 'github'
  saveSettings()
  await connect()
  return who
}

export async function signIn({ url, email, password, remember }) {
  state.server.url = url.replace(/\/+$/, '')
  state.remember = remember
  const result = await createServer({ url: state.server.url }).login(email, password)
  Object.assign(state.server, { token: result.token, email: result.user.email, name: result.user.name || '' })
  state.mode = 'server'
  saveSettings()
  await connect()
}

export function signOut() {
  if (state.mode === 'github') Object.assign(state.github, { token: '', login: '', avatar: '' })
  else Object.assign(state.server, { token: '' })
  state.connected = false
  saveSettings()
}

// ---------- Pictures ----------

// Gets a picture ready and gives back what goes in the content. With a server it uploads
// at once; otherwise the picture waits in the draft and is published with the rest.
export async function addPicture(file, { dir = 'uploads', max = 1600, small = 0, name = '' } = {}) {
  const stem = slugify(name || file.name.replace(/\.[^.]+$/, '')) || 'picture'
  const tag = Math.random().toString(36).slice(2, 6)
  const path = `${dir ? `${dir}/` : ''}${stem}-${tag}.webp`
  const main = await prepareImage(file, max)
  const extra = small ? await prepareImage(file, small) : null
  if (state.mode === 'server' && state.connected) {
    const api = server()
    const up = await api.upload(main.blob, `${stem}.webp`, dir || 'uploads')
    const upSmall = extra ? await api.upload(extra.blob, `${stem}-sm.webp`, dir || 'uploads') : null
    return { src: up.url, w: main.w, h: main.h, small: upSmall?.url }
  }
  state.files[path] = main.dataUrl
  let smallPath
  if (extra) {
    smallPath = path.replace(/\.webp$/, '-sm.webp')
    state.files[smallPath] = extra.dataUrl
  }
  return { src: path, w: main.w, h: main.h, small: smallPath }
}

// ---------- Publishing ----------

export function describeChanges(keys = changedKeys.value) {
  const names = keys.map((key) => titles[key].toLowerCase())
  if (!names.length) return pendingFiles.value.length ? 'Add pictures' : 'Update content'
  const list = names.length > 2 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names.join(' and ')
  return `Update ${list}`
}

async function publishToGitHub(message) {
  const api = github()
  // Edits made from another device since this page loaded: bring them in first.
  const now = await api.shas()
  const moved = changedKeys.value.filter((key) => now[key] && state.shas[key] && now[key] !== state.shas[key])
  if (moved.length) {
    await loadRemote()
    if (state.conflicts.length) {
      throw new Error('Someone published from another device in the meantime. Choose what to keep at the top of the page, then publish again.')
    }
  }
  const keys = changedKeys.value
  const pictures = pendingFiles.value
  const files = [
    ...keys.map((key) => ({ path: fileOf(key), text: toJson(state.draft[key]) })),
    ...pictures.map((path) => ({ path: `public/${path}`, base64: state.files[path].split(',')[1] })),
  ]
  if (!files.length) return null
  const result = await api.commit(`${message}\n\nPublished from the admin page.`, files)
  for (const key of keys) {
    state.published[key] = clone(state.draft[key])
    state.base[key] = clone(state.draft[key])
    state.shas[key] = result.blobs[fileOf(key)] || state.shas[key]
  }
  for (const path of pictures) state.recent[path] = state.files[path]
  state.files = {}
  state.lastPublish = { at: new Date().toISOString(), url: result.url, sha: result.sha, deploy: { status: 'queued' } }
  followDeploy(result.sha)
  return result
}

async function followDeploy(sha) {
  const api = github()
  for (let i = 0; i < 40; i++) {
    await new Promise((resolve) => setTimeout(resolve, i < 3 ? 4000 : 8000))
    if (state.lastPublish?.sha !== sha) return
    const run = await api.deployOf(sha)
    if (!run) {
      if (i > 4) {
        state.lastPublish.deploy = { status: 'unknown' }
        return
      }
      continue
    }
    state.lastPublish.deploy = run
    if (run.status === 'completed') {
      if (run.conclusion === 'success') toast('The live site is updated.', { tone: 'ok' })
      else toast('The deploy failed. Open it on GitHub to see why.', { tone: 'error', action: 'Open', run: () => window.open(run.url, '_blank', 'noopener') })
      return
    }
  }
}

async function publishToServer(message) {
  const api = server()
  // Pictures added before the server was connected go up first.
  for (const path of pendingFiles.value) {
    const blob = await (await fetch(state.files[path])).blob()
    const up = await api.upload(blob, path.split('/').pop(), path.includes('/') ? path.split('/')[0] : 'uploads')
    const swap = (value) => {
      if (typeof value === 'string') return value === path ? up.url : value
      if (Array.isArray(value)) return value.map(swap)
      if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, swap(v)]))
      return value
    }
    for (const key of KEYS) state.draft[key] = swap(state.draft[key])
  }
  state.files = {}
  const keys = changedKeys.value
  if (!keys.length) return null
  // An empty server gets everything, so it holds the whole site from the first save.
  const send = state.version ? keys : KEYS
  try {
    const result = await api.save(Object.fromEntries(send.map((key) => [key, state.draft[key]])), state.version, message)
    for (const key of send) {
      state.published[key] = clone(state.draft[key])
      state.base[key] = clone(state.draft[key])
    }
    state.version = result.version
    state.lastPublish = { at: new Date().toISOString(), version: result.version, deploy: { status: 'completed', conclusion: 'success' } }
    return result
  } catch (error) {
    if (error.status === 409) {
      await loadRemote()
      throw new Error(
        state.conflicts.length
          ? 'Someone published from another device in the meantime. Choose what to keep at the top of the page, then publish again.'
          : 'Someone published from another device in the meantime. Their changes are in now; check, then publish again.',
      )
    }
    throw error
  }
}

export async function publish(message) {
  if (state.busy) return
  state.error = ''
  state.busy = 'publishing'
  try {
    const result = state.mode === 'github' ? await publishToGitHub(message) : await publishToServer(message)
    persist.flush()
    return result
  } finally {
    state.busy = ''
  }
}

// ---------- The content file (works with no connection at all) ----------

export function exportBundle() {
  return toJson({ format: 'pot4lio-content', version: 1, exportedAt: new Date().toISOString(), collections: state.draft, files: state.files })
}

export function importBundle(text) {
  const data = JSON.parse(text)
  if (data?.format !== 'pot4lio-content' || !isObject(data.collections)) throw new Error('That is not a content file from this admin page.')
  let count = 0
  for (const key of KEYS) {
    if (key in data.collections) {
      state.draft[key] = clone(data.collections[key])
      count++
    }
  }
  Object.assign(state.files, data.files || {})
  return count
}

export async function resetDraft() {
  await clearDraft()
  discardAll()
}
