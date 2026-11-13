<template>
  <footer ref="root" class="footer">
    <div class="sign-off">
      <p class="say">
        <span class="visually-hidden">{{ t.sayStart }} {{ t.sayAll }} {{ t.sayEnd }}</span>
        <span aria-hidden="true">
          <span class="say-line"
            ><span class="swap">{{ t.sayStart }}</span>{{ ' ' }}<span class="say-slot"
              ><Transition name="say" mode="out-in" :duration="{ enter: 1000, leave: 460 }"
                ><span :key="`${lang}-${index}`" class="say-word swap" :style="{ '--say': `var(--say-${(index % 3) + 1})` }"
                  ><span v-for="(letter, n) in letters" :key="n" class="ch" :style="{ '--n': n }">{{ letter }}</span></span
                ></Transition
              ></span
            ></span
          >
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

    <GrassField :t="t" :caption-id="calm ? '' : 'grass-hint'" />
  </footer>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { profile } from '../content.js'
import GrassField from './GrassField.vue'

const props = defineProps({
  lang: { type: String, required: true },
  t: { type: Object, required: true },
  page: { type: String, required: true },
})

const year = new Date().getFullYear()
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// The middle word changes every few seconds, letter by letter, each word in its own colour.
// It only runs while the footer is on screen.
const root = ref(null)
const index = ref(0)
const letters = computed(() => Array.from(props.t.sayWords[index.value % props.t.sayWords.length]))
let timer = 0
let onScreen = false
let observer = null

function loop() {
  clearInterval(timer)
  if (calm || !onScreen || document.hidden) return
  timer = setInterval(() => (index.value += 1), 2600)
}

onMounted(() => {
  if (calm || !('IntersectionObserver' in window)) return
  observer = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting
    loop()
  })
  observer.observe(root.value)
  document.addEventListener('visibilitychange', loop)
})

onBeforeUnmount(() => {
  clearInterval(timer)
  observer?.disconnect()
  document.removeEventListener('visibilitychange', loop)
})
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

.say-slot {
  display: inline-block;
}

.say-word {
  display: inline-block;
  color: var(--say);
}

.ch {
  display: inline-block;
  white-space: pre;
}

/* In: letters rise one after another. Out: they lift away, quicker. */
.say-enter-active .ch {
  transition:
    transform 0.7s var(--ease-out),
    opacity 0.5s var(--ease-out),
    filter 0.5s var(--ease-out);
  transition-delay: calc(var(--n) * 38ms);
}

.say-leave-active .ch {
  transition:
    transform 0.28s var(--ease-in),
    opacity 0.28s var(--ease-in),
    filter 0.28s var(--ease-in);
  transition-delay: calc(var(--n) * 22ms);
}

.say-enter-from .ch {
  opacity: 0;
  transform: translate3d(0, 0.45em, 0) rotate(6deg);
  filter: blur(6px);
}

.say-leave-to .ch {
  opacity: 0;
  transform: translate3d(0, -0.3em, 0);
  filter: blur(6px);
}

.say-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  justify-self: start;
  margin-bottom: 0.4rem;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem 1.5rem;
  margin-top: clamp(2.5rem, 5vw, 4rem);
  color: var(--muted);
  font-size: 0.875rem;
}

.hint {
  color: var(--ink);
  font-weight: 500;
}

.footer :deep(.grass) {
  margin-top: 0.75rem;
}
</style>
