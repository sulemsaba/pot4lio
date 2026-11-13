<template>
  <section class="card game" :class="[`game--${tone}`, { flip }]" :aria-labelledby="`${id}-title`">
    <div class="info">
      <h2 :id="`${id}-title`" class="title swap">{{ title }}</h2>
      <p :id="`${id}-how`" class="how swap">{{ how }}</p>
      <p class="best">
        <span class="swap">{{ t.playBest }}</span>
        <strong>{{ best }}</strong>
      </p>
    </div>

    <div class="frame">
    <span class="lift" aria-hidden="true"></span>
    <div
      ref="stage"
      class="stage"
      :class="{ live: state === 'playing', ready: state !== 'loading' && state !== 'nogl' }"
      :style="{ aspectRatio: `${game.size.w} / ${game.size.h}` }"
      tabindex="0"
      role="application"
      :aria-label="title"
      :aria-describedby="`${id}-how ${id}-keys`"
      @pointerdown="onDown"
      @pointerup="onUp"
      @pointercancel="onUp"
      @pointerleave="onUp"
      @contextmenu.prevent
      @keydown="onKeyDown"
      @keyup="onKeyUp"
      @blur="onBlur"
    >
      <canvas ref="canvas" aria-hidden="true"></canvas>

      <div v-if="state === 'playing'" class="hud" aria-hidden="true">
        <span class="hud-score">{{ score }}</span>
        <span v-if="lives !== null" class="hud-lives">
          <span v-for="n in 3" :key="n" class="life" :class="{ gone: n > lives }"></span>
        </span>
      </div>

      <Transition name="toast">
        <p v-if="toast && state === 'playing'" :key="toast.id" class="toast" :class="{ bad: !toast.good }" aria-hidden="true">
          {{ t[toast.key] }}<span v-if="toast.extra" class="toast-extra">{{ toast.extra }}</span>
        </p>
      </Transition>

      <div v-if="state !== 'playing'" class="overlay">
        <div class="panel">
          <template v-if="state === 'loading'">
            <span class="loading swap">{{ t.playLoading }}</span>
          </template>
          <template v-else-if="state === 'nogl'">
            <span class="loading swap">{{ t.playNo3d }}</span>
          </template>
          <template v-else>
            <p v-if="state === 'paused'" class="over-label swap">{{ t.playPaused }}</p>
            <template v-if="state === 'over'">
              <p class="over-label swap">{{ t.playOver }}</p>
              <p class="over-score">{{ score }}</p>
              <p class="over-best swap">{{ newBest ? t.playNewBest : `${t.playBest} ${best}` }}</p>
            </template>
            <span class="go swap" aria-hidden="true">{{ state === 'over' ? t.playAgain : state === 'paused' ? t.playResume : t.playStart }}</span>
            <span :id="`${id}-keys`" class="keys swap">{{ t.playKeys }}</span>
          </template>
        </div>
      </div>
    </div>
    </div>
    <p class="visually-hidden" aria-live="polite">{{ said }}</p>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  how: { type: String, required: true },
  tone: { type: String, default: 'sky' },
  flip: { type: Boolean, default: false },
  create: { type: Function, required: true },
  scene: { type: Function, required: true },
  t: { type: Object, required: true },
})

// The rules are plain JavaScript (src/games), the look is a three.js scene
// (src/games/scenes). This card runs the rules, draws the scene, passes on taps
// and keys, and keeps the score and the best score.
const game = props.create()
const stage = ref(null)
const canvas = ref(null)
const state = ref('loading')
const score = ref(0)
const lives = ref(game.lives)
const best = ref(readBest())
const newBest = ref(false)
const said = ref('')
const toast = ref(null)

let view3d = null
let frame = 0
let last = 0
let clock = 0
let onScreen = true
let holding = false
let readyAt = 0
let gone = false
let shownNote = null
let startWhenReady = false
let slow = 0 // how many recent frames came late
let settleFrame = 0
let toastId = 0
let resizeObserver = null
let viewObserver = null
let themeObserver = null

