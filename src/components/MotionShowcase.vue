<template>
  <section class="motion" aria-labelledby="motion-title">
    <h2 id="motion-title" class="headline swap"><RichText :text="t.motionTitle" /></h2>

    <div class="motion-grid">
      <!-- The loader on its own stage, with its speed to play with. -->
      <figure class="stage">
        <FadeArc class="arc-big" :duration="`${speed}s`" :label="t.loading" />
        <label class="speed">
          <span class="swap">{{ t.motionSpeed }}</span>
          <input v-model.number="speed" type="range" min="0.4" max="2.4" step="0.1" :aria-valuetext="`${speed.toFixed(1)} s`" />
          <output>{{ speed.toFixed(1) }} s</output>
        </label>
      </figure>

      <div class="side">
        <div class="caption">
          <h3 class="name">Fade Arc<span class="type swap">{{ t.motionType }}</span></h3>
          <p class="text swap">{{ t.motionText }}</p>
          <a class="link" href="https://designbookmark.com/motion" target="_blank" rel="noopener noreferrer"
            ><span class="swap">{{ t.motionLink }}</span><span class="visually-hidden"> ({{ t.opensNewTab }})</span><ArrowIcon class="arrow"
          /></a>
        </div>

        <!-- The same loader where it lives in a real product: inside a button. -->
        <div class="try">
          <p class="tag swap">{{ t.motionTry }}</p>
          <button type="button" class="button button--ink send" :aria-busy="String(state === 'busy')" @click="send">
            <FadeArc v-if="state === 'busy'" class="arc-small" duration="0.8s" />
            <svg v-else-if="state === 'done'" class="tick" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.75 7.25 5.75 10.25 11.25 4" /></svg>
            <span class="swap">{{ state === 'busy' ? t.motionSending : state === 'done' ? t.motionSent : t.motionSend }}</span>
          </button>
          <span class="visually-hidden" aria-live="polite">{{ state === 'done' ? t.motionSent : '' }}</span>
        </div>
      </div>
    </div>

    <p class="credit swap">{{ t.motionCredit }}</p>
  </section>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue'
import ArrowIcon from './ArrowIcon.vue'
import FadeArc from './FadeArc.vue'
import RichText from './RichText.vue'

defineProps({ t: { type: Object, required: true } })

const speed = ref(1)
const state = ref('idle')
let timer = 0

function send() {
  if (state.value === 'busy') return
  clearTimeout(timer)
  state.value = 'busy'
  timer = setTimeout(() => {
    state.value = 'done'
    timer = setTimeout(() => (state.value = 'idle'), 1800)
  }, 1500)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.headline {
  margin-bottom: clamp(1.75rem, 4vw, 2.75rem);
}

.motion-grid {
  display: grid;
  gap: var(--gap);
}

@media (min-width: 48rem) {
  .motion-grid {
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  }
}

/* The stage: dark in both themes, like the motion library the loader lives in. */
.stage {
  position: relative;
  display: grid;
  place-items: center;
  min-height: clamp(16rem, 34vw, 24rem);
  margin: 0;
  border-radius: var(--radius);
  background: #151517;
  color: #f4f4f6;
}

.arc-big {
  width: clamp(4rem, 9vw, 6rem);
  height: clamp(4rem, 9vw, 6rem);
}

.speed {
  position: absolute;
  left: 1.25rem;
  right: 1.25rem;
  bottom: 1.125rem;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) 3rem;
  align-items: center;
  gap: 0.875rem;
  color: rgb(255 255 255 / 0.7);
  font-size: 0.875rem;
}

.speed output {
  color: #fff;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.speed input {
  width: 100%;
  min-height: 2.75rem;
  accent-color: #f4f4f6;
  cursor: pointer;
}

.side {
  display: grid;
  gap: var(--gap);
  align-content: start;
}

.caption,
.try {
  padding: var(--pad);
  border-radius: var(--radius);
  background: var(--soft);
}

.name {
  display: flex;
  flex-direction: column;
  margin: 0 0 0.75rem;
  font-size: 1.0625rem;
  font-weight: 600;
  line-height: 1.45;
}

.type {
  color: var(--muted);
  font-weight: 400;
}

.text {
  margin: 0 0 1rem;
  color: var(--muted);
}

.link {
  display: inline-block;
  padding: 0.5rem 0;
  margin: -0.5rem 0;
}

.arrow {
  display: inline-block;
  margin-left: 0.375rem;
  vertical-align: 0.05em;
}

.try .tag {
  margin: 0 0 1rem;
}

.send {
  min-width: 9rem;
  justify-content: center;
}

.arc-small {
  width: 1rem;
  height: 1rem;
}

.tick path {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.credit {
  max-width: 40rem;
  margin: 1.25rem 0 0;
  color: var(--muted);
  font-size: 0.875rem;
}
</style>
