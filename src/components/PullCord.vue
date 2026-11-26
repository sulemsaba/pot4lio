<template>
  <!-- The cord keeps its place in the header, but hangs from the top of the screen and
       stays there while the page scrolls, so the theme switch is always at hand. -->
  <div ref="slot" class="cord-slot">
  <div ref="box" class="cord" :class="{ held }">
    <svg class="rope" aria-hidden="true" focusable="false"><path ref="rope" /></svg>
    <i ref="mount" class="mount" aria-hidden="true"></i>
    <i ref="bead" class="bead" aria-hidden="true"></i>
    <button
      ref="grab"
      type="button"
      class="grab"
      :aria-label="label"
      :title="label"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @pointerenter="onEnter"
      @click="onClick"
    ></button>
  </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { calm, motion, spring, step, still } from '../motion.js'
import { setTheme, theme } from '../theme.js'

const props = defineProps({ t: { type: Object, required: true } })
const label = computed(() => (theme.value === 'dark' ? props.t.themeToLight : props.t.themeToDark))

// A light switch on a cord, hanging from the top of the page. The cord is a chain of
// points with weight, kept at length by soft links, so it hangs, swings and whips like
// a rope. Held, the bead follows the pointer until the cord is tight; past that it
// stretches like rubber, and a pull past the click switches the theme, which spreads
// out from the bead. A tap, Enter or Space pulls it too.
// Adapted from DesignBookmark's Pull cord; the springs and the rope keep its values.
const N = 8 // links in the cord
const REST = 13 // where the cord ends at rest, so the bead hangs in the middle of its box
const CLICK = 22 // stretch past the cord's length that flips the switch
const MAXS = 54 // the most it stretches

const slot = ref(null)
const box = ref(null)
const rope = ref(null)
const mount = ref(null)
const bead = ref(null)
const grab = ref(null)
const held = ref(false)

const K = spring(1, 300, 17) // how far the cord is stretched: it eases back, so letting go is a bounce, not a whip
const BP = spring(1, 420, 13) // the bead pops when the switch clicks
const HX = spring(0, 210, 22) // the hand that pulls on a tap or a key
const HY = spring(0, 210, 22)

const pts = []
let ax = 0 // where the cord hangs from: the top edge of the page
let ay = 0
let L = 0 // its length
let SEG = 0
let hand = null // a pointer holding the bead
let ghost = false // the pulling hand is at work
let armed = true
let side = 1
let ghostTimer = 0
let swayTimer = 0

// Where the header keeps the cord's place, on the page (layout only, so the header's
// own entrance animation cannot throw it off). The cord is pinned to the screen there.
function measure() {
  let top = 0
  let left = 0
  for (let el = slot.value; el; el = el.offsetParent) {
    top += el.offsetTop
    left += el.offsetLeft
  }
  box.value.style.top = `${top}px`
  box.value.style.left = `${left}px`
  ax = slot.value.offsetWidth / 2
  ay = -top
  L = REST - ay
  SEG = L / N
  if (!pts.length) {
    for (let i = 0; i <= N; i += 1) pts.push({ x: ax, y: ay + i * SEG, vx: 0, vy: 0 })
  }
}

function flip() {
  const next = theme.value === 'dark' ? 'light' : 'dark'
  BP.x = next === 'light' ? 1.35 : 0.8
  const r = bead.value.getBoundingClientRect()
  setTheme(next, r.left + r.width / 2, r.top + r.height / 2)
}

