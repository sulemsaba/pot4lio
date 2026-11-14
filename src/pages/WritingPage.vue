<template>
  <!-- One essay -->
  <article v-if="essay" class="essay">
    <div class="progress" aria-hidden="true"><span :style="{ transform: `scaleX(${progress})` }"></span></div>

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

    <div ref="prose" class="prose reveal" :style="{ '--i': 3 }" lang="en">
      <template v-for="(block, n) in essay.body" :key="n">
        <p v-if="typeof block === 'string'" :class="{ lede: n === 0 }"><Inline :text="block" /></p>
        <h2 v-else-if="block.h">{{ block.h }}</h2>
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
    <ul class="shelf">
      <li v-for="(item, n) in essays" :key="item.slug" class="reveal" :class="{ lead: n === 0 || (n === essays.length - 1 && n % 2 === 1) }" :style="{ '--i': n + 2 }">
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

<script setup>
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { profile } from '../content.js'
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

// A thin line along the top shows how far through the essay you are.
const prose = ref(null)
const progress = ref(0)
let frame = 0

function measure() {
  frame = 0
  const box = prose.value?.getBoundingClientRect()
  if (!box) return
  const read = (window.innerHeight * 0.6 - box.top) / box.height
  progress.value = Math.min(1, Math.max(0, read))
}

function onScroll() {
  if (!frame) frame = requestAnimationFrame(measure)
}

watch(essay, () => requestAnimationFrame(measure))

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  measure()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
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

.shelf {
  display: grid;
  gap: var(--gap);
  margin: clamp(1.75rem, 4vw, 2.75rem) 0 0;
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


@media (prefers-reduced-motion: reduce) {
  .entry,
  .next {
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
