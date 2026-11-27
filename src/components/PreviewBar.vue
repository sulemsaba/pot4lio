<template>
  <aside v-if="preview.on && !preview.framed" class="preview-bar" aria-label="Draft preview">
    <span class="dot" aria-hidden="true"></span>
    <span class="text">Draft preview<span class="when" v-if="saved">, saved {{ saved }}</span></span>
    <a class="link" href="./admin/">Back to admin</a>
    <a class="link" :href="exitHref">Exit</a>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { preview } from '../site.js'

// Shown only to the site's owner, in preview mode (opened from the admin page). Visitors
// never have a draft, so they never see it.
const saved = computed(() =>
  preview.savedAt ? new Date(preview.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
)
const exitHref = computed(() => {
  const url = new URL(window.location.href)
  url.searchParams.delete('preview')
  return url.pathname + url.search + url.hash
})
</script>

<style scoped>
.preview-bar {
  position: fixed;
  left: 50%;
  bottom: max(1rem, env(safe-area-inset-bottom));
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  max-width: calc(100vw - 2rem);
  padding: 0.5rem 0.625rem 0.5rem 0.875rem;
  border-radius: 999px;
  background: var(--ink);
  color: var(--bg);
  font-size: 0.875rem;
  box-shadow: var(--lift);
  transform: translateX(-50%);
}
.dot {
  width: 0.5rem;
  height: 0.5rem;
  flex: none;
  border-radius: 50%;
  background: #ffb020;
}
.text {
  white-space: nowrap;
  font-weight: 600;
}
.when {
  font-weight: 400;
  opacity: 0.7;
}
.link {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg) 16%, transparent);
  color: inherit;
  white-space: nowrap;
  text-decoration: none;
}
.link:hover {
  background: color-mix(in srgb, var(--bg) 28%, transparent);
}
@media (max-width: 30rem) {
  .when {
    display: none;
  }
}
</style>
