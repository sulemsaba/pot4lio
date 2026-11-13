<template>
  <button
    v-if="!calm"
    ref="surface"
    type="button"
    class="grass"
    :aria-label="t.grassLabel"
    :aria-describedby="captionId || null"
    @pointermove="onMove"
    @pointerleave="onLeave"
    @click="onPress"
    @keydown="onKey"
  >
    <canvas ref="canvas" aria-hidden="true"></canvas>
  </button>
  <div v-else ref="surface" class="grass" aria-hidden="true"><canvas ref="canvas"></canvas></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps({
  t: { type: Object, required: true },
  captionId: { type: String, default: '' },
})

// A strip of grass. The first time it comes into view it grows up out of the ground.
// Each blade is a small spring: a hand brushing past pushes it, it swings back and
// settles, and a light breeze keeps the whole field breathing.
// Arrow keys send a gust across; a tap or Enter parts the blades.
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const surface = ref(null)
const canvas = ref(null)

// Three rows, far to near: slim, tall and close together, the tallest in the middle.
const ROWS = [
  { every: 5, low: 0.34, high: 0.78, width: [1, 1.5], push: 0.55 },
  { every: 14, low: 0.55, high: 0.98, width: [1.2, 1.8], push: 0.8 },
  { every: 7, low: 0.28, high: 0.84, width: [1.3, 2], push: 1 },
]
const GROW = 1.5 // seconds for one blade to reach its full height

let ctx = null
let width = 0
let height = 0
let ratio = 1
let blades = []
let fills = []
let frame = 0
let last = 0
let onScreen = false
let pointer = null
let gusts = []
let resizeObserver = null
let viewObserver = null
let themeObserver = null
let touched = -1e9 // when a hand or a key last stirred the grass
let skip = false
let sown = 0 // when the field started growing, 0 until it is first seen
let grown = calm

// The same meadow on every visit.
function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

function grow() {
  const random = seeded(20251113)
  blades = []
  ROWS.forEach((row, r) => {
    const count = Math.ceil(width / row.every) + 1
    for (let i = 0; i < count; i += 1) {
      const h = height * (row.low + (row.high - row.low) * random() ** 1.3)
      blades.push({
        r,
        x: (i + random() * 0.9) * row.every,
        h,
        w: row.width[0] + random() * (row.width[1] - row.width[0]),
        lean: (random() - 0.5) * h * 0.45,
        phase: random() * Math.PI * 2,
        // Tall blades are floppier than short ones.
        stiff: (34 + random() * 26) * Math.min(1.5, Math.max(0.65, (height * 0.42) / h)),
        push: row.push,
        // When it starts to grow: the back row first, then the rest, a little at random.
        wait: r * 0.15 + random() * 1.05,
        g: grown ? 1 : 0,
        bend: 0,
        speed: 0,
      })
    }
  })
}

function readColours() {
  const style = getComputedStyle(surface.value)
  fills = ['--grass-back', '--grass-mid', '--grass-front'].map((name) => style.getPropertyValue(name).trim())
}

function measure() {
  const box = surface.value.getBoundingClientRect()
  if (!box.width || !box.height) return
  ratio = Math.min(window.devicePixelRatio || 1, 2)
  const sameSize = Math.round(box.width) === Math.round(width) && Math.round(box.height) === Math.round(height)
  width = box.width
  height = box.height
  canvas.value.width = Math.round(width * ratio)
  canvas.value.height = Math.round(height * ratio)
  if (!sameSize || !blades.length) grow()
  draw()
}

function step(dt, now) {
  const time = now / 1000
  if (!grown) {
    grown = true
    for (const b of blades) {
      b.g = Math.min(1, Math.max(0, (time - sown - b.wait) / GROW))
      if (b.g < 1) grown = false
    }
  }
  for (const gust of gusts) gust.x += gust.dir * 820 * dt
  gusts = gusts.filter((gust) => gust.x > -120 && gust.x < width + 120)

  for (const b of blades) {
    for (const gust of gusts) {
      const near = 1 - Math.abs(b.x - gust.x) / 90
      if (near > 0) b.speed += gust.dir * 2300 * near * b.push * dt
    }
    // The breeze: a slow wave rolling from left to right.
    const breeze = Math.sin(time * 1.4 - b.x * 0.011 + b.phase * 0.35) * b.h * 0.06
    b.speed += (-b.stiff * (b.bend - breeze) - 5.2 * b.speed) * dt
    b.bend += b.speed * dt
    const limit = b.h * 0.9
    if (Math.abs(b.bend) > limit) {
      b.bend = Math.sign(b.bend) * limit
      b.speed *= -0.25
    }
  }
}

