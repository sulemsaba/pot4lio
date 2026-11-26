// The light and dark theme: which one is on, and changing it. index.html picks the
// first one before the page paints; the pull cord changes it.
import { nextTick, ref } from 'vue'
import { calm, springFrames } from './motion.js'

const root = document.documentElement
export const theme = ref(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')

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

// The new theme spreads out in a circle from (x, y), on a spring: light opens wide
// and a little slower, dark closes in a little faster (the pull cord's own values).
const OPEN = springFrames(120, 21)
const CLOSE = springFrames(170, 27)

export async function setTheme(next, x = innerWidth / 2, y = 0) {
  if (next === theme.value) return
  if (!document.startViewTransition || calm) return apply(next, true)

  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 24
  const { values, duration } = next === 'light' ? OPEN : CLOSE
  const transition = document.startViewTransition(async () => {
    apply(next, true)
    await nextTick()
  })
  try {
    await transition.ready
  } catch {
    return
  }
  root.animate(
    { clipPath: values.map((r) => `circle(${(r * radius).toFixed(1)}px at ${x}px ${y}px)`) },
    { duration, easing: 'linear', pseudoElement: '::view-transition-new(root)' },
  )
}

// Until the visitor picks a theme, follow their system as it changes.
const system = window.matchMedia('(prefers-color-scheme: dark)')
system.addEventListener('change', (event) => {
  let saved = null
  try {
    saved = localStorage.getItem('theme')
  } catch {
    saved = null
  }
  if (!saved) apply(event.matches ? 'dark' : 'light', false)
})
