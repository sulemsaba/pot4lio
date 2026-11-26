<template>
  <span ref="slot" class="slot" aria-hidden="true"><span class="strut">&#8203;</span></span>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { calm, clamp, motion, snap, spring, step, still } from '../motion.js'

const props = defineProps({
  words: { type: Array, required: true },
  every: { type: Number, default: 4000 }, // ms each word stays
  tint: { type: Boolean, default: true }, // each word in its own colour (the footer's sky, palm and sunset)
})

// The word rolls to the next one letter by letter: the old letters roll up and out
// while the new ones roll in from below, each word in its own colour, and the space it
// sits in stretches to the new width on a spring. It only turns while it is on screen.
// Adapted from DesignBookmark's Word roll, with its spring values.
const slot = ref(null)
const width = spring(0, 150, 22) // the space stretching to the new word, gently
let live = []
let index = 0
let timer = 0
let onScreen = false
let observer = null
const timeouts = new Set()

const later = (ms, fn) => {
  const id = setTimeout(() => {
    timeouts.delete(id)
    fn()
    engine.wake()
  }, ms)
  timeouts.add(id)
}

const engine = motion({
  frame(dt) {
    step(width, dt)
    let busy = !still(width, 0.1)
    for (const word of live) {
      for (const letter of word.letters) {
        step(letter.s, dt)
        if (!still(letter.s, 0.001)) busy = true
      }
    }
    return busy || timeouts.size > 0
  },
  render() {
    slot.value.style.width = `${width.x.toFixed(2)}px`
    for (const word of live) {
      for (const letter of word.letters) {
        const y = letter.s.x
        letter.el.style.transform = `translateY(${(y * 110).toFixed(2)}%)`
        letter.el.style.opacity = clamp(1 - Math.abs(y) * 0.9, 0, 1).toFixed(3)
      }
    }
  },
})

function make(text, n) {
  const el = document.createElement('span')
  el.className = 'word'
  if (props.tint) el.style.color = `var(--say-${(n % 3) + 1})`
  const letters = Array.from(text).map((ch) => {
    const letter = document.createElement('span')
    letter.className = 'ch'
    letter.textContent = ch
    el.appendChild(letter)
    return { el: letter, s: spring(1, 150, 19) } // 1 = below the slot, 0 = in place, -1 = above; slow on purpose, so it reads calmly
  })
  slot.value.appendChild(el)
  return { el, letters, out: false }
}

function show(jump) {
  for (const word of live) {
    if (word.out) continue
    word.out = true
    if (jump) {
      word.el.remove()
      continue
    }
    word.letters.forEach((letter, k) => later(k * 40, () => (letter.s.t = -1)))
    later(1800, () => {
      word.el.remove()
      live = live.filter((other) => other !== word)
    })
  }
  if (jump) live = []
  const word = make(props.words[index % props.words.length], index)
  word.letters.forEach((letter, k) => {
    if (jump) snap(letter.s, 0)
    else later(140 + k * 55, () => (letter.s.t = 0))
  })
  live.push(word)
  width.t = word.el.offsetWidth
  if (jump) snap(width)
  engine.wake()
}

function next() {
  index += 1
  show(false)
}

function loop() {
  clearInterval(timer)
  if (calm || !onScreen || document.hidden) return
  timer = setInterval(next, props.every)
}

// A new language: its word, straight away.
watch(
  () => props.words,
  () => show(true),
)

onMounted(() => {
  show(true)
  // The first width was measured before the font arrived.
  document.fonts?.ready.then(() => {
    const word = live[live.length - 1]
    if (word) width.t = word.el.offsetWidth
    snap(width)
    engine.wake()
  })
  if (calm || !('IntersectionObserver' in window)) return
  observer = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting
    loop()
  })
  observer.observe(slot.value)
  document.addEventListener('visibilitychange', loop)
})

onBeforeUnmount(() => {
  clearInterval(timer)
  for (const id of timeouts) clearTimeout(id)
  engine.stop()
  observer?.disconnect()
  document.removeEventListener('visibilitychange', loop)
})
</script>

<style scoped>
/* The slot shares the line's height and baseline (the invisible strut holds them), and
   clips the letters as they roll through: exactly at the top, so nothing spills into
   the line above, and a little below, so a resting word keeps its descenders. */
.slot {
  position: relative;
  display: inline-block;
  vertical-align: baseline;
  white-space: nowrap;
  clip-path: inset(0 -0.6em -0.24em -0.1em);
}

.strut {
  display: inline-block;
  width: 0;
}

.slot :deep(.word) {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
}

.slot :deep(.ch) {
  display: inline-block;
  white-space: pre;
  will-change: transform, opacity;
}
</style>
