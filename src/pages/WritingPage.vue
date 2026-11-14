<template>
  <!-- One essay -->
  <article v-if="essay" class="essay">
    <div class="progress" aria-hidden="true"><span :style="{ transform: `scaleX(${progress})` }"></span></div>

    <!-- On wide screens: the contents stay at the left, halfway down, while you read. -->
    <nav class="toc" :class="{ shown: tocShown }" :aria-label="t.writingContents">
      <p class="toc-title swap" aria-hidden="true">{{ t.writingContents }}</p>
      <div class="toc-rail">
        <span class="toc-marker" :style="marker" aria-hidden="true"></span>
        <ol>
          <li v-for="(item, i) in contents" :key="item.id">
            <button
              :ref="(el) => (tocButtons[i] = el)"
              type="button"
              class="toc-link"
              :class="{ active: i === active, swap: !i }"
              :aria-current="i === active ? 'location' : null"
              :lang="i ? 'en' : null"
              @click="jump(item)"
            >
              {{ i ? item.text : t.writingIntro }}
            </button>
          </li>
        </ol>
      </div>
    </nav>

    <a class="back swap reveal" :style="{ '--i': 0 }" href="#/writing"><span class="back-arrow"><ArrowIcon /></span>{{ t.writingAll }}</a>

    <header class="card head reveal" :class="toneClass(essay)" :style="{ '--i': 1 }">
      <h1 class="title" lang="en" tabindex="-1" data-page-title>{{ essay.title }}</h1>
      <p class="dek" lang="en">{{ essay.dek }}</p>
      <p class="byline swap">
        <span class="nowrap">{{ t.writingTopics[essay.topic] }}</span><span aria-hidden="true"> · </span
        ><span class="nowrap">{{ t.writingBy }} {{ profile.name }}</span><span aria-hidden="true"> · </span
        ><span class="nowrap">{{ dated(essay) }}</span><span aria-hidden="true"> · </span
        ><span class="nowrap">{{ minutes(essay) }}</span>
      </p>
    </header>

    <figure class="hero reveal" :class="{ tall: essay.image.h > essay.image.w }" :style="{ '--i': 2 }">
      <img
        :src="essay.image.src"
        :srcset="srcset(essay.image)"
        sizes="(min-width: 48rem) 46rem, 100vw"
        :width="essay.image.w"
        :height="essay.image.h"
        :alt="essay.image.alt"
        :style="{ objectPosition: essay.image.focus }"
        fetchpriority="high"
        decoding="async"
      />
      <figcaption class="credit">
        <span class="swap">{{ essay.image.painting ? t.writingPainting : t.writingPhoto }}</span>:
        <a :href="essay.image.page" target="_blank" rel="noopener">{{ essay.image.by }}</a>,
        <a v-if="essay.image.licenseUrl" :href="essay.image.licenseUrl" target="_blank" rel="noopener">{{ essay.image.license }}</a
        ><template v-else>{{ essay.image.license }}</template>
      </figcaption>
    </figure>

    <!-- Smaller screens: the same contents, folded, before the text. -->
    <details ref="foldedToc" class="toc-folded reveal" :style="{ '--i': 3 }">
      <summary class="swap">{{ t.writingContents }}</summary>
      <ol>
        <li v-for="(item, i) in contents" :key="item.id">
          <button type="button" :class="{ swap: !i }" :lang="i ? 'en' : null" @click="jump(item, true)">
            {{ i ? item.text : t.writingIntro }}
          </button>
        </li>
      </ol>
    </details>

    <div ref="prose" class="prose reveal" :style="{ '--i': 4 }" lang="en">
      <template v-for="(block, n) in essay.body" :key="n">
        <p v-if="typeof block === 'string'" :class="{ lede: n === 0 }"><Inline :text="block" /></p>
        <h2 v-else-if="block.h" :id="anchor(block.h)" tabindex="-1">{{ block.h }}</h2>
        <figure v-else-if="block.q" class="quote">
          <blockquote><p>{{ block.q }}</p></blockquote>
          <figcaption><Inline :text="block.by" /></figcaption>
        </figure>
        <ul v-else-if="block.list">
          <li v-for="item in block.list" :key="item"><Inline :text="item" /></li>
        </ul>
      </template>
    </div>

    <a class="card next" :class="toneClass(nextEssay)" :href="`#/writing/${nextEssay.slug}`">
      <div class="next-text">
        <span class="kicker swap">{{ t.writingNext }}</span>
        <span class="next-title" lang="en">{{ nextEssay.title }}</span>
        <span class="next-dek" lang="en">{{ nextEssay.dek }}</span>
      </div>
      <div class="next-shot" aria-hidden="true">
        <img :src="nextEssay.image.small" alt="" :style="{ objectPosition: nextEssay.image.focus }" loading="lazy" decoding="async" />
      </div>
    </a>
  </article>

  <!-- All essays -->
  <div v-else class="writing">
    <h1 class="headline swap reveal" :style="{ '--i': 1 }" tabindex="-1" data-page-title>
      <RichText :text="t.writingTitle" />
    </h1>
    <p v-if="t.writingNote" class="note swap reveal" :style="{ '--i': 1 }">{{ t.writingNote }}</p>

    <div class="filters reveal" :style="{ '--i': 2 }">
      <label class="search">
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <circle cx="8.5" cy="8.5" r="5.75" fill="none" stroke="currentColor" stroke-width="1.6" />
          <path d="m13 13 4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        <span class="visually-hidden swap">{{ t.writingSearch }}</span>
        <input v-model="state.q" type="search" :placeholder="t.writingSearch" enterkeyhint="search" autocomplete="off" spellcheck="false" />
        <button v-if="state.q" type="button" class="clear" :aria-label="t.writingClear" @click="state.q = ''">
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path d="m6 6 8 8m0-8-8 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </button>
      </label>
      <div class="topics" role="group" :aria-label="t.writingTopicsLabel">
        <button type="button" class="topic" :aria-pressed="String(!state.topic)" @click="state.topic = ''">
          <span class="swap">{{ t.writingAllTopics }}</span><span class="count">{{ essays.length }}</span>
        </button>
        <button
          v-for="topic in topics"
          :key="topic"
          type="button"
          class="topic"
          :aria-pressed="String(state.topic === topic)"
          @click="state.topic = state.topic === topic ? '' : topic"
        >
          <span class="swap">{{ t.writingTopics[topic] }}</span><span class="count">{{ counts[topic] }}</span>
        </button>
      </div>
    </div>
    <p class="visually-hidden" aria-live="polite">{{ found }}</p>

    <div v-if="!shown.length" class="card empty">
      <p class="swap">{{ t.writingNone.replace('{q}', state.q.trim()) }}</p>
      <button type="button" class="show-all swap" @click="reset">{{ t.writingShowAll }}</button>
    </div>

    <ul v-else class="shelf">
      <li v-for="(item, n) in shown" :key="item.slug" class="reveal" :class="{ lead: n === 0 || (n === shown.length - 1 && n % 2 === 1) }" :style="{ '--i': n + 3 }">
        <a class="card entry" :class="toneClass(item)" :href="`#/writing/${item.slug}`">
          <div class="shot" aria-hidden="true">
            <img
              :src="item.image.small"
              :srcset="srcset(item.image)"
              :sizes="n === 0 ? '(min-width: 48rem) 36rem, 100vw' : '(min-width: 48rem) 33rem, 100vw'"
              :width="item.image.w"
              :height="item.image.h"
              alt=""
              :style="{ objectPosition: item.image.focus }"
              :loading="n < 3 ? 'eager' : 'lazy'"
              decoding="async"
            />
          </div>
          <div class="entry-text">
            <h2 class="entry-title" lang="en">{{ item.title }}</h2>
            <p class="entry-dek" lang="en">{{ item.dek }}</p>
            <span class="entry-meta swap">{{ t.writingTopics[item.topic] }}<span aria-hidden="true">·</span>{{ minutes(item) }}<ArrowIcon /></span>
          </div>
        </a>
      </li>
    </ul>
    <p class="photos swap">{{ t.writingPhotos }}</p>
  </div>
