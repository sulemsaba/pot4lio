<template>
  <a class="card cv" href="#/cv">
    <span class="cv-head">
      <span class="cv-title swap">{{ t.cvTitle }}</span>
      <span class="cv-meta swap">{{ t.cvMeta }}</span>
    </span>
    <img
      v-if="profile.links.cvPreview"
      class="cv-paper"
      :src="profile.links.cvPreview"
      width="560"
      height="793"
      alt=""
      loading="lazy"
      decoding="async"
    />
    <span class="cv-action">
      <span class="swap">{{ t.readCv }}</span>
      <ArrowIcon />
    </span>
  </a>
</template>

<script setup>
import ArrowIcon from './ArrowIcon.vue'

defineProps({
  profile: { type: Object, required: true },
  t: { type: Object, required: true },
})
</script>

<style scoped>
/* The CV: a page you can pick up. */
.cv {
  background: var(--sand-bg);
  color: var(--sand-ink);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  isolation: isolate;
}

.cv-head,
.cv-action {
  position: relative;
  z-index: 1;
}

.cv-head {
  display: flex;
  flex-direction: column;
  max-width: 52%;
}

.cv-title {
  font-weight: 600;
}

.cv-meta {
  opacity: 0.8;
  font-size: 0.875rem;
}

.cv-action {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 0.4rem;
  padding: 0.5rem 0.875rem;
  border-radius: 999px;
  background: var(--bg);
  box-shadow: 0 0 0 1px var(--line);
  font-size: 0.875rem;
  font-weight: 500;
  transition: box-shadow 0.25s ease;
}

.cv-paper {
  position: absolute;
  right: -4%;
  bottom: -26%;
  width: clamp(8rem, 50%, 12rem);
  border-radius: 3px;
  box-shadow:
    0 0 0 1px rgb(0 0 0 / 0.05),
    0 1.25rem 2.25rem -0.75rem rgb(17 17 17 / 0.3);
  transform: rotate(-7deg);
  transform-origin: 70% 100%;
  transition:
    transform 0.7s var(--ease-out),
    box-shadow 0.7s var(--ease-out);
}

.cv:hover .cv-paper,
.cv:focus-visible .cv-paper {
  transform: rotate(-2deg) translate3d(0, -0.9rem, 0);
  box-shadow:
    0 0 0 1px rgb(0 0 0 / 0.05),
    0 1.75rem 2.75rem -0.75rem rgb(17 17 17 / 0.34);
}

.cv:hover .cv-action,
.cv:focus-visible .cv-action {
  box-shadow: 0 0 0 1px var(--ink);
}

@media (prefers-reduced-motion: reduce) {
  .cv-paper {
    transition: none;
  }
}
</style>
