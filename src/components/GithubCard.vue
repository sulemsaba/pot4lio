<template>
  <div v-if="profile.links.github" class="card github">
    <div class="head">
      <img class="avatar" :src="profile.photo" width="44" height="44" alt="" loading="lazy" decoding="async" />
      <p class="who">
        <strong>{{ profile.name }}</strong>
        <span>@{{ handle }}</span>
      </p>
      <span class="mark" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 16 16">
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
      </span>
    </div>

    <p class="line swap">{{ t.githubLine }}</p>

    <a class="button" :href="profile.links.github" target="_blank" rel="noopener noreferrer">
      <span class="swap">{{ t.githubButton }}</span>
      <span class="visually-hidden"> ({{ t.opensNewTab }})</span>
      <ArrowIcon />
    </a>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ArrowIcon from './ArrowIcon.vue'

const props = defineProps({
  profile: { type: Object, required: true },
  t: { type: Object, required: true },
})

const handle = computed(() => props.profile.links.github.replace(/\/$/, '').split('/').pop())
</script>

<style scoped>
.github {
  background: var(--ink);
  color: var(--bg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
}

/* Dark theme: deep ocean instead of a white glare. */
:root[data-theme='dark'] .github {
  background: linear-gradient(155deg, #10395a, #0a1a28 70%);
  color: #e6f4fd;
}

:root[data-theme='dark'] .github .mark {
  background: #e6f4fd;
  color: #0a1a28;
}

:root[data-theme='dark'] .github .who span {
  color: rgb(230 244 253 / 0.7);
}

:root[data-theme='dark'] .github .button {
  border-color: rgb(230 244 253 / 0.28);
}

:root[data-theme='dark'] .github .button:hover {
  border-color: #e6f4fd;
}

.head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  object-fit: cover;
}

.who {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin: 0;
  line-height: 1.3;
}

.who strong {
  overflow: hidden;
  font-weight: 600;
  font-size: 0.9375rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.who span {
  color: color-mix(in srgb, var(--bg) 68%, transparent);
  font-size: 0.875rem;
}

.mark {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  background: var(--bg);
  color: var(--ink);
}

.mark path {
  fill: currentColor;
}

.line {
  margin: 0;
  font-size: clamp(1.125rem, 1rem + 0.5vw, 1.375rem);
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: -0.015em;
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 2.75rem;
  border: 1.5px solid color-mix(in srgb, var(--bg) 30%, transparent);
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  transition: border-color 0.25s ease;
}

.button:hover {
  border-color: var(--bg);
}
</style>
