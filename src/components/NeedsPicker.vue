<template>
  <section class="needs" :aria-labelledby="titleId">
    <h2 :id="titleId" class="headline swap"><RichText :text="t.needsTitle" /></h2>

    <div class="card board">
      <div class="chips" role="tablist" :aria-label="t.needsLabel" @keydown="onKey">
        <button
          v-for="(need, n) in t.needs"
          :id="`need-tab-${need.id}`"
          :key="need.id"
          :ref="(el) => (tabs[n] = el)"
          type="button"
          role="tab"
          class="chip"
          :aria-selected="String(n === active)"
          :aria-controls="`need-panel-${need.id}`"
          :tabindex="n === active ? 0 : -1"
          @click="active = n"
        >
          <span class="swap">{{ need.label }}</span>
        </button>
      </div>

      <Transition name="need" mode="out-in">
        <div
          :id="`need-panel-${current.id}`"
          :key="`${lang}-${current.id}`"
          class="panel"
          role="tabpanel"
          :aria-labelledby="`need-tab-${current.id}`"
        >
          <p class="pitch"><RichText :text="current.pitch" /></p>
          <ul class="points">
            <li v-for="(point, k) in current.points" :key="point" :style="{ '--k': k }">
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="8.25" /><path d="M5.5 9.25 7.75 11.5 12.5 6.5" /></svg>
              {{ point }}
            </li>
          </ul>
          <p class="proof"><a :href="current.proofLink">{{ current.proof }}</a></p>
          <div class="actions">
            <a class="button button--ink" :href="whatsapp(current.message)" target="_blank" rel="noopener noreferrer"
              >{{ current.cta }}<span class="visually-hidden"> ({{ t.opensNewTab }})</span><ArrowIcon
            /></a>
            <a v-if="profile.links.email" class="email" :href="mailto(current)">{{ t.needsOr }}</a>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { profile } from '../content.js'
import ArrowIcon from './ArrowIcon.vue'
import RichText from './RichText.vue'

const props = defineProps({
  lang: { type: String, required: true },
  t: { type: Object, required: true },
  id: { type: String, default: 'needs' },
})

const titleId = `${props.id}-title`
const active = ref(0)
const tabs = []
const current = computed(() => props.t.needs[active.value])

const number = profile.links.whatsapp.replace(/\D/g, '')
const whatsapp = (text) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`
const mailto = (need) => `mailto:${profile.links.email}?subject=${encodeURIComponent(need.label)}&body=${encodeURIComponent(need.message)}`

// Arrow keys move between the choices, as in any set of tabs.
function onKey(event) {
  const count = props.t.needs.length
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
  let next = null
  if (step) next = (active.value + step + count) % count
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = count - 1
  if (next === null) return
  event.preventDefault()
  active.value = next
  tabs[next]?.focus()
}
</script>

<style scoped>
/* Clear of the sticky menu when "Tell me what you need" scrolls here. */
.headline {
  scroll-margin-top: 6.5rem;
}

.board {
  margin-top: clamp(1.25rem, 3vw, 2rem);
  padding: clamp(1.25rem, 3vw, 2.25rem);
  background: var(--sky-bg);
  color: var(--sky-ink);
}

/* The choices: pills, the chosen one filled. */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  min-height: 2.75rem;
  padding: 0 1.125rem;
  border: 1.5px solid color-mix(in srgb, var(--sky-ink) 22%, transparent);
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.25s ease,
    color 0.25s ease,
    border-color 0.25s ease,
    transform 0.3s var(--ease-out);
}

.chip:hover {
  border-color: var(--sky-ink);
}

.chip:active {
  transform: scale(0.97);
}

.chip[aria-selected='true'] {
  border-color: var(--sky-ink);
  background: var(--sky-ink);
  color: var(--sky-bg);
}

.chip:focus-visible {
  outline-color: var(--sky-ink);
}

/* The answer. */
.panel {
  display: grid;
  gap: 1.25rem;
  margin-top: clamp(1.5rem, 3.5vw, 2.5rem);
}

@media (min-width: 56rem) {
  .panel {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    column-gap: clamp(2rem, 5vw, 4rem);
    align-items: start;
  }

  .pitch {
    grid-row: span 3;
  }
}

.pitch {
  margin: 0;
  color: color-mix(in srgb, var(--sky-ink) 62%, var(--sky-bg));
  font-size: clamp(1.75rem, 1.2rem + 2vw, 2.75rem);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.pitch :deep(strong) {
  color: var(--sky-ink);
  font-weight: inherit;
}

.points {
  display: grid;
  gap: 0.625rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 1.0625rem;
  line-height: 1.45;
}

.points li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.625rem;
  align-items: start;
}

.points svg {
  margin-top: 0.15rem;
}

.points circle {
  fill: var(--sky);
}

.points path {
  fill: none;
  stroke: #fff;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.proof {
  margin: 0;
  font-size: 0.9375rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.25rem;
}

.actions .button--ink {
  border-color: var(--sky-ink);
  background: var(--sky-ink);
  color: var(--sky-bg);
}

.email {
  font-size: 0.9375rem;
  font-weight: 500;
}

/* Changing the answer: out with a blur, in with the ticks arriving one by one. */
.need-enter-active {
  transition:
    opacity 0.45s var(--ease-out),
    transform 0.55s var(--ease-out),
    filter 0.45s var(--ease-out);
}

.need-leave-active {
  transition:
    opacity 0.16s var(--ease-in),
    filter 0.16s var(--ease-in);
}

.need-enter-from {
  opacity: 0;
  transform: translate3d(0, 0.75rem, 0);
  filter: blur(6px);
}

.need-leave-to {
  opacity: 0;
  filter: blur(6px);
}

@media (prefers-reduced-motion: no-preference) {
  .need-enter-active .points li {
    animation: tick-in 0.6s var(--ease-out) backwards;
    animation-delay: calc(var(--k) * 90ms + 120ms);
  }
}

@keyframes tick-in {
  from {
    opacity: 0;
    transform: translate3d(-0.5rem, 0, 0);
  }
}
</style>
