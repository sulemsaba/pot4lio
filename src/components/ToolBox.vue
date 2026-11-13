<template>
  <section ref="box" class="card toolbox" :class="{ lit }" aria-labelledby="tools-title">
    <h2 id="tools-title" class="tag swap">{{ t.tools }}</h2>
    <div class="groups">
      <div v-for="group in numbered" :key="group.name.en" class="group">
        <h3 class="group-name swap">{{ group.name[lang] }}</h3>
        <ul class="tools">
          <li
            v-for="tool in group.tools"
            :key="tool.name"
            class="tool"
            :style="{ '--brand': tool.hex || 'var(--ink)', '--on': tool.on || 'var(--bg)', '--n': tool.n }"
          >
            <span class="mark">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  v-if="tool.stroke"
                  :d="tool.path"
                  fill="none"
                  stroke="currentColor"
                  :stroke-width="tool.stroke"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path v-else :d="tool.path" fill="currentColor" />
              </svg>
            </span>
            <span class="tool-name">{{ tool.name }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { toolGroups } from '../tools.js'

defineProps({
  lang: { type: String, required: true },
  t: { type: Object, required: true },
})

// The logos sit in plain ink. The first time the card comes into view, a wave of
// colour runs through them, one after another, so phones (with no hover) see it too.
// After that a tile lights up in its own colour when the pointer is on it.
let count = 0
const numbered = toolGroups.map((group) => ({ ...group, tools: group.tools.map((tool) => ({ ...tool, n: count++ })) }))

const box = ref(null)
const lit = ref(false)
let observer = null

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      lit.value = true
      observer.disconnect()
    },
    // Once its top edge is a fifth of the way up the screen; works for a card taller than the screen too.
    { rootMargin: '0px 0px -20% 0px' },
  )
  observer.observe(box.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<style scoped>
.groups {
  display: grid;
  gap: 1.75rem;
  margin-top: 1rem;
}

@media (min-width: 60rem) {
  .groups {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: 2.5rem;
  }
}

.group-name {
  margin: 0 0 0.875rem;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.4;
}

.tools {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(4.25rem, 1fr));
  gap: 1rem 0.625rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.tool {
  display: grid;
  justify-items: center;
  align-content: start;
  gap: 0.5rem;
  min-width: 0;
}

.mark {
  display: grid;
  place-items: center;
  width: 100%;
  max-width: 4.25rem;
  aspect-ratio: 1;
  border-radius: 28%;
  background: var(--paper);
  box-shadow: inset 0 0 0 1px var(--line);
  color: var(--ink);
  transition:
    background-color 0.25s var(--ease-out),
    color 0.25s var(--ease-out),
    box-shadow 0.25s var(--ease-out),
    transform 0.35s var(--ease-out);
}

.mark svg {
  display: block;
  width: 44%;
  height: 44%;
}

.tool-name {
  max-width: 100%;
  font-size: 0.8125rem;
  line-height: 1.25;
  text-align: center;
  overflow-wrap: anywhere;
}

@media (hover: hover) {
  .tool:hover .mark {
    background: var(--brand);
    box-shadow: inset 0 0 0 1px transparent, var(--lift);
    color: var(--on);
    transform: translateY(-0.1875rem);
  }
}

/* The wave of colour, once, as the card arrives. */
.lit .mark {
  animation: flash 1.1s var(--ease-out) calc(var(--n) * 55ms + 0.15s) backwards;
}

@keyframes flash {
  0%,
  100% {
    background: var(--paper);
    color: var(--ink);
  }
  28%,
  42% {
    background: var(--brand);
    color: var(--on);
  }
}

:root[data-theme='dark'] .mark {
  background: rgb(255 255 255 / 0.04);
}

:root[data-theme='dark'] .lit .mark {
  animation-name: flash-dark;
}

@keyframes flash-dark {
  0%,
  100% {
    background: rgb(255 255 255 / 0.04);
    color: var(--ink);
  }
  28%,
  42% {
    background: var(--brand);
    color: var(--on);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mark {
    transition: none;
  }

  .tool:hover .mark {
    transform: none;
  }
}
</style>
