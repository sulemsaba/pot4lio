<template>
  <a class="skip" href="#main">{{ t.skip }}</a>

  <div class="page" :class="{ 'is-switching': switching }">
    <header class="masthead">
      <div class="who reveal" :style="{ '--i': 0 }">
        <h1 class="name">{{ profile.name }}</h1>
        <p class="role swap">{{ t.role }}</p>
      </div>

      <div class="tools reveal" :style="{ '--i': 1 }">
        <p v-if="time" class="clock">
          <time :aria-label="`${t.localTime}: ${time}`">{{ time }}</time>
          <span aria-hidden="true">EAT</span>
        </p>
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
      </div>
    </header>

    <main id="main">
      <section class="intro">
        <p class="statement swap reveal" :style="{ '--i': 2 }">{{ t.statement }}</p>
        <p class="lede swap reveal" :style="{ '--i': 3 }">{{ t.intro }}</p>
        <p class="now swap reveal" :style="{ '--i': 4 }">{{ t.now }}</p>
        <p class="actions reveal" :style="{ '--i': 4 }">
          <a href="#contact" class="swap">{{ t.getInTouch }}</a>
          <a v-if="profile.links.cv" :href="profile.links.cv" download class="swap">{{ t.downloadCv }}</a>
        </p>
      </section>

      <section class="block" aria-labelledby="work-heading">
        <h2 id="work-heading" class="label swap reveal" :style="{ '--i': 5 }">{{ t.work }}</h2>
        <div class="reveal" :style="{ '--i': 6 }">
          <ProjectList :projects="projects" :lang="lang" :t="t" />
          <p class="note swap">{{ t.privateWork }}</p>
        </div>
      </section>

      <section class="block" aria-labelledby="experience-heading">
        <h2 id="experience-heading" class="label swap">{{ t.experience }}</h2>
        <ol class="rows">
          <li v-for="job in experience" :key="job.org" class="row">
            <span class="row-main">{{ job.org }}</span>
            <span v-if="job.role[lang]" class="row-sub swap">{{ job.role[lang] }}</span>
            <span class="row-date swap">{{ job.period[lang] }}</span>
            <span v-if="job.summary" class="row-note swap">{{ job.summary[lang] }}</span>
          </li>
        </ol>
      </section>

      <section class="block" aria-labelledby="skills-heading">
        <h2 id="skills-heading" class="label swap">{{ t.skills }}</h2>
        <ul class="rows">
          <li v-for="skill in skills" :key="skill.name.en" class="row">
            <span class="row-main swap">{{ skill.name[lang] }}</span>
            <span class="row-note swap">{{ skill.items[lang] }}</span>
          </li>
        </ul>
      </section>

      <section class="block" aria-labelledby="education-heading">
        <h2 id="education-heading" class="label swap">{{ t.education }}</h2>
        <ul class="rows">
          <li v-for="school in education" :key="school.org" class="row">
            <span class="row-main">{{ school.org }}</span>
            <span class="row-sub swap">{{ school.detail[lang] }}</span>
            <span class="row-date swap">{{ school.period[lang] }}</span>
          </li>
        </ul>
      </section>

      <section class="block" aria-labelledby="certificates-heading">
        <h2 id="certificates-heading" class="label swap">{{ t.certificates }}</h2>
        <ul class="rows">
          <li v-for="cert in certificates" :key="cert.name.en" class="row">
            <span class="row-main swap">{{ cert.name[lang] }}</span>
            <span class="row-date swap">{{ cert.issuer[lang] }}</span>
          </li>
        </ul>
      </section>

      <section id="contact" class="block" aria-labelledby="contact-heading">
        <h2 id="contact-heading" class="label swap">{{ t.contact }}</h2>
        <div class="contact">
          <p class="contact-line swap">{{ t.contactLine }}</p>
          <a v-if="profile.links.email" class="contact-email" :href="`mailto:${profile.links.email}`">
            {{ profile.links.email }}
          </a>
          <ul class="contact-links">
            <li v-for="link in contactLinks" :key="link.key">
              <a
                :href="link.href"
                :target="link.external ? '_blank' : null"
                :rel="link.external ? 'noopener noreferrer' : null"
                :download="link.download ? '' : null"
              >
                <span class="swap">{{ link.label }}</span>
                <span v-if="link.external" class="visually-hidden">({{ t.opensNewTab }})</span>
                <ArrowIcon v-if="link.external" />
              </a>
            </li>
          </ul>
        </div>
      </section>
    </main>

    <footer class="footer">
      <span>© {{ year }} {{ profile.name }}</span>
      <span>{{ profile.city }}</span>
    </footer>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { certificates, copy, education, experience, profile, projects, skills } from './content.js'
import ProjectList from './components/ProjectList.vue'
import ArrowIcon from './components/ArrowIcon.vue'

const languages = [
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'sw', short: 'SW', name: 'Kiswahili' },
]

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

// Local time in Dar es Salaam, updated on the minute.
let formatter = null
try {
  formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: profile.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
} catch {
  formatter = null
}