function frame(dt) {
  if (dt <= 0) return true
  for (const s of [K, BP, HX, HY]) step(s, dt)
  const p = hand ? [hand.x, hand.y] : ghost ? [HX.x, HY.x] : null
  const b = pts[N]

  // The held end: free inside the cord's reach, rubber past it.
  let px = 0
  let py = 0
  let stretch = 0
  if (p) {
    const dx = p[0] - ax
    const dy = p[1] - ay
    const d = Math.hypot(dx, dy) || 1
    const over = Math.max(0, d - L)
    const give = MAXS * (1 - Math.exp(-over / 70))
    const r = Math.min(d, L) + give
    px = ax + (dx / d) * r
    py = ay + (dy / d) * r
    stretch = give
    if (over > 0) {
      K.x = K.t = r / L
      K.v = 0
    }
    if (armed && give > CLICK) {
      armed = false
      flip()
      if (hand) hand.flipped = true
      else ghostTimer = setTimeout(() => (ghost = false), 120)
    }
  }
  if (!p || !stretch) K.t = 1
  const seg = SEG * Math.max(1, K.x)

  // The rope: gravity, then the links pulled back to length a few times.
  const prev = pts.map((q) => [q.x, q.y])
  for (let i = 1; i <= N; i += 1) {
    const q = pts[i]
    const k = Math.exp(-(i === N ? 1.1 : 2.4) * dt)
    q.vy += 2600 * dt
    q.vx *= k
    q.vy *= k
    const sp = Math.hypot(q.vx, q.vy)
    if (sp > 2600) {
      q.vx *= 2600 / sp
      q.vy *= 2600 / sp
    }
    q.x += q.vx * dt
    q.y += q.vy * dt
  }
  for (let it = 0; it < 8; it += 1) {
    pts[0].x = ax
    pts[0].y = ay
    if (p) {
      b.x = px
      b.y = py
    }
    for (let i = 0; i < N; i += 1) {
      const a = pts[i]
      const c = pts[i + 1]
      const dx = c.x - a.x
      const dy = c.y - a.y
      const d = Math.hypot(dx, dy) || 1e-6
      const f = ((d - seg) / d) * 0.5
      const wa = i === 0 ? 0 : 1
      const wc = i + 1 === N ? (p ? 0 : 0.3) : 1 // the bead is heavy
      const sum = wa + wc || 1
      a.x += ((dx * f * wa) / sum) * 2
      a.y += ((dy * f * wa) / sum) * 2
      c.x -= ((dx * f * wc) / sum) * 2
      c.y -= ((dy * f * wc) / sum) * 2
    }
  }
  pts[0].x = ax
  pts[0].y = ay
  if (p) {
    b.x = px
    b.y = py
  }
  let fast = 0
  for (let i = 1; i <= N; i += 1) {
    pts[i].vx = (pts[i].x - prev[i][0]) / dt
    pts[i].vy = (pts[i].y - prev[i][1]) / dt
    fast = Math.max(fast, Math.abs(pts[i].vx) + Math.abs(pts[i].vy))
  }
  return Boolean(p) || fast > 3 || !still(K, 0.002) || !still(BP, 0.002)
}

function render() {
  const b = pts[N]
  const e = pts[N - 1]
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 1; i < N; i += 1) {
    const mx = (pts[i].x + pts[i + 1].x) / 2
    const my = (pts[i].y + pts[i + 1].y) / 2
    d += `Q${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`
  }
  d += `L${b.x.toFixed(1)} ${b.y.toFixed(1)}`
  rope.value.setAttribute('d', d)
  const angle = Math.atan2(e.x - b.x, b.y - e.y)
  bead.value.style.transform = `translate(${b.x.toFixed(2)}px,${b.y.toFixed(2)}px) rotate(${angle.toFixed(4)}rad) scale(${BP.x.toFixed(4)})`
  grab.value.style.transform = `translate(${b.x.toFixed(2)}px,${b.y.toFixed(2)}px)`
  mount.value.style.transform = `translate(${(ax - 7).toFixed(1)}px,${(ay - 1).toFixed(1)}px)`
}

const engine = motion({ frame, render })

// One pull by an unseen hand: down past the click, then let go.
function pull() {
  if (ghost || hand) return
  if (calm) {
    flip()
    return
  }
  const b = pts[N]
  ghost = true
  armed = true
  side = -side
  HX.x = b.x
  HY.x = b.y
  HX.v = b.vx
  HY.v = b.vy
  HX.t = ax + side * 10
  HY.t = ay + L + 64
  clearTimeout(ghostTimer)
  ghostTimer = setTimeout(() => {
    ghost = false
    engine.wake()
  }, 1100) // let go even if it never clicked
  engine.wake()
}

