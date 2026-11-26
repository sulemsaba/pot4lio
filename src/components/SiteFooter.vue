<template>
  <footer class="footer">
    <div class="sign-off">
      <p class="say">
        <span class="visually-hidden">{{ t.sayStart }} {{ t.sayAll }} {{ t.sayEnd }}</span>
        <span aria-hidden="true">
          <span class="say-line"
            ><span class="swap">{{ t.sayStart }}</span>{{ ' ' }}<WordRoll class="swap" :words="t.sayWords" :every="6000"
          /></span>
          <span class="say-line swap">{{ t.sayEnd }}</span>
        </span>
      </p>
      <div class="say-actions">
        <a v-if="page !== 'contact'" class="button button--ink" href="#/contact">
          <span class="swap">{{ t.sayButton }}</span>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7h9M7.75 3.25 11.5 7l-3.75 3.75" /></svg>
        </a>
        <a v-if="page !== 'cv'" class="button" href="#/cv">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3.5 1.75h4.75L11 4.5v7.75H3.5z M8 1.75V4.75h3 M5.5 7.5h3.5 M5.5 9.75h3.5" /></svg>
          <span class="swap">{{ t.readCv }}</span>
        </a>
      </div>
    </div>

    <div class="meta">
      <span>© {{ year }} {{ profile.name }} · {{ profile.city }}</span>
      <span v-if="!calm" id="grass-hint" class="hint swap">{{ t.grassHint }}</span>
    </div>

    <div class="ground">
      <GrassField :t="t" :caption-id="calm ? '' : 'grass-hint'" />
      <StreetLight />
    </div>
  </footer>
</template>

<script setup>
import { profile } from '../content.js'
import GrassField from './GrassField.vue'
import StreetLight from './StreetLight.vue'
import WordRoll from './WordRoll.vue'

defineProps({
  lang: { type: String, required: true },
  t: { type: Object, required: true },
  page: { type: String, required: true },
})

const year = new Date().getFullYear()
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
</script>

<style scoped>
.footer {
  margin-top: clamp(5rem, 11vw, 9rem);
}

/* The sign-off: big, on two lines, with its buttons underneath. */
.sign-off {
  display: grid;
  gap: clamp(1.5rem, 3vw, 2.25rem);
}

.say {
  margin: 0;
  color: var(--ink);
  font-size: clamp(2.5rem, 1rem + 6.4vw, 7rem);
  font-weight: 600;
  line-height: 0.98;
  letter-spacing: -0.045em;
}

.say-line {
  display: block;
}

.say-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  justify-self: start;
  margin-bottom: 0.4rem;
}

/* Both lines on the left: the road light stands on the right. */
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 2rem;
  margin-top: clamp(2.5rem, 5vw, 4rem);
  color: var(--muted);
  font-size: 0.875rem;
}

.hint {
  color: var(--ink);
  font-weight: 500;
}

/* The grass and the street light standing in it. */
.ground {
  position: relative;
  isolation: isolate;
  margin-top: 0.75rem;
}

.ground :deep(.grass) {
  position: relative;
  z-index: 1;
}
</style>
