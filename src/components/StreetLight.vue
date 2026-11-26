<template>
  <div class="street-light" :class="{ on: theme === 'dark' }" aria-hidden="true">
    <!-- A road light: a tapered steel pole on a base plate, curving at the top into a
         long arm with a flat lamp head. It stands behind the grass, so the front blades
         grow over its foot. -->
    <svg class="post" viewBox="0 0 140 400" preserveAspectRatio="xMidYMax meet" focusable="false">
      <defs>
        <linearGradient id="road-light-steel" x1="0" y1="0" x2="1" y2="0">
          <stop class="steel-lo" offset="0" />
          <stop class="steel-hi" offset="0.38" />
          <stop class="steel-lo" offset="1" />
        </linearGradient>
        <linearGradient id="road-light-head" x1="0" y1="0" x2="0" y2="1">
          <stop class="head-hi" offset="0" />
          <stop class="head-lo" offset="1" />
        </linearGradient>
      </defs>

      <!-- base plate and sleeve -->
      <rect class="base" x="97" y="392" width="26" height="8" rx="1.5" />
      <rect x="100.5" y="368" width="19" height="26" rx="2.5" fill="url(#road-light-steel)" />
      <rect class="seam" x="100.5" y="368" width="19" height="2" rx="1" />

      <!-- the pole, narrowing toward the top -->
      <path d="M103.6 370 L107.6 84 L112.4 84 L116.4 370 Z" fill="url(#road-light-steel)" />
      <!-- a small service door near the foot -->
      <rect class="door" x="107" y="318" width="6" height="18" rx="1.2" />

      <!-- the curve into the arm -->
      <path class="arm" d="M110 90 C 110 52, 101 38, 80 35.4 L 50 31.6" />
      <path class="arm-hi" d="M108.6 88 C 108.6 54, 100 40.4, 80 37.6" />

      <!-- the lamp head and its lens underneath -->
      <path
        d="M54 27.6 C 42 23.6, 20 24, 7 30.8 C 4.4 32.2, 4.8 35.6, 8.2 35.8 L 51 37.4 C 55.6 37.6, 57.4 30.2, 54 27.6 Z"
        fill="url(#road-light-head)"
      />
      <path class="lens" d="M11 35.9 L 48.5 37.2" />
    </svg>

    <!-- The light it throws at night, laid over the grass so the blades under it glow. -->
    <svg class="glow" viewBox="0 0 140 400" preserveAspectRatio="xMidYMax meet" focusable="false">
      <defs>
        <linearGradient id="road-light-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffe9b0" stop-opacity="0.5" />
          <stop offset="0.65" stop-color="#ffe9b0" stop-opacity="0.14" />
          <stop offset="1" stop-color="#ffe9b0" stop-opacity="0.07" />
        </linearGradient>
        <radialGradient id="road-light-pool" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stop-color="#ffe2a0" stop-opacity="0.65" />
          <stop offset="1" stop-color="#ffe2a0" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="road-light-bulb" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stop-color="#fff6d8" stop-opacity="1" />
          <stop offset="1" stop-color="#fff6d8" stop-opacity="0" />
        </radialGradient>
      </defs>
      <g class="light">
        <path d="M10 36.5 L49 37.8 L132 400 L-120 400 Z" fill="url(#road-light-beam)" />
        <ellipse cx="24" cy="397" rx="128" ry="28" fill="url(#road-light-pool)" />
        <ellipse cx="29.5" cy="37" rx="28" ry="9" fill="url(#road-light-bulb)" />
        <path d="M11 35.9 L 48.5 37.2" stroke="#fffaf0" stroke-width="2.6" stroke-linecap="round" />
      </g>
    </svg>
  </div>
</template>

<script setup>
import { theme } from '../theme.js'
</script>

<style scoped>
/* A road light at the right end of the grass. By day it is off; at night it flickers
   on and lights the grass below its arm. */
.street-light {
  --steel-lo: #9aa1ab;
  --steel-hi: #e4e7eb;
  --head-hi: #6f7782;
  --head-lo: #474d56;
  --lens: #d6dae0;
  position: absolute;
  right: calc(50% - 50vw + 1vw); /* near the right edge of the screen */
  bottom: 0;
  height: calc(100% + 14rem);
  aspect-ratio: 140 / 400;
  pointer-events: none;
}

:root[data-theme='dark'] .street-light {
  --steel-lo: #3c4149;
  --steel-hi: #6a717b;
  --head-hi: #4b525c;
  --head-lo: #2c3037;
  --lens: #8b919a;
}

svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* Behind the grass, which sits at z-index 1; the light goes over it. */
.post {
  z-index: 0;
}

.glow {
  z-index: 2;
  mix-blend-mode: screen;
}

.steel-lo {
  stop-color: var(--steel-lo);
}

.steel-hi {
  stop-color: var(--steel-hi);
}

.head-hi {
  stop-color: var(--head-hi);
}

.head-lo {
  stop-color: var(--head-lo);
}

.base {
  fill: var(--head-lo);
}

.seam {
  fill: var(--steel-lo);
  opacity: 0.8;
}

.door {
  fill: none;
  stroke: var(--steel-lo);
  stroke-width: 0.9;
}

.arm {
  fill: none;
  stroke: var(--steel-lo);
  stroke-width: 4.6;
  stroke-linecap: round;
}

.arm-hi {
  fill: none;
  stroke: var(--steel-hi);
  stroke-width: 1.2;
  stroke-linecap: round;
  opacity: 0.8;
}

.lens {
  stroke: var(--lens);
  stroke-width: 2.6;
  stroke-linecap: round;
}

.light {
  opacity: 0;
}

.on .light {
  opacity: 1;
}

/* Night: it flickers on, like a real lamp warming up. */
@media (prefers-reduced-motion: no-preference) {
  .on .light {
    animation: switch-on 1.1s steps(1, end) both;
  }
}

@keyframes switch-on {
  0% {
    opacity: 0;
  }
  18% {
    opacity: 0.7;
  }
  26% {
    opacity: 0.1;
  }
  40% {
    opacity: 0.85;
  }
  48% {
    opacity: 0.3;
  }
  62%,
  100% {
    opacity: 1;
  }
}

/* Phones: not quite as tall, so it stays below the buttons above the grass. */
@media (max-width: 40rem) {
  .street-light {
    right: calc(50% - 50vw);
    height: calc(100% + 8.25rem);
  }
}
</style>