</template>

<script>
import { reactive } from 'vue'

// What the reader searched for and picked stays put while they read an essay and come
// back to the list.
const filters = reactive({ q: '', topic: '' })
</script>

<script setup>
import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, reactive as react, ref, watch } from 'vue'
import { copy, profile } from '../content.js'
import { essays } from '../writing.js'
import ArrowIcon from '../components/ArrowIcon.vue'
import RichText from '../components/RichText.vue'

const props = defineProps({
  lang: { type: String, required: true },
  t: { type: Object, required: true },
  focus: { type: String, default: '' },
})

// #/writing lists the essays; #/writing/<slug> opens one. The first essay gets a wide card
// (and the last, when it would otherwise sit alone in its row).
const essay = computed(() => essays.find((item) => item.slug === props.focus) || null)
const nextEssay = computed(() => essays[(essays.indexOf(essay.value) + 1) % essays.length])

// ---------- Search and topics ----------
const state = filters
const topics = [...new Set(essays.map((item) => item.topic))]
const counts = Object.fromEntries(topics.map((topic) => [topic, essays.filter((item) => item.topic === topic).length]))

// Lower case, no accents, one kind of apostrophe: so "konigsberg" finds Königsberg.
const fold = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/’/g, "'")
const searchable = essays.map((item) =>
  fold(
    [
      item.title,
      item.dek,
      copy.en.writingTopics[item.topic],
      copy.sw.writingTopics[item.topic],
      ...item.body.map((block) => (typeof block === 'string' ? block : [block.h, block.q, block.by, ...(block.list || [])].join(' '))),
    ]
      .join(' ')
      .replace(/\*/g, ''),
  ),
)

