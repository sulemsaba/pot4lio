<template>
  <a class="skip" href="#main" @click.prevent="focusMain">{{ t.skip }}</a>

  <div class="page" :class="{ 'is-switching': switching }">
    <a class="identity reveal" href="#/">
      <img :src="profile.photo" width="36" height="36" alt="" decoding="async" />
      <span>{{ profile.name }}</span>
    </a>

    <NavPill class="reveal" :pages="menu" :page="route.page" :t="t" />

    <div class="tools reveal">
      <div class="lang" role="group" :aria-label="t.language">
        <button
          v-for="option in languages"
          :key="option.code"
          type="button"
          class="lang-option"
          :lang="option.code"
          :aria-label="option.name"
          :aria-pressed="String(lang === option.code)"
          @click="setLang(option.code)"
        >
          {{ option.short }}
        </button>
      </div>
      <ThemeToggle :t="t" />
    </div>

    <main id="main" ref="main" tabindex="-1">
      <Transition name="page" mode="out-in" @after-leave="onAfterLeave" @after-enter="onAfterEnter">
        <component :is="views[route.page]" :key="route.page === 'writing' ? `writing/${route.sub}` : route.page" :lang="lang" :t="t" :focus="route.sub" />
      </Transition>
    </main>

    <SiteFooter :lang="lang" :t="t" :page="route.page" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { copy, profile, projects } from './content.js'
import { essays } from './writing.js'
import NavPill from './components/NavPill.vue'
import SiteFooter from './components/SiteFooter.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import CvPage from './pages/CvPage.vue'
import WritingPage from './pages/WritingPage.vue'
import HomePage from './pages/HomePage.vue'
import AboutPage from './pages/AboutPage.vue'
import WorkPage from './pages/WorkPage.vue'
import ContactPage from './pages/ContactPage.vue'

// The menu shows five pages; the CV has its own button in the footer (and on Home).
const menu = ['home', 'about', 'work', 'writing', 'contact']
const pages = [...menu, 'cv']
const views = { home: HomePage, about: AboutPage, work: WorkPage, writing: WritingPage, cv: CvPage, contact: ContactPage }

const languages = [
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'sw', short: 'SW', name: 'Kiswahili' },
]

// Pages live in the address after #, so the site works on any static host:
// #/about, #/work, #/work/ligiplay, #/writing, #/writing/<essay>, #/cv, #/contact. Older links
// like #ligiplay still land, and the old #/play opens Writing.
function readRoute() {
  const hash = decodeURIComponent(window.location.hash.slice(1))
  if (hash.startsWith('/')) {
    const [page, sub = ''] = hash.slice(1).split('/')
    if (page === 'play') return { page: 'writing', sub: '' }
    return pages.includes(page) ? { page, sub } : { page: 'home', sub: '' }
  }
  if (projects.some((project) => project.id === hash)) return { page: 'work', sub: hash }
  if (hash === 'contact') return { page: 'contact', sub: '' }
  return { page: 'home', sub: '' }
}

const route = ref(readRoute())
let navigated = false

function onHashChange() {
  const next = readRoute()
  if (next.page === route.value.page && next.sub === route.value.sub) return
  navigated = true
  if (next.page === route.value.page && next.page !== 'writing') {
    // Same page, new project: scroll to it without a page change. (Each essay is a page.)
    route.value = next
    document.getElementById(next.sub)?.scrollIntoView({ block: 'start' })
    return
  }
  route.value = next
}

// Between pages: back to the top, then the new page's title takes focus.
function onAfterLeave() {
  window.scrollTo({ top: 0, behavior: 'instant' })
}

function onAfterEnter() {
  if (!navigated) return
  document.querySelector('[data-page-title]')?.focus({ preventScroll: true })
  // A link to one project lands on it once the page has settled.
  if (route.value.sub) document.getElementById(route.value.sub)?.scrollIntoView({ block: 'start', behavior: 'instant' })
}

const main = ref(null)
function focusMain() {
  main.value?.focus()
  main.value?.scrollIntoView({ block: 'start' })
}

// Language: ?lang=sw in the link wins, then the visitor's last choice, then their browser.
function initialLanguage() {
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (fromUrl === 'en' || fromUrl === 'sw') return fromUrl
  try {
    const saved = localStorage.getItem('lang')
    if (saved === 'en' || saved === 'sw') return saved
  } catch {
    // Storage can be blocked; fall through to the browser language.
  }
  return (navigator.language || '').toLowerCase().startsWith('sw') ? 'sw' : 'en'
}

const lang = ref(initialLanguage())
document.documentElement.lang = lang.value
const t = computed(() => copy[lang.value])

// The switch: text blurs out, the language changes, text settles back in.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const switching = ref(false)
let switchTimer = 0

function setLang(next) {
  if (next === lang.value) return
  const apply = () => {
    lang.value = next
    document.documentElement.lang = next
    try {
      localStorage.setItem('lang', next)
    } catch {
      // Not saved; the choice still applies to this visit.
    }
  }
  if (reducedMotion.matches) return apply()
  clearTimeout(switchTimer)
  switching.value = true
  switchTimer = setTimeout(() => {
    apply()
    requestAnimationFrame(() => {
      switching.value = false
    })
  }, 170)
}