function readBest() {
  try {
    return Number(localStorage.getItem(`best-${props.id}`)) || 0
  } catch {
    return 0
  }
}

function saveBest(value) {
  try {
    localStorage.setItem(`best-${props.id}`, String(value))
  } catch {
    // Not saved; it still shows for this visit.
  }
}

const isDark = () => document.documentElement.dataset.theme === 'dark'

function fit() {
  const box = stage.value?.getBoundingClientRect()
  if (!view3d || !box?.width) return
  view3d.size(box.width, box.height)
  draw(0)
}

function draw(dt) {
  if (!view3d) return
  view3d.world.update(game.view(), dt, clock)
  view3d.render()
}

function sync() {
  score.value = game.score
  lives.value = game.lives
  const note = game.note()
  if (note !== shownNote) {
    shownNote = note
    toast.value = note ? { key: note.key, extra: note.extra, good: note.good, id: (toastId += 1) } : null
  }
}

function tick(now) {
  frame = 0
  const gap = now - last
  const dt = Math.min(gap / 1000, 1 / 30)
  last = now
  keepUp(gap)
  clock += dt
  game.step(dt)
  sync()
  draw(dt)
  if (game.over) return finish()
  resume()
}

// Frames coming late, again and again: the game draws a little less sharp, so it
// stays smooth on a slower phone.
function keepUp(gap) {
  slow = gap > 22 ? slow + 1 : Math.max(0, slow - 2)
  if (slow < 40) return
  slow = 0
  view3d?.ease()
}

function resume() {
  if (frame || state.value !== 'playing' || !onScreen || document.hidden) return
  last = performance.now()
  frame = requestAnimationFrame(tick)
}

function pause() {
  cancelAnimationFrame(frame)
  frame = 0
}

function begin() {
  if (state.value === 'loading') {
    startWhenReady = true // tapped while it was still setting up: start as soon as it can
    return
  }
  if (state.value === 'nogl' || performance.now() < readyAt) return
  if (state.value === 'paused') {
    state.value = 'playing'
    return resume()
  }
  cancelAnimationFrame(settleFrame)
  game.reset()
  shownNote = null
  toast.value = null
  sync()
  newBest.value = false
  said.value = ''
  state.value = 'playing'
  resume()
}

// After the last moment, the scene plays on a little (the player's reaction), then rests.
function settle() {
  cancelAnimationFrame(settleFrame)
  const until = performance.now() + 1500
  let before = performance.now()
  const step = (now) => {
    if (now > until || state.value === 'playing') return
    const dt = Math.min((now - before) / 1000, 1 / 30)
    before = now
    clock += dt
    draw(dt)
    settleFrame = requestAnimationFrame(step)
  }
  settleFrame = requestAnimationFrame(step)
}

function finish() {
  pause()
  settle()
  holding = false
  state.value = 'over'
  readyAt = performance.now() + 700 // a moment, so a frantic tap does not restart at once
  if (game.score > best.value) {
    best.value = game.score
    newBest.value = true
    saveBest(game.score)
  }
  said.value = `${props.t.playOver}. ${props.t.playScore} ${game.score}. ${props.t.playBest} ${best.value}.`
}

// Where a tap lands, in the game's own units (the scene works it out through its camera).
function toWorld(event) {
  const box = canvas.value.getBoundingClientRect()
  const nx = ((event.clientX - box.left) / box.width) * 2 - 1
  const ny = -(((event.clientY - box.top) / box.height) * 2 - 1)
  return view3d?.world.pick?.(nx, ny) || null
}

function onDown(event) {
  if (event.button > 0) return
  stage.value.focus({ preventScroll: true })
  if (state.value !== 'playing') return begin()
  event.preventDefault()
  holding = true
  game.down(toWorld(event))
}

