<template>
  <div class="home">
    <!-- First screen: who, a face, the time in Dar es Salaam. -->
    <section class="top" aria-labelledby="home-title">
      <div class="card intro reveal" :style="{ '--i': 1 }">
        <h1 id="home-title" class="headline hero-title" tabindex="-1" data-page-title>
          <span class="visually-hidden">{{ profile.name }} {{ t.headBuilds }} {{ t.buildsAll }} {{ t.headWin }}</span>
          <span aria-hidden="true">
            <span class="ink">{{ profile.name }}</span>{{ ' ' }}<span class="swap">{{ t.headBuilds }}</span>
            <span class="rotor">
              <span v-if="calm" class="rot-word swap">{{ t.buildsAll }}</span>
              <Transition v-else name="rot" mode="out-in">
                <span :key="`${lang}-${wordIndex}`" class="rot-word">{{ t.builds[wordIndex % t.builds.length] }}</span>
              </Transition>
            </span>
            <span class="win swap">{{ t.headWin }}</span>
          </span>
        </h1>
        <hr class="rule" />
        <ul class="reasons">
          <li v-for="(reason, n) in t.reasons" :key="n" class="swap"><RichText :text="reason" /></li>
        </ul>
        <div class="hero-actions">
          <a class="button button--ink" href="#/work" @click.prevent="toNeeds"
            ><span class="swap">{{ t.heroCta }}</span>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 2v9.5M3 7.75 7 11.75l4-4" /></svg
          ></a>
          <a class="text-link swap" href="#/work">{{ t.heroWork }}</a>
          <a class="text-link swap" href="#/cv">{{ t.heroCv }}</a>
        </div>
      </div>

      <figure v-tilt="5" class="card photo reveal" :style="{ '--i': 2 }">
        <img :src="profile.photo" width="460" height="460" :alt="t.photoAlt" fetchpriority="high" decoding="async" />
        <figcaption class="sticker swap">{{ t.sticker }}</figcaption>
      </figure>

      <SkyCard class="reveal" :style="{ '--i': 3 }" :time-zone="profile.timeZone" :t="t" />
    </section>

    <!-- The work, one card each. -->
    <section ref="tilesEl" class="tiles-wrap" aria-labelledby="tiles-title">
      <h2 id="tiles-title" class="visually-hidden">{{ t.nav.work }}</h2>
      <ul class="tiles">
        <li v-for="(project, n) in projects" :key="project.id" class="reveal" :style="{ '--i': n + 4 }">
          <a
            v-tilt="4"
            class="card tile"
            :class="[`tile--${project.layout}`, tone(project.tint)]"
            :style="project.tint ? { '--tint': project.tint } : null"
            :href="`#/work/${project.id}`"
          >
            <span class="tile-label">
              <span class="tile-name">{{ project.name }}</span>
              <span class="tile-type swap">{{ project.type[lang] }}</span>
            </span>
            <span class="tile-visual">
              <img
                v-for="(image, k) in project.layout === 'phones' ? project.images : project.images.slice(0, 1)"
                :key="image.src"
                :class="{ on: project.layout !== 'phones' || k === screen % project.images.length }"
                :src="image.src"
                :width="image.w"
                :height="image.h"
                alt=""
                loading="lazy"
                decoding="async"
              />
            </span>
            <span class="corner" :class="{ 'corner--light': tone(project.tint) === 'on-dark' }" aria-hidden="true"><ArrowIcon /></span>
          </a>
        </li>
      </ul>
    </section>

    <!-- What the visitor's business needs, and what they get. -->
    <NeedsPicker class="block" :lang="lang" :t="t" id="home-needs" />

    <!-- A few small things. -->
    <div class="block widgets">
      <WordCard :words="swahiliWords" :t="t" />
      <GithubCard :profile="profile" :t="t" />
      <CvCard :profile="profile" :t="t" />
    </div>

    <!-- The ask: a message, straight to WhatsApp. -->
    <section class="block ask" aria-labelledby="ask-title">
      <h2 id="ask-title" class="headline swap"><RichText :text="t.ctaTitle" /></h2>
      <div class="ask-body">
        <ChatContact
          v-if="profile.links.whatsapp"
          :name="profile.name"
          :photo="profile.photo"
          :whatsapp="profile.links.whatsapp"
          :t="t"
        />
        <p v-if="profile.links.email" class="ask-email">
          <span class="swap">{{ t.orEmail }}</span>{{ ' ' }}<a :href="`mailto:${profile.links.email}`">{{ profile.links.email }}</a>
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { profile, projects, swahiliWords } from '../content.js'
import { tilt as vTilt } from '../tilt.js'
import ArrowIcon from '../components/ArrowIcon.vue'
import ChatContact from '../components/ChatContact.vue'
import CvCard from '../components/CvCard.vue'
import GithubCard from '../components/GithubCard.vue'
import NeedsPicker from '../components/NeedsPicker.vue'
import RichText from '../components/RichText.vue'
import SkyCard from '../components/SkyCard.vue'
import WordCard from '../components/WordCard.vue'