const shown = computed(() => {
  const terms = fold(state.q).split(/\s+/).filter(Boolean)
  return essays.filter(
    (item, i) => (!state.topic || item.topic === state.topic) && terms.every((term) => searchable[i].includes(term)),
  )
})
const found = computed(() => (shown.value.length === 1 ? props.t.writingOne : props.t.writingMany.replace('{n}', shown.value.length)))

function reset() {
  state.q = ''
  state.topic = ''
}

// The small picture for cards, the large one where there is room.
const srcset = (image) => `${image.small} 800w, ${image.src} ${Math.min(image.w, 1600)}w`

const toneClass = (item) => (item.tone ? `tone tone--${item.tone}` : '')

const words = (item) =>
  item.body.reduce((sum, block) => {
    const text = typeof block === 'string' ? block : [block.h, block.q, ...(block.list || [])].filter(Boolean).join(' ')
    return sum + text.split(/\s+/).length
  }, 0)
const minutes = (item) => props.t.writingMinutes.replace('{n}', Math.max(1, Math.round(words(item) / 220)))
const dated = (item) =>
  new Intl.DateTimeFormat(props.lang === 'sw' ? 'sw-TZ' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(`${item.date}T12:00:00`),
  )

// Text with **bold** and *italic* (book titles).
const Inline = defineComponent({
  props: { text: { type: String, required: true } },
  setup(inline) {
    return () =>
      inline.text
        .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
        .filter(Boolean)
        .map((part) => {
          if (part.startsWith('**')) return h('strong', part.slice(2, -2))
          if (part.startsWith('*')) return h('em', part.slice(1, -1))
          return part
        })
  },
})

// ---------- Reading ----------
// Each heading gets an id from its words, so the contents can jump to it.
const anchor = (text) =>
  `s-${fold(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}`

// The contents: the start of the essay, then each heading.
const contents = computed(() =>
  essay.value ? [{ id: 'top', text: '' }, ...essay.value.body.filter((block) => block.h).map((block) => ({ id: anchor(block.h), text: block.h }))] : [],
)

const prose = ref(null)
const foldedToc = ref(null)
const progress = ref(0)
const active = ref(0)
const tocShown = ref(false)
const tocButtons = []
const marker = react({ transform: 'translateY(0)', height: '0px' })
const calm = window.matchMedia('(prefers-reduced-motion: reduce)')
let frame = 0

// The line along the top shows how far you are; the contents mark the section you are in
// (the last heading above the upper third of the screen) and show only beside the text.
function measure() {
  frame = 0
  const box = prose.value?.getBoundingClientRect()
  if (!box) return
  const view = window.innerHeight
  progress.value = Math.min(1, Math.max(0, (view * 0.6 - box.top) / box.height))
  tocShown.value = box.top < view * 0.55 && box.bottom > view * 0.4
  let current = 0
  prose.value.querySelectorAll('h2[id]').forEach((heading, i) => {
    if (heading.getBoundingClientRect().top < view * 0.3) current = i + 1
  })
  active.value = current
}

// The marker slides to the section you are in.
function placeMarker() {
  const button = tocButtons[active.value]
  if (!button) return
  marker.transform = `translateY(${button.offsetTop}px)`
  marker.height = `${button.offsetHeight}px`
}

watch([active, () => props.lang], () => nextTick(placeMarker))