const now = ref(new Date())
const time = computed(() => (formatter ? formatter.format(now.value) : ''))
let clockTimer = 0

onMounted(() => {
  const tick = () => {
    now.value = new Date()
    clockTimer = setTimeout(tick, 60000 - (Date.now() % 60000) + 50)
  }
  tick()
})

onBeforeUnmount(() => {
  clearTimeout(clockTimer)
  clearTimeout(switchTimer)
})

const year = new Date().getFullYear()

const contactLinks = computed(() => {
  const links = profile.links
  const list = []
  if (links.whatsapp) {
    list.push({ key: 'whatsapp', href: `https://wa.me/${links.whatsapp.replace(/\D/g, '')}`, label: t.value.whatsapp, external: true })
  }
  if (links.github) list.push({ key: 'github', href: links.github, label: t.value.github, external: true })
  if (links.linkedin) list.push({ key: 'linkedin', href: links.linkedin, label: t.value.linkedin, external: true })
  if (links.cv) list.push({ key: 'cv', href: links.cv, label: t.value.cv, external: false, download: true })
  return list
})
</script>

<style scoped>
.skip {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 30;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: var(--ink);
  color: var(--bg);
  text-decoration: none;
  transform: translateY(-200%);
}

.skip:focus {
  transform: none;
}

.page {
  max-width: calc(var(--measure) + var(--gutter) * 2);
  margin: 0 auto;
  padding: 1.75rem var(--gutter) 2.5rem;
}

/* Header */
.masthead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: -0.005em;
}

.role {
  margin: 0;
  color: var(--muted);
}

.tools {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-top: -0.6rem;
}

.clock {
  margin: 0;
  display: flex;
  gap: 0.35em;
  color: var(--muted);
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
}

/* Small phones keep the name and the language switch on one line; the clock steps out. */
@media (max-width: 30rem) {
  .clock {
    display: none;
  }
}

.lang {
  display: flex;
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

/* Intro */
.intro {
  padding-top: clamp(3.5rem, 11vh, 7rem);
}

.statement {
  max-width: 21em;
  margin: 0;
  font-size: clamp(1.625rem, 1.15rem + 1.9vw, 2.375rem);
  font-weight: 500;
  line-height: 1.16;
  letter-spacing: -0.024em;
  text-wrap: balance;
}

.lede {
  max-width: 35rem;
  margin: 1.5rem 0 0;
  color: var(--muted);
  font-size: 1.0625rem;
}

.now {
  max-width: 35rem;
  margin: 0.75rem 0 0;
  color: var(--muted);
  font-size: 1.0625rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0 1.5rem;
  margin: 0.25rem 0 0;
  font-size: 1.0625rem;
}

.actions a {
  display: inline-block;
  padding: 0.5rem 0;
  white-space: nowrap;
}

.note {
  max-width: 34rem;
  margin: 1rem 0 0;
  color: var(--muted);
  font-size: 0.875rem;
}

/* Sections with hanging labels */
.block {
  display: grid;
  gap: 0.5rem;
  margin-top: clamp(3.5rem, 9vh, 5.5rem);
}

@media (min-width: 46rem) {
  .block {
    grid-template-columns: var(--label) minmax(0, 1fr);
    gap: 0 var(--gutter);
  }
}

.label {
  margin: 0;
  padding-top: 0.75rem;
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.6;
}

@media (max-width: 45.99rem) {
  .label {
    padding-top: 0;
  }
}

/* Experience */
.rows {
  list-style: none;
  margin: 0;
  padding: 0;
}

.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  column-gap: 1rem;
  padding: 0.75rem 0;
  border-top: 1px solid var(--line);
}

.row:last-child {
  border-bottom: 1px solid var(--line);
}

.row-main {
  font-weight: 500;
}

.row-sub {
  grid-column: 1;
  color: var(--muted);
}

.row-date {
  grid-row: 1;
  grid-column: 2;
  color: var(--muted);
  font-size: 0.9375rem;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.row-note {
  grid-column: 1 / -1;
  max-width: 34rem;
  margin-top: 0.25rem;
  color: var(--muted);
  font-size: 0.9375rem;
}

/* Contact */
.contact {
  padding-top: 0.75rem;
}

@media (max-width: 45.99rem) {
  .contact {
    padding-top: 0;
  }
}

.contact-line {
  max-width: 30rem;
  margin: 0;
}

.contact-email {
  display: inline-block;
  margin-top: 0.75rem;
  font-size: clamp(1.25rem, 1rem + 1vw, 1.5rem);
  font-weight: 500;
  letter-spacing: -0.015em;
}

.contact-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0 1.5rem;
  list-style: none;
  margin: 0.5rem 0 0;
  padding: 0;
}

.contact-links a {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 2.75rem;
}

/* Footer */
.footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem 1.5rem;
  margin-top: clamp(4.5rem, 12vh, 7rem);
  padding-top: 1.25rem;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.875rem;
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
