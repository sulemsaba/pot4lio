<template>
  <!-- The header keeps a place for the lamp's cord; the lamp itself hangs from the top
       of the screen and stays there while the page scrolls, so the theme switch is
       always at hand. -->
  <div ref="slot" class="cord-slot">
    <div class="lamp-layer" :class="{ held }" :style="{ '--s': scale }">
      <svg class="line" aria-hidden="true" focusable="false"><path ref="wire" class="wire" /></svg>
      <div ref="lamp" class="lamp" aria-hidden="true">
        <div ref="head" class="head">
          <i ref="bulb" class="bulb"></i>
          <i class="shade"></i>
          <i class="cap"></i>
        </div>
      </div>
      <svg class="line" aria-hidden="true" focusable="false"><path ref="rope" class="rope" /></svg>
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
import { calm, clamp, motion, spring, step, still } from '../motion.js'
import { setTheme, theme } from '../theme.js'

const props = defineProps({ t: { type: Object, required: true } })
const label = computed(() => (theme.value === 'dark' ? props.t.themeToLight : props.t.themeToDark))

// DesignBookmark's Pull cord, at its own size and with its own springs: a lamp on a
// wire with a cord you can really pull. The cord is a rope with weight, the lamp swings
// when you tug it, and a pull past the click switches the theme, which spreads out from
// the bulb. Lit (yellow bulb) is the light theme; off is the dark one. A tap, Enter or
// Space pulls it too. (The original also pulls itself when idle; here it waits for a
// visitor, so the colours never change while someone is reading.)
const WIRE = 122 // wire length
const SHADE = 66
const AX = 34 // where the cord leaves the shade, from the lamp's centre
const AY = SHADE - 3
const N = 12 // links in the cord
const SEG = 9
const L = N * SEG // its length
const CLICK = 22 // stretch that flips the switch
const MAXS = 54 // the most it gives

const slot = ref(null)
const wire = ref(null)
const lamp = ref(null)
const head = ref(null)
const bulb = ref(null)
const rope = ref(null)
const bead = ref(null)
const grab = ref(null)
const held = ref(false)

const TH = spring(0, 46, 3) // the lamp's angle on its wire
const TUG = spring(0, 300, 13) // how far the wire is pulled down
const BP = spring(1, 420, 13) // the bulb pops when the switch clicks
const HX = spring(0, 210, 22) // the hand that pulls on a tap or a key
const HY = spring(0, 210, 22)
const K = spring(1, 300, 17) // how far the cord is stretched: it eases back, so letting go is a bounce and not a whip

// The lamp is drawn a little smaller than the original (the whole layer is scaled), and
// smaller again on phones. Everything below is in the lamp's own, unscaled pixels.
const phone = window.matchMedia('(max-width: 40rem)')
const scale = ref(phone.matches ? 0.68 : 0.8)
const EDGE = 12 // gap between the shade and the right edge of the screen, in screen pixels

const pts = []
let lampX = 0 // where the wire hangs from (lamp pixels)
let hand = null
let ghost = false
let armed = true
let side = 1
let ghostTimer = 0
let swayTimer = 0

// Where the cord leaves the shade, and where the bulb is, as the lamp swings and drops.
function anchor() {
  const c = Math.cos(TH.x)
  const s = Math.sin(TH.x)
  const y = WIRE + TUG.x + AY
  return [lampX + AX * c - y * s, AX * s + y * c]
}

function bulbAt() {
  const c = Math.cos(TH.x)
  const s = Math.sin(TH.x)
  const y = WIRE + TUG.x + 63
  return [lampX - y * s, y * c]
}

// The shade ends where the page's content ends on the right (the header keeps the
// cord's place there), and never closer than a small gap to the edge of the screen.
// Layout only (offsets), so the header's entrance animation cannot throw it off.
function measure() {
  scale.value = phone.matches ? 0.68 : 0.8
  const s = scale.value
  let left = 0
  for (let el = slot.value; el; el = el.offsetParent) left += el.offsetLeft
  const contentRight = left + slot.value.offsetWidth
  const screenRight = document.documentElement.clientWidth - EDGE
  lampX = (Math.min(contentRight, screenRight) - 62 * s) / s
  if (!pts.length) {
    const [ax, ay] = anchor()
    for (let i = 0; i <= N; i += 1) pts.push({ x: ax, y: ay + i * SEG, vx: 0, vy: 0 })
  }
}

function flip() {
  const next = theme.value === 'dark' ? 'light' : 'dark'
  BP.x = next === 'light' ? 1.35 : 0.8
  TUG.v += 150
  const [bx, by] = bulbAt()
  setTheme(next, bx * scale.value, by * scale.value)
}

