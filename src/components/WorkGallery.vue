<template>
  <div class="gallery">
    <article
      v-for="project in projects"
      :id="project.id"
      :key="project.id"
      :ref="(el) => register(el, project.id)"
      class="piece"
      :class="{ armed: armed.has(project.id), shown: shown.has(project.id) }"
      :aria-labelledby="`${project.id}-name`"
    >
      <div
        class="frame"
        :class="`frame--${project.layout}`"
        :style="project.tint ? { '--tint': project.tint } : null"
      >
        <img
          v-for="(image, n) in project.images"
          :key="image.src"
          class="shot"
          :src="image.src"
          :width="image.w"
          :height="image.h"
          :alt="image.alt[lang]"
          :style="{ '--j': n }"
          loading="lazy"
          decoding="async"
        />
        <!-- The same website on a phone, standing in front of the desktop one. -->
        <img
          v-if="project.phone"
          class="phone"
          :src="project.phone.src"
          :width="project.phone.w"
          :height="project.phone.h"
          :alt="project.phone.alt[lang]"
          :style="{ '--j': project.images.length }"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div class="caption">
        <h2 :id="`${project.id}-name`" class="name">
          {{ project.name }}<span class="type swap">{{ project.type[lang] }}</span>
        </h2>
        <div class="about">
          <p v-if="project.pitch" class="pitch swap">{{ project.pitch[lang] }}</p>
          <p class="summary swap">{{ project.summary[lang] }}</p>

          <template v-if="project.wins?.[lang]?.length">
            <!-- On phones the list folds away behind its title, so the page stays short. -->
            <h3 class="tag wins-title swap">
              <button
                v-if="narrow"
                type="button"
                class="wins-toggle"
                :aria-expanded="String(open.has(project.id))"
                :aria-controls="`${project.id}-wins`"
                @click="toggle(project.id)"
              >
                {{ t.winsTitle }}<span class="wins-count">{{ project.wins[lang].length }}</span
                ><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" /></svg>
              </button>
              <template v-else>{{ t.winsTitle }}</template>
            </h3>
            <div :id="`${project.id}-wins`" class="wins-fold" :class="{ open: !narrow || open.has(project.id) }">
              <ul class="wins">
                <li v-for="win in project.wins[lang]" :key="win" class="swap">
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="8.25" /><path d="M5.5 9.25 7.75 11.5 12.5 6.5" /></svg>
                  <span>{{ win }}</span>
                </li>
              </ul>
            </div>
          </template>

          <LeagueDemo v-if="project.demo" :t="t" />

          <p class="meta">
            <span v-if="project.status[lang]" class="swap">{{ project.status[lang] }}</span>
            <a v-if="project.url" :href="project.url" target="_blank" rel="noopener noreferrer"
              ><span v-if="project.linkLabel" class="swap">{{ project.linkLabel[lang] }}</span
              ><template v-else><span class="swap">{{ t.visit }}</span> {{ hostOf(project.url) }}</template
              ><span class="visually-hidden"> ({{ t.opensNewTab }})</span><ArrowIcon class="arrow"
            /></a>
          </p>

          <a v-if="project.ask && whatsapp" class="button like" :href="ask(project)" target="_blank" rel="noopener noreferrer"
            ><span class="swap">{{ t.likeThis }}</span><span class="visually-hidden"> ({{ t.opensNewTab }})</span><ArrowIcon
          /></a>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { profile } from '../content.js'
import ArrowIcon from './ArrowIcon.vue'
import LeagueDemo from './LeagueDemo.vue'

const props = defineProps({
  projects: { type: Array, required: true },
  lang: { type: String, required: true },
  t: { type: Object, required: true },
  focus: { type: String, default: '' }, // a project id to land on
})

const hostOf = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

// "Want one like this?" opens WhatsApp with a message about this project, ready to send.
const whatsapp = profile.links.whatsapp.replace(/\D/g, '')
const ask = (project) => `https://wa.me/${whatsapp}?text=${encodeURIComponent(project.ask[props.lang])}`

