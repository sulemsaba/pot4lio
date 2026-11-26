<template>
  <figure ref="card" class="card play" :aria-label="t.playLabel">
    <div class="play-top">
      <span class="tag swap">{{ t.playTitle }}</span>
      <span class="readout" aria-hidden="true">{{ width }} px · <span class="swap">{{ t.playDevices[device] }}</span></span>
    </div>

    <div ref="stage" class="stage">
      <div ref="frame" class="frame" :class="device">
        <!-- A small website, laid out with container queries, so it really reflows. -->
        <div ref="site" class="site" aria-hidden="true">
          <div class="chrome"><i></i><i></i><i></i><span class="url">duka.co.tz</span></div>
          <div class="status"><span>9:41</span><i class="notch"></i><span class="bars"></span></div>
          <header class="m-nav">
            <span class="m-brand"><i class="m-logo"></i>Duka</span>
            <span class="m-links"><i></i><i></i><i></i></span>
            <span class="m-cta-sm">{{ t.playCta }}</span>
            <span class="m-burger"><i></i><i></i><i></i></span>
          </header>
          <section class="m-hero">
            <div class="m-copy">
              <p class="m-title">{{ t.playSite }}</p>
              <i class="m-bar"></i>
              <i class="m-bar short"></i>
              <span class="m-cta">{{ t.playCta }}</span>
            </div>
            <div class="m-art"><i class="m-sun"></i><i class="m-sea"></i></div>
          </section>
          <section class="m-cards">
            <article v-for="n in 3" :key="n" class="m-card"><i class="m-pic"></i><i class="m-bar"></i><i class="m-bar short"></i></article>
          </section>
        </div>
        <span
          ref="handle"
          class="handle"
          role="slider"
          tabindex="0"
          :aria-label="t.playWidth"
          :aria-valuemin="MIN"
          :aria-valuemax="MAX"
          :aria-valuenow="width"
          :aria-valuetext="`${width} px, ${t.playDevices[device]}`"
          @pointerdown="onDown"
          @pointermove="onMove"
          @pointerup="onUp"
          @pointercancel="onUp"
          @keydown="onKey"
          ><i></i
        ></span>
      </div>
      <span v-if="!touched" class="sticker swap" aria-hidden="true">{{ t.playHint }}</span>
    </div>

    <div class="presets">
      <button
        v-for="preset in PRESETS"
        :key="preset.id"
        type="button"
        class="preset swap"
        :aria-pressed="String(device === preset.id && width === preset.w)"
        @click="go(preset.w)"
      >
        {{ t.playDevices[preset.id] }}
      </button>
    </div>
  </figure>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { calm, clamp, motion, snap, spring, step, still, tune } from '../motion.js'

defineProps({ t: { type: Object, required: true } })

// "Responsive" shown rather than said: a small website in a frame you can pull
// narrower or wider. It is drawn at its real width (phone to desktop) and scaled to
// fit, so its layout really changes as it passes a phone's, a tablet's and a desktop's
// width. Let go and it settles on the nearest one, on a spring.
const MIN = 360
const MAX = 1280
const PRESETS = [
  { id: 'phone', w: 390 },
  { id: 'tablet', w: 768 },
  { id: 'desktop', w: 1280 },
]

const card = ref(null)
const stage = ref(null)
const frame = ref(null)
const site = ref(null)
const handle = ref(null)
const width = ref(MAX)
const touched = ref(false)
const device = computed(() => (width.value < 600 ? 'phone' : width.value < 960 ? 'tablet' : 'desktop'))

const W = spring(MAX, 280, 22)
let scale = 0.3
let stageW = 0
let stageH = 0
let drag = null
let observer = null
let resizeObserver = null
const demo = []

const engine = motion({
  frame(dt) {
    step(W, dt)
    return Boolean(drag) || !still(W, 0.05)
  },
  render() {
    const w = clamp(W.x, MIN - 40, MAX + 30)
    const shown = w * scale
    frame.value.style.width = `${shown.toFixed(2)}px`
    frame.value.style.transform = `translateX(${((stageW - shown) / 2).toFixed(2)}px)`
    site.value.style.width = `${w.toFixed(1)}px`
    site.value.style.height = `${(stageH / scale).toFixed(1)}px`
    site.value.style.transform = `scale(${scale.toFixed(5)})`
    // A phone has rounder corners than a browser window.
    const round = clamp((700 - w) / 300, 0, 1)
    const r = 6 + round * 10
    frame.value.style.borderRadius = `${r.toFixed(2)}px ${r.toFixed(2)}px 0 0`
    site.value.style.borderRadius = `${(r / scale).toFixed(1)}px ${(r / scale).toFixed(1)}px 0 0`
    width.value = Math.round(clamp(W.x, MIN, MAX))
  },
})

