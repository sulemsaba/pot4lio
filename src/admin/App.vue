<template>
  <div class="admin" :class="{ 'has-preview': previewOpen && wide, 'nav-open': navOpen }">
    <header class="bar">
      <button type="button" class="icon-btn menu" :aria-expanded="String(navOpen)" aria-controls="side" aria-label="Menu" @click="navOpen = !navOpen"><Icon name="menu" /></button>
      <a class="brand" href="#/">
        <img :src="photo" alt="" width="28" height="28" />
        <span class="brand-name">{{ state.draft.profile.name }}</span>
        <span class="brand-tag">Admin</span>
      </a>

      <div class="state" :title="where.label">
        <span class="where" :class="{ off: !where.ok }"><Icon :name="whereIcon" :size="15" /> <span class="where-text">{{ where.short }}</span></span>
        <span class="saved" aria-live="polite">{{ savedText }}</span>
      </div>

      <div class="bar-actions">
        <button type="button" class="btn btn--ghost preview-btn" :aria-pressed="String(previewOpen && wide)" @click="togglePreview"><Icon name="eye" :size="16" /> <span class="hide-sm">Preview</span></button>
        <a v-if="hasChanges" class="btn btn--ghost changes-btn" href="#/changes"><span class="hide-sm">Changes</span> <span class="badge">{{ changeCount }}</span></a>
        <button type="button" class="btn btn--ink" :disabled="!state.ready" @click="publishOpen = true">
          <Icon :name="state.mode === 'local' ? 'download' : 'send'" :size="16" /> {{ state.mode === 'local' ? 'Save' : 'Publish' }}
        </button>
      </div>
    </header>

    <nav id="side" class="side" aria-label="Sections">
      <ul>
        <li v-for="s in sections" :key="s.id">
          <a :href="`#/${s.id === 'overview' ? '' : s.id}`" :aria-current="route.section === s.id ? 'page' : undefined" @click="navOpen = false">
            <Icon :name="s.icon" :size="17" />
            <span>{{ s.label }}</span>
            <span v-if="sectionChanged(s)" class="dot" title="Changed since publishing"></span>
            <span v-if="s.id === 'inbox' && state.mode !== 'server'" class="soon">server</span>
          </a>
        </li>
      </ul>
      <p class="side-foot">
        <a v-if="state.draft.profile.stats?.umami" href="https://cloud.umami.is" target="_blank" rel="noopener"><Icon name="eye" :size="14" /> Visitor statistics</a>
        <a href="../" target="_blank" rel="noopener"><Icon name="external" :size="14" /> The live site</a>
      </p>
    </nav>
    <div v-if="navOpen" class="nav-scrim" @click="navOpen = false"></div>

    <main class="main" :aria-busy="String(!state.ready)">
      <!-- Edits made in two places at once -->
      <div v-for="key in state.conflicts" :key="key" class="note note--warn conflict" role="alert">
        <Icon name="alert" :size="16" />
        <span><strong>{{ titles[key] }}</strong> changed on the live site too, while you were editing it here.</span>
        <span class="conflict-actions">
          <button type="button" class="btn btn--sm" @click="resolveConflict(key, 'mine')">Keep mine</button>
          <button type="button" class="btn btn--sm" @click="resolveConflict(key, 'theirs')">Use the live one</button>
        </span>
      </div>
      <div v-if="state.error" class="note note--bad banner" role="alert">
        <Icon name="alert" :size="16" />
        <span>{{ state.error }}</span>
        <span class="conflict-actions">
          <button type="button" class="btn btn--sm" @click="connect">Try again</button>
          <a class="btn btn--sm" href="#/settings">Settings</a>
        </span>
      </div>

      <div v-if="!state.ready" class="loading" aria-label="Loading">
        <span></span><span></span><span></span>
      </div>
      <OverviewView v-else-if="route.section === 'overview'" @publish="publishOpen = true" @go="go" />
      <CollectionView v-else-if="route.section === 'profile'" :keys="['profile']" title="Profile and links" intro="Your name, photo and the links used across the site." />
      <DetailView v-else-if="route.section === 'projects'" ckey="projects" section="projects" site-page="work" :item-id="route.item" title="Projects" intro="The work on the Work page, in the order it appears. Open one to edit it." add-label="New project" />
      <DetailView v-else-if="route.section === 'essays'" ckey="essays" section="essays" site-page="writing" :item-id="route.item" title="Writing" intro="The essays on the Writing page, newest first." add-label="New essay" />
      <CollectionView v-else-if="route.section === 'about'" :keys="['experience', 'skills', 'education', 'certificates', 'tools']" title="About page" intro="Your experience, skills, education, certificates and tools, in English and Kiswahili." />
      <CollectionView v-else-if="route.section === 'cv'" :keys="['cv']" title="CV" intro="The CV page, in English. Each deploy prints the PDF again from this, so the two always match." />
      <CollectionView v-else-if="route.section === 'words'" :keys="['words']" title="Kiswahili words" intro="The word card on Home: tap to flip, tap again for the next word." />
      <CopyView v-else-if="route.section === 'copy'" />
      <ChangesView v-else-if="route.section === 'changes'" @publish="publishOpen = true" @go="go" />
      <InboxView v-else-if="route.section === 'inbox'" />
      <HistoryView v-else-if="route.section === 'history'" :key="state.mode + state.connected" />
      <SettingsView v-else-if="route.section === 'settings'" />
    </main>

    <PreviewPane v-if="previewOpen && wide" :route="previewRoute" @close="previewOpen = false" />
    <PublishPanel v-if="publishOpen" @close="publishOpen = false" />

    <div class="toasts" aria-live="polite">
      <div v-for="t in state.toasts" :key="t.id" class="toast" :class="`is-${t.tone}`">
        <span>{{ t.text }}</span>
        <button v-if="t.action" type="button" class="toast-action" @click="t.run(); dismiss(t.id)">{{ t.action }}</button>
        <button type="button" class="icon-btn" aria-label="Dismiss" @click="dismiss(t.id)"><Icon name="close" :size="14" /></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { fieldId, locate } from './checks.js'
