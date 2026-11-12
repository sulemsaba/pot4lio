<template>
  <ul class="projects" :class="{ 'can-hover': canHover }">
    <li
      v-for="(project, index) in projects"
      :key="project.id"
      class="project"
      :class="{ open: isOpen(project.id) }"
      :style="{ '--i': index }"
    >
      <h3 class="project-heading">
        <button
          :id="`project-${project.id}`"
          type="button"
          class="project-row"
          :aria-expanded="String(isOpen(project.id))"
          :aria-controls="`panel-${project.id}`"
          @click="toggle(project.id)"
          @pointerenter="showPreview(project, $event)"
          @pointermove="movePreview"
          @pointerleave="hidePreview"
        >
          <span class="project-name">{{ project.name }}</span>
          <span class="project-type swap">{{ project.type[lang] }}</span>
          <svg class="toggle" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path class="toggle-h" d="M1 6h10" />
            <path class="toggle-v" d="M6 1v10" />
          </svg>
        </button>
      </h3>

      <div
        :id="`panel-${project.id}`"
        class="panel"
        role="region"
        :aria-labelledby="`project-${project.id}`"
        :inert="isOpen(project.id) ? null : ''"
      >
        <div class="panel-clip">
          <div class="panel-body">
            <p class="summary swap">{{ project.summary[lang] }}</p>
            <p v-if="project.status[lang]" class="status swap">{{ project.status[lang] }}</p>

            <div v-if="loaded.has(project.id)" class="shots" :class="`shots--${project.layout}`">
              <img
                v-for="(image, n) in project.images"
                :key="image.src"
                :src="image.src"
                :width="image.w"
                :height="image.h"
                :alt="image.alt[lang]"
                :style="{ '--j': n }"
                decoding="async"
              />
            </div>

            <a v-if="project.url" class="visit" :href="project.url" target="_blank" rel="noopener noreferrer"
              ><span class="swap">{{ t.visit }}</span> {{ hostOf(project.url)
              }}<span class="visually-hidden"> ({{ t.opensNewTab }})</span><ArrowIcon class="visit-arrow"
            /></a>
          </div>
        </div>
      </div>
    </li>
  </ul>

  <Teleport to="body">
    <div
      v-if="canHover"
      ref="previewEl"
      class="preview"
      :class="[`preview--${preview.layout}`, { on: preview.visible }]"
      aria-hidden="true"
    >
      <img v-if="preview.src" :src="preview.src" alt="" decoding="async" />
    </div>
  </Teleport>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import ArrowIcon from './ArrowIcon.vue'

const props = defineProps({
  projects: { type: Array, required: true },
  lang: { type: String, required: true },
  t: { type: Object, required: true },
})

// Which rows are open, and which have ever been opened. Images only load
// after a row is opened for the first time, to keep the first visit light.
const open = reactive(new Set())
const loaded = reactive(new Set())

const isOpen = (id) => open.has(id)

function toggle(id) {
  if (open.has(id)) {
    open.delete(id)
  } else {
    open.add(id)
    loaded.add(id)
  }
  hidePreview()
}

const hostOf = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

// A link ending in #ligiplay (or any project id) opens that project.
onMounted(() => {
  const id = decodeURIComponent(window.location.hash.slice(1))
  if (!props.projects.some((project) => project.id === id)) return
  open.add(id)
  loaded.add(id)
  nextTick(() => document.getElementById(`project-${id}`)?.scrollIntoView({ block: 'start', behavior: 'instant' }))
})

// Desktop only: a small preview of the work follows the cursor over the list.
const media = (q) => typeof window !== 'undefined' && window.matchMedia(q).matches
const canHover = media('(hover: hover) and (pointer: fine)') && !media('(prefers-reduced-motion: reduce)')

const previewEl = ref(null)
const preview = reactive({ visible: false, src: '', layout: 'browser' })
const SIZES = { phones: [150, 267], browser: [288, 180], banner: [288, 141] }
let x = 0
let y = 0
let targetX = 0
let targetY = 0
let frame = 0

function showPreview(project, event) {
  if (!canHover || open.has(project.id)) return
  preview.src = project.images[0].src
  preview.layout = project.layout
  targetX = event.clientX
  targetY = event.clientY
  if (!preview.visible) {
    x = targetX
    y = targetY
  }
  preview.visible = true
  follow()
}

function movePreview(event) {
  targetX = event.clientX
  targetY = event.clientY
}