defineProps({
  lang: { type: String, required: true },
  t: { type: Object, required: true },
  focus: { type: String, default: '' },
})

const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// "Tell me what you need" goes straight to the picker further down, and puts focus on its choices.
function toNeeds() {
  const title = document.getElementById('home-needs-title')
  if (!title) return
  title.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' })
  title.closest('section')?.querySelector('[role="tab"][aria-selected="true"]')?.focus({ preventScroll: true })
}

// Two slow loops, each running only while on screen: the headline's word,
// and the LigiPlay tile turning through its screens.
const wordIndex = ref(0)
const screen = ref(0)
const tilesEl = ref(null)
let wordTimer = 0
let screenTimer = 0
let tilesVisible = false
let observer = null

function loop() {
  clearInterval(wordTimer)
  clearInterval(screenTimer)
  if (calm || document.hidden) return
  wordTimer = setInterval(() => (wordIndex.value += 1), 2600)
  if (tilesVisible) screenTimer = setInterval(() => (screen.value += 1), 2800)
}

onMounted(() => {
  if (calm) return
  if ('IntersectionObserver' in window && tilesEl.value) {
    observer = new IntersectionObserver(([entry]) => {
      tilesVisible = entry.isIntersecting
      loop()
    })
    observer.observe(tilesEl.value)
  }
  loop()
  document.addEventListener('visibilitychange', loop)
})

onBeforeUnmount(() => {
  clearInterval(wordTimer)
  clearInterval(screenTimer)
  observer?.disconnect()
  document.removeEventListener('visibilitychange', loop)
})

// Label colour on a tile: white where white text passes 4.5:1 on the tint, ink otherwise.
function tone(hex) {
  if (!hex) return ''
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const light = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return 1.05 / (light + 0.05) >= 4.5 ? 'on-dark' : 'on-bright'
}
</script>

<style scoped>
.block {
  margin-top: clamp(4.5rem, 9vw, 7rem);
}

/* First screen. Phones: intro, photo, clock, one under another.
   Wide: the intro on the left, photo and clock stacked on the right. */
.top {
  display: grid;
  gap: var(--gap);
}

@media (min-width: 48rem) {
  .top {
    grid-template-columns: minmax(0, 1.9fr) minmax(0, 1fr);
    grid-template-rows: auto auto;
  }

  .intro {
    grid-row: 1 / span 2;
  }
}

.intro {
  display: flex;
  flex-direction: column;
  padding: clamp(1.5rem, 3.2vw, 2.5rem);
}

/* The headline: the name, then what he builds, one word at a time. */
.hero-title {
  font-size: clamp(2rem, 1.4rem + 2.2vw, 3.25rem);
  line-height: 1.08;
}

.rotor {
  display: block;
  min-height: 1.08em;
}

.rot-word {
  display: inline-block;
  color: var(--ink);
  text-decoration: underline;
  text-decoration-color: var(--sky);
  text-decoration-thickness: 0.09em;
  text-underline-offset: 0.14em;
  text-decoration-skip-ink: none;
}

.rot-enter-active {
  transition:
    opacity 0.55s var(--ease-out),
    transform 0.6s var(--ease-out),
    filter 0.55s var(--ease-out);
}

.rot-leave-active {
  transition:
    opacity 0.22s var(--ease-in),
    transform 0.22s var(--ease-in),
    filter 0.22s var(--ease-in);
}

.rot-enter-from {
  opacity: 0;
  transform: translate3d(0, 0.35em, 0);
  filter: blur(8px);
}

.rot-leave-to {
  opacity: 0;
  transform: translate3d(0, -0.25em, 0);
  filter: blur(8px);
}

.rule {
  width: 100%;
  height: 1px;
  margin: clamp(1.25rem, 2.5vw, 1.75rem) 0;
  border: 0;
  background: var(--line);
}

.win {
  display: block;
}

/* Why him: each reason opens with its point in ink. */
.reasons {
  display: grid;
  gap: clamp(0.75rem, 1.5vw, 1rem);
  max-width: 38rem;
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--muted);
  font-size: clamp(1.0625rem, 0.98rem + 0.35vw, 1.1875rem);
  line-height: 1.45;
}

.reasons li {
  text-wrap: pretty;
}

.reasons :deep(strong) {
  color: var(--ink);
  font-weight: 500;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.5rem;
  margin-top: auto;
  padding-top: clamp(1.5rem, 3vw, 2.25rem);
}

.text-link {
  font-weight: 500;
}