import { sections, titles } from './schema.js'
import { changedKeys, connect, dismiss, hasChanges, pendingFiles, resolveConflict, reveal, state, toast, where } from './store.js'
import { ago, assetUrl } from './util.js'
import Icon from './components/Icon.vue'
import PreviewPane from './components/PreviewPane.vue'
import PublishPanel from './components/PublishPanel.vue'
import ChangesView from './views/ChangesView.vue'
import CollectionView from './views/CollectionView.vue'
import CopyView from './views/CopyView.vue'
import DetailView from './views/DetailView.vue'
import HistoryView from './views/HistoryView.vue'
import InboxView from './views/InboxView.vue'
import OverviewView from './views/OverviewView.vue'
import SettingsView from './views/SettingsView.vue'

// ---------- Where you are: #/projects/levo ----------
const known = new Set([...sections.map((s) => s.id), 'changes'])
function readRoute() {
  const [section = '', item = ''] = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('/')
  return { section: known.has(section) ? section : 'overview', item }
}
const route = ref(readRoute())
async function onHash() {
  route.value = readRoute()
  navOpen.value = false
  await nextTick()
  if (!pendingFocus) document.querySelector('[data-title]')?.focus({ preventScroll: true })
  window.scrollTo({ top: 0 })
}

// ---------- The bar ----------
const navOpen = ref(false)
const publishOpen = ref(false)
const photo = computed(() => assetUrl(state.draft.profile.photo, state.files))
const whereIcon = computed(() => ({ local: 'laptop', github: 'github', server: 'server' })[state.mode])
const changeCount = computed(() => changedKeys.value.length + (pendingFiles.value.length ? 1 : 0))
const now = ref(Date.now())
let clock = 0
const savedText = computed(() => {
  now.value // refresh "2 min ago"
  if (state.busy === 'loading') return 'Loading'
  if (state.busy === 'publishing') return 'Publishing'
  return state.savedAt && hasChanges.value ? `Draft saved ${ago(state.savedAt)}` : hasChanges.value ? 'Draft' : 'All published'
})

function sectionChanged(s) {
  if (s.key) return changedKeys.value.includes(s.key)
  if (s.keys) return s.keys.some((k) => changedKeys.value.includes(k))
  return false
}