function draw() {
  if (!ctx) return
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  ctx.clearRect(0, 0, width, height)
  const ground = height + 1
  let row = -1
  for (const b of blades) {
    if (b.r !== row) {
      if (row >= 0) ctx.fill()
      row = b.r
      ctx.fillStyle = fills[row] || '#5a8f4a'
      ctx.beginPath()
    }
    if (!b.g) continue
    // Quick out of the ground, slowing as it reaches its height.
    const h = b.h * (1 - (1 - b.g) ** 2)
    const off = (b.lean + b.bend) * (h / b.h)
    // A bent blade keeps its length, so its tip comes down a little.
    const rise = Math.sqrt(Math.max(h * h - off * off * 0.6, h * h * 0.2))
    // Both edges bend together, so a blade stays slim from root to tip, straight or bent.
    const half = b.w / 2
    const bendX = b.x + off * 0.35
    ctx.moveTo(b.x - half, ground)
    ctx.quadraticCurveTo(bendX - half * 0.55, ground - rise * 0.5, b.x + off, ground - rise)
    ctx.quadraticCurveTo(bendX + half * 0.55, ground - rise * 0.5, b.x + half, ground)
    ctx.closePath()
  }
  ctx.fill()
}

function tick(now) {
  frame = 0
  // With only the breeze moving, every other frame is plenty and spares the battery.
  skip = grown && !gusts.length && now - touched > 1500 && !skip
  if (!skip) {
    const dt = Math.min((now - last) / 1000, 1 / 24)
    last = now
    step(dt, now)
    draw()
  }
  if (onScreen && !document.hidden) frame = requestAnimationFrame(tick)
}

function start() {
  if (calm || frame || !onScreen || document.hidden) return
  if (!sown) sown = performance.now() / 1000
  last = performance.now()
  frame = requestAnimationFrame(tick)
}

function stop() {
  cancelAnimationFrame(frame)
  frame = 0
}

function local(event) {
  const box = canvas.value.getBoundingClientRect()
  return { x: event.clientX - box.left, y: event.clientY - box.top }
}

// A hand passing by: blades between where it was and where it is now get pushed
// its way, harder the faster it moves. Only blades tall enough to reach it feel it.
function onMove(event) {
  const { x, y } = local(event)
  const now = event.timeStamp
  if (pointer && now - pointer.at < 120) {
    const dt = Math.max(now - pointer.at, 8) / 1000
    const pace = Math.max(-2600, Math.min(2600, (x - pointer.x) / dt))
    const from = Math.min(x, pointer.x)
    const to = Math.max(x, pointer.x)
    for (const b of blades) {
      if (y < height - b.h - 6) continue
      const gap = b.x < from ? from - b.x : b.x > to ? b.x - to : 0
      const near = 1 - gap / 42
      if (near > 0) b.speed += pace * near * near * 0.75 * b.push
    }
  }
  pointer = { x, y, at: now }
  touched = now
  start()
}

function onLeave() {
  pointer = null
}

// A tap, a click or Enter: the blades part around that spot.
function onPress(event) {
  const x = event.detail === 0 ? width / 2 : local(event).x
  for (const b of blades) {
    const gap = b.x - x
    const near = 1 - Math.abs(gap) / 170
    if (near > 0) b.speed += Math.sign(gap || 1) * 620 * near * b.push
  }
  touched = event.timeStamp
  start()
}

function onKey(event) {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  event.preventDefault()
  const dir = event.key === 'ArrowRight' ? 1 : -1
  gusts.push({ dir, x: dir > 0 ? -90 : width + 90 })
  touched = event.timeStamp
  start()
}

function onVisibility() {
  if (document.hidden) stop()
  else start()
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  readColours()
  measure()
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(surface.value)
  }
  // The theme can change at any moment: pick up its greens and redraw.
  themeObserver = new MutationObserver(() => {
    readColours()
    draw()
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  if (calm) return
  // The field only moves while it is on screen.
  if ('IntersectionObserver' in window) {
    viewObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      if (onScreen) start()
      else stop()
    })
    viewObserver.observe(surface.value)
  } else {
    onScreen = true
    start()
  }
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  stop()
  resizeObserver?.disconnect()
  viewObserver?.disconnect()
  themeObserver?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<style scoped>
/* Full width of the window, sitting on the bottom edge of the page. */
.grass {
  position: relative;
  display: block;
  width: 100vw;
  height: clamp(7.75rem, 5.5rem + 6.6vw, 11.5rem);
  margin: 0 0 0 calc(50% - 50vw);
  padding: 0;
  border: 0;
  border-radius: 0;
  background: radial-gradient(48% 22% at 50% 100%, color-mix(in srgb, var(--grass-mid) 22%, transparent), transparent);
  font: inherit;
  cursor: pointer;
  touch-action: pan-y;
  -webkit-tap-highlight-color: transparent;
}

.grass:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: -4px;
  border-radius: 0.75rem;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

/* On phones the menu floats over the grass, so the grass grows tall enough to show
   above it. */
@media (max-width: 40rem) {
  .grass {
    height: calc(12rem + env(safe-area-inset-bottom));
  }
}
</style>
