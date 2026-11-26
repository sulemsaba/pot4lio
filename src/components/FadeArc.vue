<template>
  <svg
    class="fade-arc"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="status"
    :aria-label="label || null"
    :aria-hidden="label ? null : 'true'"
    :style="{ '--duration': duration }"
  >
    <defs>
      <linearGradient :id="lead" x1="50%" x2="50%" y1="5.271%" y2="91.793%">
        <stop offset="0%" stop-color="currentColor" />
        <stop offset="100%" stop-color="currentColor" stop-opacity="0.55" />
      </linearGradient>
      <linearGradient :id="trail" x1="50%" x2="50%" y1="15.24%" y2="87.15%">
        <stop offset="0%" stop-color="currentColor" stop-opacity="0" />
        <stop offset="100%" stop-color="currentColor" stop-opacity="0.55" />
      </linearGradient>
    </defs>
    <g fill="none">
      <path
        d="M8.749.021a1.5 1.5 0 0 1 .497 2.958A7.5 7.5 0 0 0 3 10.375a7.5 7.5 0 0 0 7.5 7.5v3c-5.799 0-10.5-4.7-10.5-10.5C0 5.23 3.726.865 8.749.021"
        :fill="`url(#${lead})`"
        transform="translate(1.5 1.625)"
      />
      <path
        d="M15.392 2.673a1.5 1.5 0 0 1 2.119-.115A10.48 10.48 0 0 1 21 10.375c0 5.8-4.701 10.5-10.5 10.5v-3a7.5 7.5 0 0 0 5.007-13.084a1.5 1.5 0 0 1-.115-2.118"
        :fill="`url(#${trail})`"
        transform="translate(1.5 1.625)"
      />
    </g>
  </svg>
</template>

<script setup>
import { useId } from 'vue'

// Fade Arc: a loading spinner whose tail fades away as it turns. Suleiman's loader,
// contributed to DesignBookmark; rebuilt here in Vue from his React version.
defineProps({
  duration: { type: String, default: '1s' }, // one full turn
  label: { type: String, default: '' }, // read out while it spins; empty when the words around it already say so
})

const id = useId().replace(/[^a-zA-Z0-9-]/g, '-')
const lead = `${id}-leading`
const trail = `${id}-trailing`
</script>

<style scoped>
.fade-arc {
  animation: fade-arc-spin var(--duration, 1s) linear infinite;
}

@keyframes fade-arc-spin {
  to {
    transform: rotate(360deg);
  }
}

/* A loader still has to show that something is happening, so it slows down
   instead of stopping. */
@media (prefers-reduced-motion: reduce) {
  .fade-arc {
    animation-duration: calc(var(--duration, 1s) * 3);
  }
}
</style>