// ---------- Preview ----------
const wide = ref(false)
const media = window.matchMedia('(min-width: 75rem)')
const previewOpen = ref(false)
try {
  previewOpen.value = localStorage.getItem('pot4lio:admin-preview') === '1'
} catch {
  // stays closed
}
watch(previewOpen, (open) => {
  try {
    localStorage.setItem('pot4lio:admin-preview', open ? '1' : '0')
  } catch {
    // not remembered
  }
})
const previewRoute = computed(() => {
  const { section, item } = route.value
  const page = sections.find((s) => s.id === section)?.page
  if (section === 'projects' && item) return `work/${item}`
  if (section === 'essays' && item) return `writing/${item}`
  return page ?? lastPage.value
})
const lastPage = ref('')
watch(previewRoute, (r) => (lastPage.value = r))
// On small screens the preview opens in its own tab.
function togglePreview() {
  if (wide.value) previewOpen.value = !previewOpen.value
  else window.open(`../?preview#/${previewRoute.value}`, '_blank', 'noopener')
}

// ---------- Going straight to a field ----------
let pendingFocus = false
async function go({ key, path }) {
  const { section, item } = locate(key, path, state.draft)
  pendingFocus = true
  location.hash = `#/${section}${item ? `/${encodeURIComponent(item)}` : ''}`
  reveal.value = { key, path }
  for (let i = 0; i < 4; i++) await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 60))
  pendingFocus = false
  // The deepest part of the path that is on the page.
  for (let n = path.length; n >= 0; n--) {
    const target = fieldId(key, path.slice(0, n))
    const el = document.getElementById(target) || document.getElementById(`${target}-input`)
    if (!el) continue
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    const input = el.matches('input, textarea, select') ? el : el.querySelector('input, textarea, select, button')
    input?.focus({ preventScroll: true })
    el.classList.add('flash')
    setTimeout(() => el.classList.remove('flash'), 1600)
    return
  }
}

// ---------- Keys ----------
function onKey(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    toast('Your draft saves itself as you type. Publish when you are ready.')
  }
  if (event.key === 'Escape') navOpen.value = false
}

const sync = () => (wide.value = media.matches)
onMounted(() => {
  sync()
  media.addEventListener('change', sync)
  window.addEventListener('hashchange', onHash)
  window.addEventListener('keydown', onKey)
  clock = setInterval(() => (now.value = Date.now()), 30000)
})
onBeforeUnmount(() => {
  media.removeEventListener('change', sync)
  window.removeEventListener('hashchange', onHash)
  window.removeEventListener('keydown', onKey)
  clearInterval(clock)
})

</script>

<style scoped>
.admin {
  display: grid;
  grid-template-columns: 15rem minmax(0, 1fr);
  grid-template-rows: var(--bar) 1fr;
  min-height: 100dvh;
}
.admin.has-preview {
  grid-template-columns: 15rem minmax(0, 1fr) minmax(24rem, 34%);
}

/* Top bar */
.bar {
  position: sticky;
  top: 0;
  z-index: 30;
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.75rem 0 1rem;
  border-bottom: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  backdrop-filter: saturate(1.4) blur(10px);
}
.menu {
  display: none;
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
  color: inherit;
  text-decoration: none;
}
.brand img {
  border-radius: 50%;
  object-fit: cover;
}
.brand-name {
  overflow: hidden;
  font-weight: 650;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.brand-tag {
  padding: 0.0625rem 0.4375rem;
  border-radius: 999px;
  background: var(--panel);
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 650;
}
.state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  margin-left: 0.75rem;
  color: var(--muted);
  font-size: 0.8125rem;
}
.where {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.1875rem 0.5625rem;
  border-radius: 999px;
  background: var(--panel);
  color: var(--ink);
  font-weight: 550;
}
.where.off {
  background: var(--amber-soft);
  color: var(--amber);
}
.saved {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.bar-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-left: auto;
}
.preview-btn[aria-pressed='true'] {
  background: var(--panel);
}