function frame(dt) {
  if (dt <= 0) return true
  for (const s of [TH, TUG, BP, HX, HY, K]) step(s, dt)
  const [ax, ay] = anchor()
  const p = hand ? [hand.x, hand.y] : ghost ? [HX.x, HY.x] : null
  const b = pts[N]

  // The held end: free inside the cord's reach, rubber past it.
  let px = 0
  let py = 0
  let stretch = 0
  let lean = 0
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
    lean = over > 0 ? dx / d : 0
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
  TUG.t = stretch * 0.22
  TH.t = clamp(((-lean * stretch) / MAXS) * 0.5, -0.3, 0.3)

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
  return Boolean(p) || fast > 3 || [TH, TUG, BP, K].some((s) => !still(s, 0.002))
}

function render() {
  const th = TH.x
  const tug = TUG.x
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
  const wl = WIRE + tug - 4
  wire.value.setAttribute('d', `M${lampX.toFixed(1)} -4L${(lampX - Math.sin(th) * wl).toFixed(2)} ${(Math.cos(th) * wl).toFixed(2)}`)
  lamp.value.style.transform = `translateX(${lampX.toFixed(1)}px) rotate(${th.toFixed(4)}rad)`
  head.value.style.transform = `translateY(${(WIRE + tug).toFixed(2)}px)`
  bulb.value.style.transform = `scale(${BP.x.toFixed(4)})`
  const angle = Math.atan2(e.x - b.x, b.y - e.y)
  bead.value.style.transform = `translate(${b.x.toFixed(2)}px,${b.y.toFixed(2)}px) rotate(${angle.toFixed(4)}rad)`
  grab.value.style.transform = `translate(${b.x.toFixed(2)}px,${b.y.toFixed(2)}px)`
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
  const [ax, ay] = anchor()
  HX.t = ax + side * 26
  HY.t = ay + L + 64
  clearTimeout(ghostTimer)
  ghostTimer = setTimeout(() => {
    ghost = false
    engine.wake()
  }, 1100) // let go even if it never clicked
  engine.wake()
}

function onDown(event) {
  if (event.button > 0) return
  const b = pts[N]
  const s = scale.value
  hand = {
    id: event.pointerId,
    x: b.x,
    y: b.y,
    ox: b.x - event.clientX / s,
    oy: b.y - event.clientY / s,
    moved: 0,
    sx: event.clientX,
    sy: event.clientY,
    flipped: false,
  }
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
  hand.x = event.clientX / scale.value + hand.ox
  hand.y = event.clientY / scale.value + hand.oy
  hand.moved = Math.max(hand.moved, Math.hypot(event.clientX - hand.sx, event.clientY - hand.sy))
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
  pts[N].vx += event.movementX >= 0 ? 90 : -90
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
      pts[N].vx += 260
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

/* The lamp's own colours, as in the original: a pale lamp in the light, a dark one at
   night, a lit yellow bulb only in the light theme. */
.lamp-layer {
  --lamp-object: #e6e5e2;
  --lamp-line: #85847e;
  --lamp-bulb: #ffd23f;
  --lamp-bead: #0e0f11;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 40;
  width: 0;
  height: 0;
  transform: scale(var(--s, 1));
  transform-origin: 0 0;
}

:root[data-theme='dark'] .lamp-layer {
  --lamp-object: #2c2c2c;
  --lamp-line: #828282;
  --lamp-bulb: rgb(255 255 255 / 0.14);
  --lamp-bead: #fff;
}

@media (prefers-reduced-motion: no-preference) {
  .lamp-layer {
    animation: lamp-in 0.8s var(--ease-out) 0.2s backwards;
  }
}

@keyframes lamp-in {
  from {
    opacity: 0;
  }
}

.line {
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  height: 1px;
  overflow: visible;
  pointer-events: none;
}

.wire,
.rope {
  fill: none;
  stroke: var(--lamp-line);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.lamp {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  transform-origin: 0 0;
  pointer-events: none;
  will-change: transform;
}

.head {
  position: absolute;
  left: 0;
  top: 0;
  will-change: transform;
}

.cap {
  position: absolute;
  left: -9px;
  top: -10px;
  width: 18px;
  height: 14px;
  border-radius: 5px 5px 0 0;
  background: var(--lamp-line);
}

.shade {
  position: absolute;
  left: -62px;
  top: 0;
  width: 124px;
  height: 66px;
  border-radius: 62px 62px 12px 12px / 58px 58px 12px 12px;
  background: var(--lamp-object);
}

.bulb {
  position: absolute;
  left: -19px;
  top: 44px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--lamp-bulb);
  will-change: transform;
}

.bead {
  position: absolute;
  left: -8px;
  top: -3px;
  width: 16px;
  height: 30px;
  border-radius: 999px;
  background: var(--lamp-bead);
  transform-origin: 8px 3px;
  pointer-events: none;
  will-change: transform;
}

/* The one real control: it sits on the bead and follows it, and stays finger-sized
   (44 by 52 screen pixels) however small the lamp is drawn. */
.grab {
  position: absolute;
  left: calc(-22px / var(--s, 1));
  top: calc(-12px / var(--s, 1));
  width: calc(44px / var(--s, 1));
  height: calc(52px / var(--s, 1));
  padding: 0;
  border: 0;
  border-radius: 12px;
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
  outline: 2px solid var(--muted);
  outline-offset: 0;
}
</style>
