<template>
  <nav class="nav" :aria-label="t.navLabel">
    <div ref="pill" class="pill">
      <span ref="indicator" class="indicator" :class="{ hidden: !pages.includes(page) }" aria-hidden="true"></span>
      <a
        v-for="item in pages"
        :key="item"
        :ref="(el) => (links[item] = el)"
        class="item"
        :href="item === 'home' ? '#/' : `#/${item}`"
        :aria-current="page === item ? 'page' : null"
      >
        <span v-if="item === 'contact'" class="dot" aria-hidden="true"></span>
        <span class="swap">{{ t.nav[item] }}</span>
      </a>
    </div>
  </nav>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { motion, snap, spring, step, still, tune } from '../motion.js'

const props = defineProps({
  pages: { type: Array, required: true },
  page: { type: String, required: true },
  t: { type: Object, required: true },
})

// A solid pill slides under the current page's name. Each edge is its own spring: the
// edge in the direction of travel is stiff and the other is soft, so the pill
// stretches toward the new page and then pulls its tail in.
// Adapted from DesignBookmark's Tab pill, with its spring values.
const pill = ref(null)
const indicator = ref(null)
const links = {}
const left = spring(0)
const right = spring(0)
let resizeObserver = null

const engine = motion({
  frame(dt) {
    step(left, dt)
    step(right, dt)
    return !still(left, 0.05) || !still(right, 0.05)
  },
  render() {
    indicator.value.style.transform = `translateX(${left.x.toFixed(2)}px)`
    indicator.value.style.width = `${Math.max(0, right.x - left.x).toFixed(2)}px`
  },
})

function place(jump) {
  const link = links[props.page]
  if (!link) return // a page outside the menu: the pill stays where it was, hidden
  const from = left.t
  left.t = link.offsetLeft
  right.t = link.offsetLeft + link.offsetWidth
  if (left.t >= from) {
    tune(right, 620, 40)
    tune(left, 170, 19)
  } else {
    tune(left, 620, 40)
    tune(right, 170, 19)
  }
  if (jump) {
    snap(left)
    snap(right)
  }
  engine.wake()
}

watch(
  () => props.page,
  () => nextTick(() => place(false)),
)
watch(
  () => props.t,
  () => nextTick(() => place(true)),
)

onMounted(() => {
  place(true)
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(() => place(true))
    resizeObserver.observe(pill.value)
  }
  document.fonts?.ready.then(() => place(true))
})

onBeforeUnmount(() => {
  engine.stop()
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.nav {
  position: sticky;
  top: 1.25rem;
  z-index: 20;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.pill {
  position: relative;
  display: flex;
  padding: 0.3125rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--glass);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.06),
    var(--lift);
  backdrop-filter: saturate(1.6) blur(14px);
  -webkit-backdrop-filter: saturate(1.6) blur(14px);
  pointer-events: auto;
}

.indicator {
  position: absolute;
  top: 0.3125rem;
  bottom: 0.3125rem;
  left: 0;
  border-radius: 999px;
  background: var(--ink);
  transition: opacity 0.3s ease;
  will-change: transform, width;
}

.indicator.hidden {
  opacity: 0;
}

.item {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-width: 4.75rem;
  min-height: 2.75rem;
  padding: 0 1.125rem;
  border-radius: 999px;
  color: var(--muted);
  font-size: 0.9375rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.25s ease;
  -webkit-tap-highlight-color: transparent;
}

.item:hover {
  color: var(--ink);
}

/* The current page reads light on the dark pill (dark on the light one at night). */
.item[aria-current='page'] {
  color: var(--bg);
}

.dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: var(--ok);
}

/* Dark theme: a clear, lighter glass with a crisp edge. Less saturation, so a photo
   behind it blurs to a neutral tone instead of a muddy one; the current page sits on
   a brighter pill of its own. */
:root[data-theme='dark'] .pill {
  border-color: rgb(255 255 255 / 0.12);
  background: rgb(40 40 47 / 0.72);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.1),
    0 0.75rem 2rem -0.75rem rgb(0 0 0 / 0.75);
  backdrop-filter: saturate(1.05) blur(22px) brightness(0.8);
  -webkit-backdrop-filter: saturate(1.05) blur(22px) brightness(0.8);
}

:root[data-theme='dark'] .item {
  color: rgb(255 255 255 / 0.68);
}

:root[data-theme='dark'] .item:hover {
  color: #fff;
}

:root[data-theme='dark'] .item[aria-current='page'] {
  color: var(--bg);
}

/* On phones the menu sits at the bottom, under the thumb. */
@media (max-width: 40rem) {
  .nav {
    position: fixed;
    top: auto;
    left: 0;
    right: 0;
    bottom: calc(0.875rem + env(safe-area-inset-bottom));
  }

  .item {
    min-width: 0;
    padding: 0 0.7rem;
    font-size: 0.8125rem;
  }
}

/* The narrowest phones: a little less room around each name, so the five still fit
   with space at the edges (Kiswahili's names are the longest). */
@media (max-width: 24rem) {
  .item {
    padding: 0 0.5rem;
  }
}

</style>