const baseTitle = document.title
watch(
  [() => route.value.page, () => route.value.sub, t],
  ([page, sub]) => {
    const essay = page === 'writing' && essays.find((item) => item.slug === sub)
    const name = essay ? essay.title : t.value.nav[page]
    document.title = page === 'home' ? baseTitle : `${name} · ${profile.name}`
  },
  { immediate: true },
)

onMounted(() => window.addEventListener('hashchange', onHashChange))
onBeforeUnmount(() => {
  window.removeEventListener('hashchange', onHashChange)
  clearTimeout(switchTimer)
})
</script>

<style scoped>
.skip {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 30;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background: var(--ink);
  color: var(--bg);
  text-decoration: none;
  transform: translateY(-200%);
}

.skip:focus {
  transform: none;
}

/* The page always fills the screen, so short pages keep the footer at the bottom. */
.page {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  max-width: calc(var(--wide) + var(--gutter) * 2);
  margin: 0 auto;
  padding: 1.25rem var(--gutter) 0; /* the grass sits right on the bottom edge */
}

/* Dark theme: light from the portrait's colours, the sky and the palms at the top,
   the warm shirt near the bottom. */
:root[data-theme='dark'] .page::before,
:root[data-theme='dark'] .page::after {
  content: '';
  position: absolute;
  left: 50%;
  z-index: -1;
  width: 100vw;
  translate: -50% 0;
  pointer-events: none;
}

:root[data-theme='dark'] .page::before {
  top: 0;
  height: min(120rem, 100%); /* never taller than the page itself */
  background:
    radial-gradient(46rem 32rem at 20% 8%, rgb(5 161 242 / 0.26), transparent 70%),
    radial-gradient(40rem 30rem at 85% 20%, rgb(97 140 102 / 0.26), transparent 70%),
    radial-gradient(30rem 22rem at 55% 42%, rgb(31 180 200 / 0.12), transparent 70%),
    radial-gradient(44rem 28rem at 8% 70%, rgb(5 161 242 / 0.12), transparent 70%),
    radial-gradient(36rem 26rem at 92% 88%, rgb(97 140 102 / 0.14), transparent 70%);
}

:root[data-theme='dark'] .page::after {
  bottom: 0;
  height: min(44rem, 100%);
  background: radial-gradient(46rem 26rem at 50% 100%, rgb(214 116 66 / 0.2), transparent 72%);
}

main {
  flex: 1 0 auto;
  margin-top: clamp(2.5rem, 5vw, 3.5rem);
  outline: none;
}

/* Name top left, language and theme top right, level with the menu. */
.identity,
.tools {
  position: absolute;
  top: 1.5rem;
  z-index: 21;
  display: flex;
  align-items: center;
}

.identity {
  left: var(--gutter);
  gap: 0.625rem;
  min-height: 2.75rem;
  font-weight: 600;
  text-decoration: none;
}

.identity img {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  object-fit: cover;
}

.tools {
  right: var(--gutter);
  gap: 0.25rem;
}

.lang {
  display: flex;
}

/* Small phones: a slimmer top bar, so the name stays on one line. */
@media (max-width: 30rem) {
  .identity {
    gap: 0.5rem;
    white-space: nowrap;
  }

  .tools {
    gap: 0;
  }

  .lang-option {
    min-width: 2.375rem;
  }
}

.lang-option {
  min-width: 2.75rem;
  min-height: 2.75rem;
  padding: 0 0.25rem;
  border: 0;
  background: none;
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: color 0.2s ease;
}

.lang-option:hover {
  color: var(--ink);
}

.lang-option[aria-pressed='true'] {
  color: var(--ink);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.35em;
}

/* Under 66rem the name and tools sit in a row above the menu. */
@media (max-width: 66rem) {
  .page {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: auto auto 1fr auto;
    align-items: center;
  }

  .identity,
  .tools {
    position: static;
    grid-row: 1;
  }

  .tools {
    grid-column: 2;
    margin-right: -0.5rem;
  }

  .page > .nav,
  main,
  .footer {
    grid-column: 1 / -1;
  }

  .page > .nav {
    grid-row: 2;
    margin-top: 0.75rem;
  }

  main {
    grid-row: 3;
    align-self: start;
  }

  .footer {
    grid-row: 4;
  }

  main {
    margin-top: 1.5rem;
  }
}


/* Between pages: out with a blur, in from just below. */
.page-enter-active {
  transition:
    opacity 0.5s var(--ease-out),
    transform 0.6s var(--ease-out),
    filter 0.5s var(--ease-out);
}

.page-leave-active {
  transition:
    opacity 0.18s var(--ease-in),
    filter 0.18s var(--ease-in);
}

.page-enter-from {
  opacity: 0;
  transform: translate3d(0, 1rem, 0);
  filter: blur(8px);
}

.page-leave-to {
  opacity: 0;
  filter: blur(8px);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-from {
    transform: none;
    filter: none;
  }

  .page-leave-to {
    filter: none;
  }
}
</style>

<style>
/* Language switch: every translatable piece of text blurs out and back in. */
.swap {
  transition:
    opacity 0.4s var(--ease-out),
    filter 0.4s var(--ease-out);
}

.is-switching .swap {
  opacity: 0;
  filter: blur(6px);
  transition:
    opacity 0.16s var(--ease-in),
    filter 0.16s var(--ease-in);
}

@media (prefers-reduced-motion: reduce) {
  .is-switching .swap {
    filter: none;
  }
}
</style>
