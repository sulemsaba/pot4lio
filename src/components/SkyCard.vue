<template>
  <div class="card sky" :class="[`sky--${parts.period}`, { calm }]">
    <!-- The sky: the sun (or moon) on its arc across the day. -->
    <div class="scene" aria-hidden="true">
      <template v-if="parts.period === 'night'">
        <span v-for="star in stars" :key="star.id" class="star" :style="star.style"></span>
      </template>
      <template v-else>
        <span class="cloud cloud--a"></span>
        <span class="cloud cloud--b"></span>
      </template>
      <svg class="arc" viewBox="0 0 100 50" preserveAspectRatio="none">
        <path d="M6 48 Q50 -14 94 48" />
      </svg>
      <span class="body" :class="isDay ? 'sun' : 'moon'" :style="bodyStyle"></span>
    </div>

    <div class="readout">
      <h2 class="tag title swap">{{ t.skyTitle }}</h2>
      <p class="digits">
        <time :datetime="`${parts.hh}:${parts.mm}`">{{ parts.hh }}<span class="colon">:</span>{{ parts.mm }}</time>
      </p>
      <p class="note swap">{{ t.periods[parts.period] }} · UTC+3</p>
      <p class="note">
        <span class="swap">{{ t.swahiliTime }}:</span>{{ ' ' }}<span lang="sw" class="nowrap"
          >saa {{ parts.swahiliHour }}:{{ parts.mm }} {{ swahiliPeriod }}</span
        >
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { copy } from '../content.js'
import { useWallTime } from '../darTime.js'

const props = defineProps({
  timeZone: { type: String, required: true },
  t: { type: Object, required: true },
})

const { parts } = useWallTime(props.timeZone)
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Swahili time is always said with its Swahili part of the day: saa 5:30 asubuhi.
const swahiliPeriod = computed(() => copy.sw.periods[parts.value.period].toLowerCase())

// Near the equator the day barely changes: sunrise about 6:30, sunset about 18:40.
const SUNRISE = 6 * 60 + 30
const SUNSET = 18 * 60 + 40
const isDay = computed(() => parts.value.minutes >= SUNRISE && parts.value.minutes < SUNSET)

const bodyStyle = computed(() => {
  const m = parts.value.minutes
  let progress
  if (isDay.value) progress = (m - SUNRISE) / (SUNSET - SUNRISE)
  else {
    const night = 24 * 60 - SUNSET + SUNRISE
    progress = (m >= SUNSET ? m - SUNSET : m + 24 * 60 - SUNSET) / night
  }
  // The same curve as the dashed arc: a quadratic from (6, 48) over (50, -14) to (94, 48),
  // drawn in a 100 by 50 box that fills the top 62% of the card.
  const x = 6 + 88 * progress
  const y = (48 - 124 * progress * (1 - progress)) * (62 / 50)
  return { left: `${x}%`, top: `${y}%` }
})

// A fixed scatter of stars, the same on every visit.
const stars = Array.from({ length: 14 }, (_, i) => {
  const x = (i * 37 + 11) % 97
  const y = (i * 23 + 7) % 55
  return { id: i, style: { left: `${x}%`, top: `${y}%`, animationDelay: `${(i % 5) * 0.7}s` } }
})
</script>

<style scoped>
.sky {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 14rem;
  overflow: hidden;
  isolation: isolate;
  color: var(--sky-text);
  background: linear-gradient(180deg, var(--sky-top), var(--sky-bottom));
}

/* The sky through the day in Dar es Salaam. */
.sky--dawn {
  --sky-top: #33406f;
  --sky-bottom: #f4b49e;
  --sky-text: #2a1830;
}

.sky--morning {
  --sky-top: #2b9cf0;
  --sky-bottom: #c4e8fd;
  --sky-text: #04324c;
}

.sky--afternoon {
  --sky-top: #0590e6;
  --sky-bottom: #94d8ff;
  --sky-text: #04324c;
}

