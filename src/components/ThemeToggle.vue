<template>
  <button
    type="button"
    class="theme"
    :class="{ dark: theme === 'dark' }"
    :aria-label="theme === 'dark' ? t.themeToLight : t.themeToDark"
    :title="theme === 'dark' ? t.themeToLight : t.themeToDark"
    @click="toggle"
  >
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <mask :id="maskId">
        <rect x="0" y="0" width="20" height="20" fill="#fff" />
        <circle class="bite" cx="15" cy="5" r="5.5" fill="#000" />
      </mask>
      <circle class="body" cx="10" cy="10" r="4.25" :mask="`url(#${maskId})`" />
      <g class="rays">
        <line v-for="n in 8" :key="n" x1="10" y1="1.6" x2="10" y2="3.2" :transform="`rotate(${n * 45} 10 10)`" />
      </g>
    </svg>
  </button>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

defineProps({ t: { type: Object, required: true } })

const maskId = 'theme-moon-bite'
const root = document.documentElement
const theme = ref(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')
const system = window.matchMedia('(prefers-color-scheme: dark)')
const calm = window.matchMedia('(prefers-reduced-motion: reduce)')

function apply(next, remember) {
  theme.value = next
  root.setAttribute('data-theme', next)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#0e0e10' : '#ffffff')
  if (!remember) return
  try {
    localStorage.setItem('theme', next)
  } catch {
    // Not saved; the choice still applies to this visit.
  }
}

// The new theme spreads out in a circle from the button, where the browser can.
async function toggle(event) {
  const next = theme.value === 'dark' ? 'light' : 'dark'
  if (!document.startViewTransition || calm.matches) return apply(next, true)

  const box = event.currentTarget.getBoundingClientRect()
  const x = event.clientX || box.left + box.width / 2
  const y = event.clientY || box.top + box.height / 2
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

  const transition = document.startViewTransition(async () => {
    apply(next, true)
    await nextTick()
  })
  await transition.ready
  root.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
    { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
  )
}

// Until the visitor picks a theme, follow their system as it changes.
function onSystemChange(event) {
  let saved = null
  try {
    saved = localStorage.getItem('theme')
  } catch {
    saved = null
  }
  if (!saved) apply(event.matches ? 'dark' : 'light', false)
}

onMounted(() => system.addEventListener('change', onSystemChange))
onBeforeUnmount(() => system.removeEventListener('change', onSystemChange))
</script>

<style scoped>
.theme {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.2s ease;
}

.theme:hover {
  color: var(--ink);
}

svg {
  overflow: visible;
}

.body {
  fill: currentColor;
  transform-origin: 10px 10px;
  transition: r 0.5s var(--ease-out);
}

.bite {
  transform: translate(6px, -6px);
  transition: transform 0.5s var(--ease-out);
}

.rays line {
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
}

.rays {
  transform-origin: 10px 10px;
  transition:
    transform 0.5s var(--ease-out),
    opacity 0.3s ease;
}

/* Dark: the sun loses its rays and a bite turns it into a moon. */
.dark .body {
  r: 6.5px;
}

.dark .bite {
  transform: none;
}

.dark .rays {
  opacity: 0;
  transform: rotate(-45deg) scale(0.5);
}

@media (prefers-reduced-motion: reduce) {
  .body,
  .bite,
  .rays {
    transition: none;
  }
}
</style>