/* Side menu */
.side {
  position: sticky;
  top: var(--bar);
  display: flex;
  flex-direction: column;
  height: calc(100dvh - var(--bar));
  padding: 0.75rem 0.625rem;
  overflow-y: auto;
  border-right: 1px solid var(--line);
  background: var(--panel);
}
.side ul {
  display: grid;
  gap: 0.125rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.side a {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 2.375rem;
  padding: 0 0.625rem;
  border-radius: var(--r-sm);
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 550;
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}
.side a:hover {
  background: var(--hover);
  color: var(--ink);
}
.side a[aria-current='page'] {
  background: var(--bg);
  color: var(--ink);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.06), 0 0 0 1px var(--line);
}
.side a[aria-current='page'] .icon {
  color: var(--sky);
}
.side .dot {
  margin-left: auto;
}
.soon {
  margin-left: auto;
  color: var(--faint);
  font-size: 0.6875rem;
  font-weight: 600;
}
.side-foot {
  margin-top: auto;
  padding: 0.75rem 0.625rem 0.25rem;
}
.side-foot a {
  min-height: 2rem;
  padding: 0;
  font-size: 0.8125rem;
}
.side-foot a:hover {
  background: none;
}

/* Main */
.main {
  min-width: 0;
  padding: 2rem clamp(1rem, 3vw, 2.5rem) 6rem;
}
.conflict,
.banner {
  flex-wrap: wrap;
  align-items: center;
  max-width: 60rem;
  margin-bottom: 0.75rem;
}
.conflict-actions {
  display: flex;
  gap: 0.375rem;
  margin-left: auto;
}
.loading {
  display: grid;
  gap: 0.75rem;
  max-width: 40rem;
}
.loading span {
  height: 1rem;
  border-radius: 0.375rem;
  background: var(--hover);
}
.loading span:first-child {
  width: 40%;
  height: 1.75rem;
}
.loading span:last-child {
  width: 70%;
}

/* Toasts */
.toasts {
  position: fixed;
  left: 50%;
  bottom: max(1rem, env(safe-area-inset-bottom));
  z-index: 60;
  display: grid;
  gap: 0.5rem;
  width: min(30rem, calc(100vw - 2rem));
  transform: translateX(-50%);
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.375rem 0.5rem 1rem;
  border-radius: 0.75rem;
  background: var(--ink);
  color: var(--on-ink);
  font-size: 0.875rem;
  box-shadow: var(--shadow);
  pointer-events: auto;
  animation: rise 0.22s var(--ease);
}
.toast > span {
  flex: 1;
}
.toast.is-error {
  background: var(--bad);
  color: #fff;
}
.toast .icon-btn {
  color: inherit;
  opacity: 0.7;
}
.toast .icon-btn:hover {
  background: color-mix(in srgb, var(--on-ink) 14%, transparent);
  opacity: 1;
}
.toast-action {
  padding: 0.25rem 0.625rem;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--on-ink) 16%, transparent);
  color: inherit;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
}

/* Small screens: the menu slides in from the left. */
@media (max-width: 56rem) {
  .admin,
  .admin.has-preview {
    grid-template-columns: minmax(0, 1fr);
  }
  .menu {
    display: inline-grid;
    margin-left: -0.375rem;
  }
  .side {
    position: fixed;
    top: var(--bar);
    left: 0;
    z-index: 40;
    width: min(17rem, 85vw);
    box-shadow: var(--shadow);
    transform: translateX(-105%);
    transition: transform 0.25s var(--ease);
  }
  .nav-open .side {
    transform: none;
  }
  .nav-scrim {
    position: fixed;
    inset: var(--bar) 0 0;
    z-index: 35;
    background: rgb(0 0 0 / 0.25);
  }
  .main {
    padding-top: 1.5rem;
  }
}
@media (max-width: 40rem) {
  .bar {
    gap: 0.5rem;
    padding: 0 0.5rem 0 0.75rem;
  }
  .brand-name,
  .saved,
  .hide-sm,
  .where-text {
    display: none;
  }
  .state {
    margin-left: 0;
  }
}
</style>

<style>
/* A field you were sent to lights up for a moment. */
.flash {
  animation: flash 1.6s var(--ease);
  border-radius: var(--r-sm);
}
@keyframes flash {
  0%,
  30% {
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--sky) 35%, transparent);
  }
  100% {
    box-shadow: 0 0 0 4px transparent;
  }
}
</style>