// Jump to a section: the heading lands a little below the top, clear of the menu.
function jump(item, folded = false) {
  if (folded && foldedToc.value) foldedToc.value.open = false
  requestAnimationFrame(() => {
    const target = item.id === 'top' ? prose.value : document.getElementById(item.id)
    if (!target) return
    const offset = window.matchMedia('(min-width: 40rem)').matches ? 104 : 24
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: calm.matches ? 'auto' : 'smooth' })
    if (item.id !== 'top') target.focus({ preventScroll: true })
  })
}

function onScroll() {
  if (!frame) frame = requestAnimationFrame(measure)
}

watch(essay, () => requestAnimationFrame(measure))

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  window.addEventListener('resize', placeMarker, { passive: true })
  measure()
  nextTick(placeMarker)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  window.removeEventListener('resize', placeMarker)
  cancelAnimationFrame(frame)
})
</script>

<style scoped>
/* ---------- The list ---------- */
.writing {
  max-width: 68rem;
  margin: 0 auto;
}

.headline {
  max-width: 40rem;
}

.note {
  margin: 0.75rem 0 0;
  color: var(--muted);
  font-size: 0.9375rem;
}

/* Search, then the topics. */
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.25rem;
  margin: clamp(1.5rem, 3.5vw, 2.25rem) 0 0;
}

.search {
  position: relative;
  display: flex;
  align-items: center;
  width: min(100%, 18rem);
}

.search > svg {
  position: absolute;
  left: 0.9rem;
  width: 1.05rem;
  height: 1.05rem;
  color: var(--muted);
  pointer-events: none;
}

.search input {
  width: 100%;
  height: 2.75rem;
  padding: 0 2.75rem 0 2.6rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--soft);
  color: var(--ink);
  font: inherit;
  font-size: 0.9375rem;
  -webkit-appearance: none;
  appearance: none;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.search input::placeholder {
  color: var(--muted);
}

.search input::-webkit-search-cancel-button {
  display: none;
}

.search input:focus {
  outline: none;
  border-color: var(--ink);
  background: var(--bg);
}

.clear {
  position: absolute;
  right: 0.4rem;
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
}

.clear svg {
  width: 1rem;
  height: 1rem;
}

.clear:hover {
  background: var(--pill);
  color: var(--ink);
}

.clear:focus-visible,
.topic:focus-visible,
.show-all:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}

.topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.topic {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 2.25rem;
  padding: 0 0.875rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.topic:hover {
  border-color: color-mix(in srgb, var(--ink) 30%, transparent);
  color: var(--ink);
}

.topic[aria-pressed='true'] {
  border-color: var(--ink);
  background: var(--ink);
  color: var(--bg);
}

.count {
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  opacity: 0.55;
}

@media (max-width: 40rem) {
  .search {
    width: 100%;
  }
}

.empty {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: clamp(1.75rem, 4vw, 2.75rem) 0 0;
}

.empty p {
  margin: 0;
  font-size: 1.0625rem;
}

.show-all {
  height: 2.5rem;
  padding: 0 1.125rem;
  border: 0;
  border-radius: 999px;
  background: var(--ink);
  color: var(--bg);
  font: inherit;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
}

.shelf {
  display: grid;
  gap: var(--gap);
  margin: clamp(1.5rem, 3.5vw, 2.25rem) 0 0;
  padding: 0;
  list-style: none;
}

@media (min-width: 48rem) {
  .shelf {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .shelf .lead {
    grid-column: 1 / -1;
  }
}

.photos {
  margin: 1.25rem 0 0;
  color: var(--muted);
  font-size: 0.8125rem;
}

.shelf li {
  display: grid;
}

.entry {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.625rem;
  color: inherit;
  text-decoration: none;
  transition: transform 0.35s var(--ease-out);
}

/* The photo sits inside the card, a little in from its edges. */
.shot {
  overflow: hidden;
  aspect-ratio: 16 / 10;
  border-radius: calc(var(--radius) - 0.625rem);
  background: color-mix(in srgb, currentColor 8%, transparent);
}

.shot img,
.next-shot img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s var(--ease-out);
}

.entry:hover .shot img,
.next:hover .next-shot img {
  transform: scale(1.035);
}

.entry-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.625rem;
  padding: calc(var(--pad) - 0.625rem);
}

.entry:hover {
  transform: translateY(-0.1875rem);
}

.entry:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}

