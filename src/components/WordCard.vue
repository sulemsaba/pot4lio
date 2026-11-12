<template>
  <div class="card word-card">
    <h2 class="tag title swap">{{ t.wordTitle }}</h2>

    <button type="button" class="flip" :class="{ flipped, calm }" @click="turn">
      <span class="inner">
        <span class="face front" :aria-hidden="flipped ? 'true' : null">
          <span class="word" lang="sw">{{ current.word }}</span>
          <span class="say">{{ current.say }}</span>
        </span>
        <span class="face back" :aria-hidden="flipped ? null : 'true'">
          <span class="meaning-label swap">{{ t.wordMeaning }}</span>
          <span class="meaning" lang="en">{{ current.meaning }}</span>
        </span>
      </span>
    </button>

    <p class="hint">
      <span class="swap">{{ flipped ? t.wordNext : t.wordFlip }}</span>
      <span class="count">{{ index + 1 }} / {{ words.length }}</span>
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  words: { type: Array, required: true },
  t: { type: Object, required: true },
})

const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const index = ref(0)
const flipped = ref(false)
const current = computed(() => props.words[index.value])

// First tap shows the meaning; the next turns the card back with a new word.
function turn() {
  if (!flipped.value) {
    flipped.value = true
    return
  }
  flipped.value = false
  index.value = (index.value + 1) % props.words.length
}
</script>

<style scoped>
.word-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--palm-bg);
  color: var(--palm-ink);
}

.title {
  color: inherit;
  opacity: 0.8;
}

/* The card turns over in 3D. */
.flip {
  flex: 1;
  min-height: 7.5rem;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  text-align: left;
  cursor: pointer;
  perspective: 900px;
}

.inner {
  position: relative;
  display: block;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.7s var(--ease-out);
}

.flipped .inner {
  transform: rotateY(180deg);
}

.face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.back {
  transform: rotateY(180deg);
}

.word {
  font-size: clamp(2.25rem, 1.8rem + 1.6vw, 3rem);
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.say {
  margin-top: 0.375rem;
  font-size: 0.9375rem;
  opacity: 0.8;
}

.meaning-label {
  font-size: 0.8125rem;
  opacity: 0.8;
}

.meaning {
  margin-top: 0.25rem;
  font-size: clamp(1.375rem, 1.15rem + 0.8vw, 1.75rem);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.015em;
  text-wrap: balance;
}

.hint {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin: 0;
  font-size: 0.8125rem;
  opacity: 0.8;
}

.count {
  font-variant-numeric: tabular-nums;
}

/* Without motion: no turn, the other side simply appears. */
.calm .inner {
  transition: none;
}
</style>