// Phones fold each project's list of advantages; a tap opens it.
const phoneQuery = window.matchMedia('(max-width: 40rem)')
const narrow = ref(phoneQuery.matches)
const onQuery = (event) => (narrow.value = event.matches)
const open = reactive(new Set())
const toggle = (id) => (open.has(id) ? open.delete(id) : open.add(id))

// Each piece below the fold develops into view once, as it scrolls in.
// Pieces start fully visible; only JavaScript with motion allowed arms them.
const elements = new Map()
const armed = reactive(new Set())
const shown = reactive(new Set())
let observer = null

function register(el, id) {
  if (el) elements.set(id, el)
  else elements.delete(id)
}

onMounted(() => {
  phoneQuery.addEventListener('change', onQuery)
  const target = props.focus
  const linked = props.projects.some((project) => project.id === target)

  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!calm && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          shown.add(entry.target.id)
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    )
    for (const [id, el] of elements) {
      if (linked || el.getBoundingClientRect().top < window.innerHeight) continue
      armed.add(id)
      observer.observe(el)
    }
  }

  // A link like #/work/ligiplay lands on that project.
  if (linked) elements.get(target)?.scrollIntoView({ block: 'start', behavior: 'instant' })
})

onBeforeUnmount(() => {
  observer?.disconnect()
  phoneQuery.removeEventListener('change', onQuery)
})
</script>

<style scoped>
.gallery {
  display: grid;
  gap: clamp(3.5rem, 8vw, 6rem);
}

/* Clear of the sticky menu on wide screens; it sits at the bottom on phones. */
.piece {
  scroll-margin-top: 6.5rem;
}

@media (max-width: 40rem) {
  .piece {
    scroll-margin-top: 1.25rem;
  }
}

/* The frame: a coloured ground the work sits on. */
.frame {
  --radius: clamp(0.875rem, 1.6vw, 1.375rem);
  position: relative;
  overflow: hidden;
  border-radius: var(--radius);
  background: var(--tint, var(--soft));
}

/* App screens: four panels in a row, scrolling sideways on small screens. */
.frame--phones {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: clamp(0.75rem, 2.4vw, 2rem);
  padding: clamp(1.5rem, 5vw, 3.75rem) clamp(1.5rem, 6vw, 4.5rem);
}

@media (max-width: 40rem) {
  .frame--phones {
    grid-auto-columns: 62%;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 1.5rem;
    scrollbar-width: none;
  }

  .frame--phones::-webkit-scrollbar {
    display: none;
  }

  .frame--phones img {
    scroll-snap-align: start;
  }
}

/* A website rises from the bottom edge of its frame. */
.frame--browser {
  aspect-ratio: 16 / 9;
  padding: clamp(1.25rem, 5.5vw, 4rem) clamp(1.25rem, 5.5vw, 4rem) 0;
}

.frame--browser .shot {
  width: 100%;
  border-radius: 0.625rem 0.625rem 0 0;
  box-shadow:
    0 0 0 1px rgb(0 0 0 / 0.07),
    0 1.5rem 3rem -1.25rem rgb(0 0 0 / 0.4);
}

/* The phone: in front, on the right, rising from the bottom edge like the browser. */
.phone {
  position: absolute;
  right: 5%;
  bottom: -14%;
  z-index: 1;
  width: 21%;
  border: clamp(0.25rem, 0.5vw, 0.4rem) solid #111;
  border-radius: clamp(1rem, 2.2vw, 1.75rem);
  background: #111;
  box-shadow: 0 1.75rem 3rem -1rem rgb(0 0 0 / 0.5);
}

/* Phones: a taller frame, the desktop page larger and cropped on the right, and
   the phone big enough to read. */
@media (max-width: 40rem) {
  .frame--browser {
    aspect-ratio: 1 / 1.02;
    padding: 1.25rem 0 0 1.25rem;
  }

  .frame--browser .shot {
    width: 150%;
    max-width: none;
  }

  .phone {
    right: 6%;
    bottom: -12%;
    width: 44%;
  }
}