.entry-title {
  max-width: 30rem;
  margin: 0;
  font-size: clamp(1.5rem, 1.2rem + 1vw, 2rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

@media (min-width: 48rem) {
  .lead .entry {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
    min-height: clamp(22rem, 34vw, 28rem);
  }

  .lead .shot {
    order: 2;
    aspect-ratio: auto;
  }

  /* The last essay, when it would sit alone, is wide too, with its photo on the left. */
  .lead:last-child .shot {
    order: 0;
  }
}

.lead .entry-title {
  max-width: 44rem;
  font-size: clamp(1.875rem, 1.2rem + 2vw, 2.75rem);
  letter-spacing: -0.035em;
}

.entry-dek {
  max-width: 34rem;
  margin: 0;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.5;
  text-wrap: pretty;
}

.entry-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: auto;
  padding-top: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

/* ---------- Shared ---------- */
.kicker {
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

/* Tinted cards take the games' old colours: sand, palm and sky. */
.tone--sand {
  --tone-bg: var(--sand-bg);
  --tone-ink: var(--sand-ink);
}

.tone--palm {
  --tone-bg: var(--palm-bg);
  --tone-ink: var(--palm-ink);
}

.tone--sky {
  --tone-bg: var(--sky-bg);
  --tone-ink: var(--sky-ink);
}

.tone {
  background: var(--tone-bg);
  color: var(--tone-ink);
}

.tone .kicker,
.tone .entry-dek,
.tone .entry-meta,
.tone .dek,
.tone .byline,
.tone .next-dek {
  color: color-mix(in srgb, var(--tone-ink) 72%, var(--tone-bg));
}

/* ---------- One essay ---------- */
.essay {
  max-width: 46rem;
  margin: 0 auto;
}

.progress {
  position: fixed;
  inset: 0 0 auto;
  z-index: 60;
  height: 3px;
  pointer-events: none;
}

.progress span {
  display: block;
  height: 100%;
  background: var(--ink);
  transform-origin: 0 50%;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: var(--muted);
  font-size: 0.9375rem;
  font-weight: 500;
  text-decoration: none;
}

.back:hover {
  color: var(--ink);
}

.back-arrow {
  display: inline-flex;
  transform: rotate(-135deg);
}

.head {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: clamp(1.5rem, 4vw, 2.75rem);
}

.title {
  margin: 0.5rem 0 0;
  font-size: clamp(2.25rem, 1.4rem + 3.4vw, 3.75rem);
  font-weight: 600;
  line-height: 1.02;
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.title:focus {
  outline: none;
}

.dek {
  max-width: 34rem;
  margin: 0;
  color: var(--muted);
  font-size: clamp(1.125rem, 1rem + 0.4vw, 1.3125rem);
  line-height: 1.45;
  text-wrap: pretty;
}

.hero {
  margin: var(--gap) 0 0;
}

.hero img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(--radius);
  background: var(--soft);
}

/* A portrait (a painting) stands upright and framed, instead of being cropped wide. */
.hero.tall img {
  width: min(100%, 24rem);
  margin-inline: auto;
  aspect-ratio: 4 / 5;
  object-position: 50% 40% !important;
}

.hero.tall .credit {
  padding: 0;
  text-align: center;
}

.credit {
  margin-top: 0.625rem;
  padding: 0 clamp(1.5rem, 4vw, 2.75rem);
  color: var(--muted);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.credit a {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, currentColor 40%, transparent);
  text-underline-offset: 0.15em;
}

.credit a:hover {
  color: var(--ink);
}

.byline {
  margin: 0.5rem 0 0;
  color: var(--muted);
  font-size: 0.875rem;
}

.nowrap {
  white-space: nowrap;
}

/* ---------- Contents ---------- */
/* Wide screens: fixed at the left of the text, halfway down the screen. It appears once
   the text reaches the middle of the screen and leaves when the text does. */
.toc {
  display: none;
}

@media (min-width: 82rem) {
  .toc {
    position: fixed;
    top: 50%;
    left: max(var(--gutter), calc(50% - 23rem - 16rem));
    z-index: 20;
    display: block;
    width: 13rem;
    opacity: 0;
    pointer-events: none;
    transform: translate3d(-0.5rem, -50%, 0);
    transition:
      opacity 0.4s var(--ease-out),
      transform 0.5s var(--ease-out);
  }

  .toc.shown,
  .toc:focus-within {
    opacity: 1;
    pointer-events: auto;
    transform: translate3d(0, -50%, 0);
  }

  .toc-folded {
    display: none;
  }
}

.toc-title {
  margin: 0 0 0.875rem;
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.toc-rail {
  position: relative;
  padding-left: 1rem;
  border-left: 1px solid var(--line);
}

/* The marker on the rail slides to the section you are reading. */
.toc-marker {
  position: absolute;
  top: 0;
  left: -1px;
  width: 2px;
  border-radius: 2px;
  background: var(--ink);
  transition:
    transform 0.45s var(--ease-out),
    height 0.45s var(--ease-out);
}

.toc ol,
.toc-folded ol {
  display: grid;
  gap: 0.125rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.toc-link,
.toc-folded button {
  display: block;
  width: 100%;
  padding: 0.375rem 0;
  border: 0;
  background: none;
  color: var(--muted);
  font: inherit;
  font-size: 0.875rem;
  line-height: 1.35;
  text-align: left;
  cursor: pointer;
  transition: color 0.25s ease;
}

.toc-link:hover,
.toc-folded button:hover,
.toc-link.active {
  color: var(--ink);
}

.toc-link.active {
  font-weight: 500;
}

.toc-link:focus-visible,
.toc-folded button:focus-visible,
.toc-folded summary:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
  border-radius: 0.25rem;
}

/* Smaller screens: folded into a box before the text. */
.toc-folded {
  margin: clamp(1.75rem, 4vw, 2.25rem) clamp(1.5rem, 4vw, 2.75rem) 0;
  border: 1px solid var(--line);
  border-radius: 1rem;
}

.toc-folded summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  font-size: 0.9375rem;
  font-weight: 500;
  list-style: none;
  cursor: pointer;
}

.toc-folded summary::-webkit-details-marker {
  display: none;
}

.toc-folded summary::after {
  content: '';
  width: 0.45rem;
  height: 0.45rem;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: translateY(-2px) rotate(45deg);
  transition: transform 0.25s ease;
}

.toc-folded[open] summary::after {
  transform: translateY(2px) rotate(-135deg);
}

.toc-folded ol {
  padding: 0 1rem 0.75rem;
}

.toc-folded button {
  font-size: 0.9375rem;
}

/* The text: a calm reading column, lined up with the card's text above. */
.prose {
  padding: clamp(2rem, 5vw, 3rem) clamp(1.5rem, 4vw, 2.75rem) 0;
  font-size: clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem);
  line-height: 1.72;
  text-wrap: pretty;
}

.prose p {
  margin: 0 0 1.15em;
}

.prose .lede {
  font-size: 1.15em;
  line-height: 1.6;
}

.prose h2 {
  scroll-margin-top: 6.5rem;
  margin: 2.2em 0 0.6em;
  font-size: 1.375rem;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.prose strong {
  font-weight: 650;
}

.prose em {
  font-style: italic;
}

.prose ul {
  margin: 0 0 1.4em;
  padding-left: 1.25em;
}

.prose li {
  margin-bottom: 0.5em;
  padding-left: 0.25em;
}

.prose li::marker {
  color: var(--faint);
}

.quote {
  margin: 2em 0;
  padding-left: 1.25rem;
  border-left: 3px solid var(--ink);
}

.quote blockquote {
  margin: 0;
}

.quote blockquote p {
  margin: 0;
  font-size: 1.3em;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.015em;
}

.quote figcaption {
  margin-top: 0.75rem;
  color: var(--muted);
  font-size: 0.875rem;
}

.next {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1.25rem;
  align-items: center;
  margin-top: clamp(2.5rem, 6vw, 4rem);
  color: inherit;
  text-decoration: none;
  transition: transform 0.35s var(--ease-out);
}

.next-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.next-shot {
  width: clamp(5rem, 14vw, 7.5rem);
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: calc(var(--radius) * 0.6);
}

.next:hover {
  transform: translateY(-0.1875rem);
}

.next:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}

.next-title {
  font-size: clamp(1.375rem, 1.1rem + 1vw, 1.75rem);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.025em;
}

.next-dek {
  color: var(--muted);
  font-size: 0.9375rem;
  line-height: 1.5;
}


.prose h2:focus {
  outline: none;
}

@media (prefers-reduced-motion: reduce) {
  .entry,
  .next,
  .toc,
  .toc-marker {
    transition: none;
  }

  .entry:hover,
  .next:hover,
  .entry:hover .shot img,
  .next:hover .next-shot img {
    transform: none;
  }
}
</style>