const local = (event) => {
  const r = box.value.getBoundingClientRect()
  return [event.clientX - r.left, event.clientY - r.top]
}

function onDown(event) {
  if (event.button > 0) return
  const [x, y] = local(event)
  const b = pts[N]
  hand = { id: event.pointerId, x: b.x, y: b.y, ox: b.x - x, oy: b.y - y, moved: 0, sx: x, sy: y, flipped: false }
  ghost = false
  armed = true
  held.value = true
  try {
    grab.value.setPointerCapture(event.pointerId)
  } catch {
    // Without capture the pull still works while the pointer stays on the bead.
  }
  engine.wake()
}

function onMove(event) {
  if (!hand || event.pointerId !== hand.id) return
  const [x, y] = local(event)
  hand.x = x + hand.ox
  hand.y = y + hand.oy
  hand.moved = Math.max(hand.moved, Math.hypot(x - hand.sx, y - hand.sy))
}

function onUp(event) {
  if (!hand || event.pointerId !== hand.id) return
  const tap = hand.moved < 5 && !hand.flipped && event.type === 'pointerup'
  hand = null
  held.value = false
  if (tap) pull()
  engine.wake()
}

// Enter or Space (a click with no pointer behind it).
function onClick(event) {
  if (event.detail === 0) pull()
}

// A mouse brushing past sets it swinging a little.
function onEnter(event) {
  if (calm || hand || event.pointerType !== 'mouse') return
  pts[N].vx += event.movementX >= 0 ? 70 : -70
  engine.wake()
}

function onResize() {
  measure()
  engine.wake()
}

onMounted(() => {
  measure()
  render()
  window.addEventListener('resize', onResize)
  document.fonts?.ready.then(onResize) // the header settles once its font has arrived
  // Once, soon after the page opens: a small swing, so it reads as a cord you can pull.
  if (!calm) {
    swayTimer = setTimeout(() => {
      pts[N].vx += 240
      engine.wake()
    }, 900)
  }
})

onBeforeUnmount(() => {
  engine.stop()
  clearTimeout(ghostTimer)
  clearTimeout(swayTimer)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.cord-slot {
  display: block;
  width: 2.75rem;
  height: 2.75rem;
}

/* Pinned to the screen, above the page, at the spot the header keeps for it. */
.cord {
  position: fixed;
  z-index: 40;
  width: 2.75rem;
  height: 2.75rem;
}

@media (prefers-reduced-motion: no-preference) {
  .cord {
    animation: cord-in 0.8s var(--ease-out) 0.2s backwards;
  }
}

@keyframes cord-in {
  from {
    opacity: 0;
  }
}

.rope {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.rope path {
  fill: none;
  stroke: var(--muted);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Where it hangs from: a small cap on the top edge of the page. */
.mount {
  position: absolute;
  left: 0;
  top: 0;
  width: 14px;
  height: 7px;
  border-radius: 0 0 7px 7px;
  background: var(--muted);
  pointer-events: none;
}

/* The bead at the end, the part you hold. */
.bead {
  position: absolute;
  left: -5px;
  top: -3px;
  width: 10px;
  height: 20px;
  border-radius: 999px;
  background: var(--ink);
  /* a thin ring in the page colour, so it reads over photos and dark cards too */
  box-shadow: 0 0 0 1.5px var(--bg);
  transform-origin: 5px 3px;
  pointer-events: none;
  will-change: transform;
}

/* The one real control: a finger-sized target that sits on the bead and follows it. */
.grab {
  position: absolute;
  left: -22px;
  top: -14px;
  width: 44px;
  height: 52px;
  padding: 0;
  border: 0;
  border-radius: 0.75rem;
  background: transparent;
  cursor: grab;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  will-change: transform;
}

.held .grab {
  cursor: grabbing;
}

.grab:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 0;
}
</style>