function onUp() {
  if (!holding) return
  holding = false
  game.up()
}

// Tapping away (another game, the page) pauses this one; a tap on it carries on.
function onBlur() {
  onUp()
  if (state.value !== 'playing') return
  pause()
  state.value = 'paused'
}

const KEYS = [' ', 'Enter', 'ArrowUp']

function onKeyDown(event) {
  if (!KEYS.includes(event.key)) return
  event.preventDefault()
  if (event.repeat) return
  if (state.value !== 'playing') return begin()
  holding = true
  game.down(null)
}

function onKeyUp(event) {
  if (KEYS.includes(event.key)) onUp()
}

function onVisibility() {
  if (document.hidden) pause()
  else resume()
}

async function load() {
  try {
    const [{ createStage }, scene] = await Promise.all([import('../../games/scenes/stage.js'), props.scene()])
    await document.fonts?.ready // the signs on the bus and the boards use the site's font
    if (gone) return
    view3d = createStage(canvas.value, scene.build, { dark: isDark() })
    await view3d.warm().catch(() => {})
    if (gone) return
    state.value = 'idle'
    fit()
    if (startWhenReady) begin()
  } catch {
    if (!gone) state.value = 'nogl'
  }
}

onMounted(() => {
  load()
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(fit)
    resizeObserver.observe(stage.value)
  }
  // Light or dark: day or evening in the game too.
  themeObserver = new MutationObserver(() => {
    view3d?.theme(isDark())
    draw(0)
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  // Scrolled away mid-game: it waits, and carries on when it is back on screen.
  if ('IntersectionObserver' in window) {
    viewObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      if (onScreen) resume()
      else pause()
    })
    viewObserver.observe(stage.value)
  }
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  gone = true
  pause()
  cancelAnimationFrame(settleFrame)
  resizeObserver?.disconnect()
  viewObserver?.disconnect()
  themeObserver?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
  view3d?.dispose()
})
</script>

<style scoped>
/* Wide screens: the name and how to play on one side, the game on the other. */
.game {
  display: grid;
  gap: clamp(1rem, 2.5vw, 1.5rem);
  background: var(--tone-bg);
  color: var(--tone-ink);
}

.game--sky {
  --tone-bg: var(--sky-bg);
  --tone-ink: var(--sky-ink);
}

.game--palm {
  --tone-bg: var(--palm-bg);
  --tone-ink: var(--palm-ink);
}

.game--sand {
  --tone-bg: var(--sand-bg);
  --tone-ink: var(--sand-ink);
}

@media (min-width: 52rem) {
  .game {
    grid-template-columns: minmax(0, 0.75fr) minmax(0, 1.25fr);
    align-items: center;
  }

  .game.flip {
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr);
  }

  .game.flip .info {
    order: 2;
  }
}

.info {
  display: grid;
  gap: 0.625rem;
  align-content: start;
}

.title {
  margin: 0;
  font-size: clamp(1.75rem, 1.3rem + 1.6vw, 2.75rem);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.035em;
}

.how {
  max-width: 26rem;
  margin: 0;
  font-size: 1rem;
  line-height: 1.45;
  opacity: 0.85;
  text-wrap: pretty;
}

.best {
  display: flex;
  gap: 0.375rem;
  margin: 0.25rem 0 0;
  font-size: 0.9375rem;
  font-variant-numeric: tabular-nums;
}

/* The game window lifts off the card on a soft shadow. The shadow is its own still
   layer behind the window: on the window itself, the browser would repaint it with
   every frame of the game, and the game would stutter. */
.frame {
  position: relative;
}

.lift {
  position: absolute;
  inset: 0;
  border-radius: calc(var(--radius) * 0.6);
  box-shadow: 0 1.25rem 2.5rem -1.5rem rgb(0 0 0 / 0.45);
  pointer-events: none;
}