.photo {
  margin: 0;
  padding: 0;
  overflow: hidden;
  aspect-ratio: 1;
}

/* A sticker on the photo, slightly crooked, as if pressed on by hand. */
.sticker {
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  z-index: 3;
  padding: 0.5rem 0.875rem;
  border-radius: 0.75rem;
  background: #fff;
  color: #111;
  font-size: 0.9375rem;
  font-weight: 600;
  box-shadow: 0 0.75rem 1.5rem -0.5rem rgb(0 0 0 / 0.35);
  transform: rotate(-4deg);
  transition: transform 0.5s var(--ease-out);
}

.photo:hover .sticker {
  transform: rotate(-1deg) translate3d(0, -0.2rem, 0);
}

.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* The work: four tiles, two by two on phones. */
.tiles-wrap {
  margin-top: var(--gap);
}

.tiles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--gap);
  margin: 0;
  padding: 0;
  list-style: none;
}

@media (min-width: 60rem) {
  .tiles {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .tile {
    aspect-ratio: 5 / 4;
  }
}

.tile {
  display: flex;
  flex-direction: column;
  height: 100%;
  aspect-ratio: 4 / 5;
  padding: 0;
  overflow: hidden;
  background: var(--tint, var(--soft));
  color: inherit;
  text-decoration: none;
  isolation: isolate;
}

.tile-label {
  position: absolute;
  top: 0.875rem;
  left: 1rem;
  right: 3.75rem;
  z-index: 1;
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.tile-name {
  font-size: 0.9375rem;
  font-weight: 600;
}

.tile-type {
  color: var(--muted);
  font-size: 0.8125rem;
}

.on-dark .tile-name {
  color: #fff;
}

.on-dark .tile-type {
  color: #fff;
}

.on-bright .tile-name,
.on-bright .tile-type {
  color: #111;
}

.tile-visual {
  display: flex;
  flex: 1;
  min-height: 0;
  transition: transform 0.7s var(--ease-out);
}


/* App screens: the panel's own headline and phone, from the top. */
.tile--phones .tile-visual {
  position: relative;
  margin-top: 3.5rem;
}

/* LigiPlay turns through its four screens. */
.tile--phones img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  opacity: 0;
  transform: translate3d(0, 6%, 0);
  transition:
    opacity 0.7s var(--ease-out),
    transform 0.9s var(--ease-out);
}

.tile--phones img.on {
  opacity: 1;
  transform: none;
}

/* A website rises from the bottom edge, its top in view. */
.tile--browser .tile-visual {
  align-items: flex-start;
  padding: 4.25rem 0 0 clamp(1rem, 2.4vw, 1.5rem);
}

/* Narrow tiles: a long name takes two lines, so the screenshot starts lower. */
@media (max-width: 40rem) {
  .tile--browser .tile-visual {
    padding-top: 5.25rem;
  }

  .tile-name {
    font-size: 0.875rem;
  }
}

.tile--browser img {
  width: 165%;
  max-width: none;
  transition: transform 0.9s var(--ease-out);
  border-radius: 0.5rem 0 0 0;
  box-shadow:
    0 0 0 1px rgb(0 0 0 / 0.07),
    0 1.25rem 2.5rem -1rem rgb(0 0 0 / 0.35);
}

/* A logo sits in the middle of its colour. */
.tile--banner .tile-visual {
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem 1.5rem;
}

.tile--banner img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* On hover a website slides along; the cart rolls. */
.tile--browser:hover img {
  transform: translate3d(-12%, -4%, 0);
}

@media (prefers-reduced-motion: no-preference) {
  .tile--banner:hover img {
    animation: roll 0.9s var(--ease-out);
  }
}

@keyframes roll {
  30% {
    transform: translate3d(8%, 0, 0) rotate(-3deg);
  }
  60% {
    transform: translate3d(-3%, 0, 0) rotate(1deg);
  }
}

/* Small things: three cards. */
.widgets {
  display: grid;
  gap: var(--gap);
}

.widgets > * {
  min-height: 15rem;
}

@media (min-width: 48rem) {
  .widgets {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .widgets > * {
    aspect-ratio: 5 / 4;
    min-height: 15rem;
  }
}

/* The ask: the headline, then the chat beside it on wide screens. */
.ask {
  display: grid;
  gap: clamp(1.5rem, 3vw, 2rem);
}

@media (min-width: 60rem) {
  .ask {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    align-items: start;
  }

  .ask .headline {
    font-size: clamp(2rem, 1.3rem + 1.6vw, 2.75rem);
  }
}

.ask-email {
  margin: 1rem 0 0;
  color: var(--muted);
}

.ask-email a {
  color: var(--ink);
  font-weight: 500;
  overflow-wrap: anywhere;
}
</style>