function measure() {
  stageW = stage.value.clientWidth - 16 // room for the handle at the widest
  stageH = stage.value.clientHeight
  scale = stageW / MAX
  engine.wake()
  if (!drag) frameOnce()
}

const frameOnce = () => requestAnimationFrame(() => engine.wake())

function stopDemo() {
  demo.forEach(clearTimeout)
  demo.length = 0
}

function go(w, k = 280, c = 22) {
  touched.value = true
  stopDemo()
  tune(W, k, c)
  W.t = w
  engine.wake()
}

const nearest = (w) => PRESETS.reduce((best, p) => (Math.abs(p.w - w) < Math.abs(best.w - w) ? p : best)).w

function onDown(event) {
  if (event.button > 0) return
  stopDemo()
  touched.value = true
  drag = { id: event.pointerId, x: event.clientX, w: W.x }
  tune(W, 900, 50)
  try {
    handle.value.setPointerCapture(event.pointerId)
  } catch {
    // The drag still works while the pointer stays on the handle.
  }
  engine.wake()
}

function onMove(event) {
  if (!drag || event.pointerId !== drag.id) return
  // The frame stays centred, so the edge moves half as far as the width changes.
  W.t = clamp(drag.w + ((event.clientX - drag.x) * 2) / scale, MIN, MAX)
}

function onUp(event) {
  if (!drag || event.pointerId !== drag.id) return
  drag = null
  go(nearest(W.t))
}

function onKey(event) {
  const steps = { ArrowLeft: -40, ArrowDown: -40, ArrowRight: 40, ArrowUp: 40 }
  if (event.key in steps) go(clamp(W.t + steps[event.key], MIN, MAX), 900, 50)
  else if (event.key === 'Home') go(MIN)
  else if (event.key === 'End') go(MAX)
  else if (event.key === 'PageDown') go(PRESETS.slice().reverse().find((p) => p.w < W.t - 1)?.w ?? MIN)
  else if (event.key === 'PageUp') go(PRESETS.find((p) => p.w > W.t + 1)?.w ?? MAX)
  else return
  event.preventDefault()
}

// The first time it is seen: desktop, tablet, phone and back, to show it moves.
function play() {
  if (calm || touched.value) return
  const steps = [
    [700, 768],
    [1900, 390],
    [3300, 1280],
  ]
  for (const [at, w] of steps) {
    demo.push(
      setTimeout(() => {
        tune(W, 260, 24)
        W.t = w
        engine.wake()
      }, at),
    )
  }
}

onMounted(() => {
  snap(W, MAX)
  measure()
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(stage.value)
  }
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        play()
      },
      { threshold: 0.6 },
    )
    observer.observe(card.value)
  }
})

onBeforeUnmount(() => {
  stopDemo()
  engine.stop()
  observer?.disconnect()
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.play {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 0.75rem;
  margin: 0;
  padding: 1rem;
  aspect-ratio: 1;
}

.play-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.125rem 0.25rem 0;
}

.readout {
  color: var(--muted);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* A design canvas: a fine grid of dots behind the frame. */
.stage {
  position: relative;
  min-height: 0;
  border-radius: calc(var(--radius) - 0.5rem);
  background-color: var(--bg);
  background-image: radial-gradient(circle, color-mix(in srgb, var(--muted) 38%, transparent) 1px, transparent 1.2px);
  background-size: 14px 14px;
  overflow: hidden;
}

.frame {
  position: absolute;
  top: 0.75rem;
  bottom: 0;
  left: 8px;
  overflow: visible;
  border-radius: 8px 8px 0 0;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--ink) 14%, transparent),
    0 1rem 2rem -1rem rgb(0 0 0 / 0.35);
  will-change: width, transform;
}

/* The website itself, in its own pixels; scaled down to fit. */
.site {
  position: absolute;
  left: 0;
  top: 0;
  overflow: hidden;
  border-radius: inherit;
  transform-origin: 0 0;
  background: var(--paper);
  color: var(--ink);
  container-type: inline-size;
  font-family: var(--font);
  pointer-events: none;
}

.chrome,
.status {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 52px;
  padding: 0 22px;
  background: var(--soft);
  color: var(--muted);
  font-size: 18px;
}

.chrome i {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--line);
}

.url {
  margin-left: 18px;
  padding: 6px 18px;
  border-radius: 999px;
  background: var(--bg);
}

.status {
  display: none;
  justify-content: space-between;
  background: var(--paper);
  color: var(--ink);
  font-weight: 600;
}

.notch {
  width: 110px;
  height: 30px;
  border-radius: 999px;
  background: var(--ink);
}

.bars {
  width: 42px;
  height: 16px;
  border-radius: 4px;
  background: var(--ink);
}

.m-nav {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 26px 48px;
}