function hidePreview() {
  preview.visible = false
}

function follow() {
  cancelAnimationFrame(frame)
  const step = () => {
    x += (targetX - x) * 0.16
    y += (targetY - y) * 0.16
    const [w, h] = SIZES[preview.layout]
    const left = Math.min(x + 28, window.innerWidth - w - 16)
    const top = Math.max(16, Math.min(y - h / 2, window.innerHeight - h - 16))
    if (previewEl.value) previewEl.value.style.transform = `translate3d(${left}px, ${top}px, 0)`
    const settling = Math.abs(targetX - x) > 0.3 || Math.abs(targetY - y) > 0.3
    if (preview.visible || settling) frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
}

onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<style scoped>
.projects {
  list-style: none;
  margin: 0;
  padding: 0;
}

.project {
  border-top: 1px solid var(--line);
}

.project:last-child {
  border-bottom: 1px solid var(--line);
}

.project-heading {
  margin: 0;
  font: inherit;
}

.project-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 0.75rem;
  align-items: center;
  gap: 1rem;
  width: 100%;
  min-height: 3rem;
  padding: 0.75rem 0;
  scroll-margin-top: 1.5rem;
  border: 0;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: color 0.25s ease;
}

.project-name {
  font-weight: 500;
}

.project-type {
  color: var(--muted);
  font-size: 0.9375rem;
}

/* On desktop, the rows you are not pointing at step back. */
.can-hover:hover .project-row:not(:hover),
.can-hover:hover .project-row:not(:hover) .project-type {
  color: var(--muted);
}

.toggle {
  color: var(--muted);
  overflow: visible;
}

.toggle path {
  stroke: currentColor;
  stroke-width: 1.4;
  stroke-linecap: round;
}

.toggle-v {
  transform-origin: 6px 6px;
  transition: transform 0.4s var(--ease-out);
}

.open .toggle-v {
  transform: rotate(90deg);
}

.project-row:hover .toggle,
.open .toggle {
  color: var(--ink);
}

/* Unfolding panel: the grid row grows from 0 to its natural height. */
.panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.32s var(--ease-in);
}

.open .panel {
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.55s var(--ease-out);
}

.panel-clip {
  min-height: 0;
  overflow: hidden;
}

.panel-body {
  padding: 0 0 1.75rem;
  opacity: 0;
  transition: opacity 0.18s ease;
}

.open .panel-body {
  opacity: 1;
  transition: opacity 0.4s ease 0.08s;
}

.summary {
  max-width: 34rem;
  margin: 0;
  color: var(--muted);
}

.status {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: var(--muted);
}

.shots {
  margin-top: 1.25rem;
}

.shots img {
  width: 100%;
  background: var(--soft);
}

.shots--phones {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(7.5rem, 1fr);
  gap: 0.75rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 0.5rem;
  margin-bottom: -0.5rem;
}

.shots--phones img {
  aspect-ratio: 9 / 16;
  object-fit: cover;
  border-radius: 10px;
  scroll-snap-align: start;
}

.shots--browser img,
.shots--banner img {
  border-radius: 8px;
  border: 1px solid var(--line);
}

@media (prefers-reduced-motion: no-preference) {
  .open .shots img {
    animation: shot-in 0.7s var(--ease-out) backwards;
    animation-delay: calc(var(--j, 0) * 70ms + 140ms);
  }
}

@keyframes shot-in {
  from {
    opacity: 0;
    transform: translate3d(0, 0.9rem, 0) scale(0.985);
    filter: blur(4px);
  }
}

.visit {
  display: inline-block;
  margin-top: 0.75rem;
  padding: 0.6rem 0;
}

.visit-arrow {
  display: inline-block;
  margin-left: 0.375rem;
  vertical-align: 0.05em;
}

/* Cursor preview (desktop). */
.preview {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 20;
  overflow: hidden;
  border-radius: 8px;
  background: var(--soft);
  box-shadow: var(--shadow);
  pointer-events: none;
  opacity: 0;
  scale: 0.94;
  transition:
    opacity 0.2s ease,
    scale 0.45s var(--ease-out);
  will-change: transform;
}

.preview.on {
  opacity: 1;
  scale: 1;
}

.preview--phones {
  width: 150px;
  height: 267px;
}

.preview--browser {
  width: 288px;
  height: 180px;
}

.preview--banner {
  width: 288px;
  height: 141px;
}

.preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