.sky--evening {
  --sky-top: #6c5ca8;
  --sky-bottom: #f7a96e;
  --sky-text: #2a1408;
}

.sky--night {
  --sky-top: #060b20;
  --sky-bottom: #1c2c5f;
  --sky-text: #f2f4ff;
}

/* Dark theme: the same sky, deeper, with white text. */
:root[data-theme='dark'] .sky--dawn {
  --sky-top: #1c2350;
  --sky-bottom: #7d4d62;
  --sky-text: #fff;
}

:root[data-theme='dark'] .sky--morning {
  --sky-top: #0a3d6e;
  --sky-bottom: #165c93;
  --sky-text: #fff;
}

:root[data-theme='dark'] .sky--afternoon {
  --sky-top: #064c85;
  --sky-bottom: #135f9a;
  --sky-text: #fff;
}

:root[data-theme='dark'] .sky--evening {
  --sky-top: #2a2150;
  --sky-bottom: #8c4733;
  --sky-text: #fff;
}

:root[data-theme='dark'] .cloud {
  background: rgb(255 255 255 / 0.32);
}

:root[data-theme='dark'] .arc path {
  stroke: rgb(255 255 255 / 0.3);
}

.scene {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.arc {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 62%;
  overflow: visible;
}

.arc path {
  fill: none;
  stroke: rgb(255 255 255 / 0.55);
  stroke-width: 1;
  stroke-dasharray: 2 3;
  vector-effect: non-scaling-stroke;
}

.body {
  position: absolute;
  width: 2.5rem;
  height: 2.5rem;
  margin: -1.25rem 0 0 -1.25rem;
  border-radius: 50%;
}

.sun {
  background: radial-gradient(circle at 40% 38%, #fffbe0, #ffd84a 55%, #ffb627);
  box-shadow:
    0 0 0 0.5rem rgb(255 216 74 / 0.22),
    0 0 2.5rem 0.5rem rgb(255 205 60 / 0.55);
}

.moon {
  width: 2.125rem;
  height: 2.125rem;
  background: #f3efe0;
  box-shadow:
    inset -0.55rem -0.2rem 0 0 #c9c3ad,
    0 0 1.75rem 0.25rem rgb(243 239 224 / 0.25);
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: #fff;
  opacity: 0.8;
  animation: twinkle 3.2s ease-in-out infinite;
}

.cloud {
  position: absolute;
  height: 1.25rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.75);
  filter: blur(0.5px);
  animation: drift 38s linear infinite;
}

.cloud::before {
  content: '';
  position: absolute;
  left: 22%;
  bottom: 40%;
  width: 45%;
  height: 130%;
  border-radius: 999px;
  background: inherit;
}

.cloud--a {
  top: 18%;
  left: 12%;
  width: 4.5rem;
}

.cloud--b {
  top: 34%;
  left: 58%;
  width: 3.25rem;
  opacity: 0.8;
  animation-duration: 52s;
  animation-delay: -20s;
}

@keyframes drift {
  from {
    translate: -2rem 0;
  }
  to {
    translate: 2rem 0;
  }
}

@keyframes twinkle {
  50% {
    opacity: 0.25;
  }
}

/* The readout sits low, where the sky is calmest. */
.readout {
  position: relative;
}

.title {
  color: inherit;
  opacity: 0.8;
}

.digits {
  margin: 0.125rem 0 0;
  font-size: clamp(2.25rem, 1.8rem + 1.4vw, 3rem);
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.035em;
  font-variant-numeric: tabular-nums;
}

.colon {
  animation: blink 2s steps(1) infinite;
}

@keyframes blink {
  50% {
    opacity: 0.3;
  }
}

.note {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  opacity: 0.85;
}

.digits + .note {
  margin-top: 0.375rem;
}

.nowrap {
  white-space: nowrap;
}

.calm .cloud,
.calm .star,
.calm .colon {
  animation: none;
}
</style>
