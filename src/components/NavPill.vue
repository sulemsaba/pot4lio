<template>
  <nav class="nav" :aria-label="t.navLabel">
    <div ref="pill" class="pill">
      <span class="indicator" :class="{ ready }" :style="indicator" aria-hidden="true"></span>
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
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

const props = defineProps({
  pages: { type: Array, required: true },
  page: { type: String, required: true },
  t: { type: Object, required: true },
})

// A grey pill slides behind the current page's name.
const pill = ref(null)
const links = {}
const indicator = reactive({ transform: 'translateX(0)', width: '0px' })
const ready = ref(false)
let resizeObserver = null

function place() {
  const link = links[props.page]
  if (!link) return
  indicator.transform = `translateX(${link.offsetLeft}px)`
  indicator.width = `${link.offsetWidth}px`
}

watch(
  () => [props.page, props.t],
  () => nextTick(place),
)

onMounted(() => {
  place()
  requestAnimationFrame(() => (ready.value = true))
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(place)
    resizeObserver.observe(pill.value)
  }
  document.fonts?.ready.then(place)
})

onBeforeUnmount(() => resizeObserver?.disconnect())
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
  background: var(--pill);
}

.indicator.ready {
  transition:
    transform 0.5s var(--ease-out),
    width 0.5s var(--ease-out);
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
}

.item:hover,
.item[aria-current='page'] {
  color: var(--ink);
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

:root[data-theme='dark'] .indicator {
  background: rgb(255 255 255 / 0.13);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.14),
    0 1px 2px rgb(0 0 0 / 0.4);
}

:root[data-theme='dark'] .item {
  color: rgb(255 255 255 / 0.68);
}

:root[data-theme='dark'] .item:hover,
:root[data-theme='dark'] .item[aria-current='page'] {
  color: #fff;
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

@media (prefers-reduced-motion: reduce) {
  .indicator.ready {
    transition: none;
  }
}
</style>