.m-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.m-logo {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--sky);
}

.m-links {
  display: flex;
  gap: 28px;
  margin-left: auto;
}

.m-links i {
  width: 74px;
  height: 14px;
  border-radius: 7px;
  background: var(--line);
}

.m-cta-sm,
.m-cta {
  padding: 14px 28px;
  border-radius: 999px;
  background: var(--ink);
  color: var(--bg);
  font-size: 22px;
  font-weight: 600;
}

.m-burger {
  display: none;
  flex-direction: column;
  gap: 7px;
  margin-left: auto;
}

.m-burger i {
  width: 34px;
  height: 4px;
  border-radius: 2px;
  background: var(--ink);
}

.m-hero {
  display: grid;
  gap: 36px;
  padding: 24px 48px 44px;
}

.m-title {
  margin: 0 0 24px;
  font-size: 50px;
  font-weight: 600;
  line-height: 1.04;
  letter-spacing: -0.035em;
}

.m-bar {
  display: block;
  height: 16px;
  margin-bottom: 14px;
  border-radius: 8px;
  background: var(--line);
}

.m-bar.short {
  width: 62%;
}

.m-cta {
  display: inline-block;
  margin-top: 16px;
}

.m-art {
  position: relative;
  min-height: 240px;
  overflow: hidden;
  border-radius: 26px;
  background: linear-gradient(180deg, var(--sky-bg), color-mix(in srgb, var(--sky) 55%, var(--sky-bg)));
}

.m-sun {
  position: absolute;
  right: 18%;
  top: 22%;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #ffd23f;
}

.m-sea {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 32%;
  background: var(--sky);
  opacity: 0.85;
}

.m-cards {
  display: grid;
  gap: 28px;
  padding: 0 48px 48px;
}

.m-card {
  padding: 18px;
  border-radius: 22px;
  background: var(--soft);
}

.m-pic {
  display: block;
  height: 150px;
  margin-bottom: 18px;
  border-radius: 14px;
  background: var(--palm-bg);
}

.m-card:nth-child(2) .m-pic {
  background: var(--sand-bg);
}

.m-card:nth-child(3) .m-pic {
  background: var(--sky-bg);
}

/* Phone: a status bar instead of the browser's, a menu button, everything in one column. */
@container (max-width: 599px) {
  .chrome {
    display: none;
  }

  .status {
    display: flex;
  }

  .m-nav {
    padding: 22px 30px;
  }

  .m-links,
  .m-cta-sm {
    display: none;
  }

  .m-burger {
    display: flex;
  }

  .m-hero,
  .m-cards {
    padding-left: 30px;
    padding-right: 30px;
  }

  .m-title {
    font-size: 44px;
  }

  .m-cta {
    display: block;
    text-align: center;
  }
}

/* Tablet and up: two cards a row. */
@container (min-width: 600px) {
  .m-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .m-card:nth-child(3) {
    display: none;
  }
}

/* Desktop: the words beside the picture, three cards a row. */
@container (min-width: 960px) {
  .m-hero {
    grid-template-columns: 1.1fr 1fr;
    align-items: center;
  }

  .m-title {
    font-size: 64px;
  }

  .m-cards {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .m-card:nth-child(3) {
    display: block;
  }
}

/* The edge you pull: a small grip on the right side of the frame. */
.handle {
  position: absolute;
  top: 50%;
  right: -11px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 56px;
  margin-top: -28px;
  border-radius: 999px;
  cursor: ew-resize;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}

.handle i {
  width: 8px;
  height: 40px;
  border-radius: 999px;
  background: var(--ink);
  box-shadow: 0 0 0 3px var(--bg);
  transition: transform 0.2s var(--ease-out);
}

.handle:hover i,
.handle:active i {
  transform: scaleY(1.15);
}

.handle:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}

/* A sticker pressed on by hand, until the first pull. */
.sticker {
  position: absolute;
  left: 0.75rem;
  bottom: 0.75rem;
  z-index: 2;
  padding: 0.4375rem 0.75rem;
  border-radius: 0.625rem;
  background: #fff;
  color: #111;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 0.75rem 1.5rem -0.5rem rgb(0 0 0 / 0.35);
  transform: rotate(-4deg);
  pointer-events: none;
}

.presets {
  display: flex;
  gap: 0.375rem;
}

.preset {
  flex: 1;
  min-height: 2.75rem;
  padding: 0 0.5rem;
  border: 0;
  border-radius: 999px;
  background: var(--bg);
  color: var(--muted);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.25s ease,
    color 0.25s ease;
  -webkit-tap-highlight-color: transparent;
}

.preset:hover {
  color: var(--ink);
}

.preset[aria-pressed='true'] {
  background: var(--ink);
  color: var(--bg);
}
</style>