/* A logo banner sits in its own colour. */
.frame--banner {
  display: grid;
  place-items: center;
  aspect-ratio: 12 / 5;
  padding: clamp(2rem, 8vw, 6.5rem);
}

.frame--banner img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Caption: name on the left, what it is on the right. */
.caption {
  display: grid;
  gap: 0.375rem;
  margin-top: 1.125rem;
}

@media (min-width: 48rem) {
  .caption {
    grid-template-columns: 14rem minmax(0, 1fr);
    gap: 1.5rem;
  }
}

.name {
  display: flex;
  flex-direction: column;
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 600;
  line-height: 1.45;
}

.type {
  color: var(--muted);
  font-weight: 400;
}

.pitch {
  max-width: 34rem;
  margin: 0 0 0.75rem;
  font-size: clamp(1.375rem, 1.1rem + 1vw, 1.875rem);
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.025em;
  text-wrap: balance;
}

.summary {
  max-width: 36rem;
  margin: 0;
  color: var(--muted);
}

.wins-title {
  margin: 1.5rem 0 0.75rem;
}

.wins-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  margin: -0.75rem 0 -0.75rem;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.wins-count {
  display: inline-grid;
  place-items: center;
  min-width: 1.375rem;
  height: 1.375rem;
  padding: 0 0.375rem;
  border-radius: 999px;
  background: var(--soft);
  color: var(--ink);
  font-size: 0.75rem;
  letter-spacing: 0;
}

.wins-toggle svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.35s var(--ease-out);
}

.wins-toggle[aria-expanded='true'] svg {
  transform: rotate(180deg);
}

/* Folding: the list's row grows from nothing to its full height. */
.wins-fold {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.45s var(--ease-out);
}

.wins-fold.open {
  grid-template-rows: 1fr;
}

.wins-fold > .wins {
  min-height: 0;
  overflow: hidden;
}

/* Folded away, it is hidden from screen readers too (after the fold has closed). */
.wins-fold:not(.open) > .wins {
  visibility: hidden;
  transition: visibility 0s 0.45s;
}

@media (prefers-reduced-motion: reduce) {
  .wins-fold {
    transition: none;
  }
}

/* What it does for you: ticks, two columns where there is room. */
.wins {
  display: grid;
  gap: 0.625rem 1.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

@media (min-width: 60rem) {
  .wins {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.wins li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.625rem;
  align-items: start;
  line-height: 1.45;
}

.wins svg {
  margin-top: 0.15rem;
}

.wins circle {
  fill: var(--sky);
}

.wins path {
  fill: none;
  stroke: #fff;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.like {
  margin-top: 1.25rem;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 1.25rem;
  margin: 1.25rem 0 0;
  font-size: 0.9375rem;
}

.meta > span {
  color: var(--muted);
}

.meta a {
  display: inline-block;
  padding: 0.5rem 0;
  margin: -0.5rem 0;
}

.arrow {
  display: inline-block;
  margin-left: 0.375rem;
  vertical-align: 0.05em;
}

/* Developing into view: the frame opens out, then the work settles in. */
@media (prefers-reduced-motion: no-preference) {
  .armed .frame {
    clip-path: inset(7% 4% 0 4% round var(--radius));
  }

  .armed .frame img {
    opacity: 0;
    transform: translate3d(0, 2.5rem, 0);
    filter: blur(10px);
  }

  .armed .caption {
    opacity: 0;
    transform: translate3d(0, 0.75rem, 0);
  }

  .armed.shown .frame {
    clip-path: inset(0 0 0 0 round var(--radius));
    transition: clip-path 1.1s var(--ease-out);
  }

  .armed.shown .frame img {
    opacity: 1;
    transform: none;
    filter: blur(0);
    transition:
      opacity 0.9s var(--ease-out),
      transform 1.1s var(--ease-out),
      filter 0.9s var(--ease-out);
    transition-delay: calc(var(--j, 0) * 90ms + 120ms);
  }

  .armed.shown .caption {
    opacity: 1;
    transform: none;
    transition:
      opacity 0.8s var(--ease-out) 0.3s,
      transform 0.9s var(--ease-out) 0.3s;
  }
}
</style>