/* The panel, the score and the messages sit on near-solid pills, so they read over
   any scene, by day or by night. (Frosted glass would have to blur the moving game
   behind it on every frame, which costs phones frames.) */
.stage {
  --hud-bg: rgb(255 255 255 / 0.92);
  --glass-ink: #10151c;
  position: relative;
  overflow: hidden;
  border-radius: calc(var(--radius) * 0.6);
  background: color-mix(in srgb, var(--tone-ink) 10%, var(--tone-bg));
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.08);
  cursor: pointer;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

:root[data-theme='dark'] .stage {
  --hud-bg: rgb(16 18 30 / 0.86);
  --glass-ink: #f4f4f8;
}

/* While playing, a finger on the game plays it instead of scrolling the page. */
.stage.live {
  touch-action: none;
}

.stage:focus-visible {
  outline: 2px solid var(--tone-ink);
  outline-offset: 3px;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.6s ease;
}

.ready canvas {
  opacity: 1;
}

.hud {
  position: absolute;
  inset: 0.75rem 0.75rem auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
}

.hud-score,
.hud-lives {
  display: inline-flex;
  align-items: center;
  min-height: 2.25rem;
  padding: 0 0.75rem;
  border-radius: 999px;
  background: var(--hud-bg);
  color: var(--glass-ink);
}

.hud-score {
  font-size: 1.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.hud-lives {
  gap: 0.3rem;
}

.life {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background: #f2453d;
  transition:
    opacity 0.3s ease,
    transform 0.4s var(--ease-out);
}

.life.gone {
  opacity: 0.2;
  transform: scale(0.7);
}

/* "Perfect stop!", "+3": pops up over the scene, then goes. */
.toast {
  position: absolute;
  top: 3.75rem;
  left: 50%;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 0;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: var(--hud-bg);
  color: var(--glass-ink);
  font-size: 1.125rem;
  font-weight: 700;
  white-space: nowrap;
  transform: translateX(-50%);
  pointer-events: none;
}

.toast.bad {
  background: #c2412d;
  color: #fff;
}

.toast-extra {
  color: #1e8449;
  font-size: 1rem;
}

:root[data-theme='dark'] .toast-extra {
  color: #5fd38a;
}

.toast-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.45s var(--ease-out);
}

.toast-leave-active {
  transition: opacity 0.2s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, 0.5rem) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
}

/* Before a game and after one: the scene stays clear, the call to play on glass. */
.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
}

.panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 1rem 1.25rem;
  border-radius: 1.25rem;
  background: var(--hud-bg);
  color: var(--glass-ink);
  text-align: center;
  box-shadow: 0 1rem 2rem -1rem rgb(0 0 0 / 0.35);
}

.loading {
  font-size: 0.9375rem;
  font-weight: 500;
}

.over-label,
.over-best {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
}

.over-score {
  margin: 0;
  font-size: clamp(2.75rem, 2rem + 3vw, 4rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}

.go {
  display: inline-flex;
  align-items: center;
  min-height: 3rem;
  margin-top: 0.25rem;
  padding: 0 1.75rem;
  border-radius: 999px;
  background: var(--glass-ink);
  color: #fff;
  font-size: 1.0625rem;
  font-weight: 700;
  transition: transform 0.35s var(--ease-out);
}

:root[data-theme='dark'] .go {
  color: #10121e;
}

.stage:hover .go {
  transform: scale(1.04);
}

.keys {
  font-size: 0.8125rem;
  opacity: 0.8;
}

@media (prefers-reduced-motion: no-preference) {
  .over-score {
    animation: land 0.6s var(--ease-out);
  }
}

@keyframes land {
  from {
    opacity: 0;
    transform: translate3d(0, 0.4em, 0) scale(0.9);
  }
}

@media (prefers-reduced-motion: reduce) {
  canvas,
  .toast-enter-active {
    transition: none;
  }
}
</style>
