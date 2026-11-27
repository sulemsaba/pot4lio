<template>
  <aside class="preview" aria-label="Preview">
    <div class="bar">
      <span class="title">Preview <span class="muted">draft</span></span>
      <div class="seg" role="radiogroup" aria-label="Screen">
        <button type="button" role="radio" :aria-checked="String(device === 'phone')" aria-label="Phone" title="Phone" @click="device = 'phone'"><Icon name="phone" :size="16" /></button>
        <button type="button" role="radio" :aria-checked="String(device === 'desktop')" aria-label="Desktop" title="Desktop" @click="device = 'desktop'"><Icon name="desktop" :size="16" /></button>
      </div>
      <button type="button" class="icon-btn" aria-label="Reload the preview" title="Reload" @click="reload"><Icon name="refresh" :size="16" /></button>
      <a class="icon-btn" :href="src" target="_blank" rel="noopener" aria-label="Open the preview in a new tab" title="Open in a new tab"><Icon name="external" :size="16" /></a>
      <button type="button" class="icon-btn" aria-label="Close the preview" title="Close" @click="$emit('close')"><Icon name="close" :size="16" /></button>
    </div>
    <div ref="stage" class="stage" :class="`is-${device}`">
      <div class="frame-box" :style="boxStyle">
        <iframe ref="frame" :key="nonce" :src="src" title="Preview of the site with your draft" :style="frameStyle"></iframe>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Icon from './Icon.vue'

// The site itself, with your draft, beside the editor. It follows every edit as you type
// (the site listens for draft changes), and moves to the page you are editing.
const props = defineProps({ route: { type: String, default: '' } })
defineEmits(['close'])

const device = ref('phone')
const nonce = ref(0)
const stage = ref(null)
const frame = ref(null)
const size = ref({ w: 400, h: 700 })
const start = ref(props.route)
const src = computed(() => `../?preview#/${start.value}`)

const W = computed(() => (device.value === 'phone' ? 390 : 1280))
const scale = computed(() => Math.min(1, (size.value.w - 24) / W.value))
const H = computed(() => Math.max(480, (size.value.h - 24) / scale.value))
const boxStyle = computed(() => ({ width: `${W.value * scale.value}px`, height: `${H.value * scale.value}px` }))
const frameStyle = computed(() => ({ width: `${W.value}px`, height: `${H.value}px`, transform: `scale(${scale.value})` }))

// Same site, same browser: moving between pages is just a new address after #.
watch(
  () => props.route,
  (route) => {
    try {
      frame.value.contentWindow.location.hash = `#/${route}`
    } catch {
      start.value = route
    }
  },
)

function reload() {
  start.value = props.route
  nonce.value++
}

let observer
onMounted(() => {
  observer = new ResizeObserver(([entry]) => (size.value = { w: entry.contentRect.width, h: entry.contentRect.height }))
  observer.observe(stage.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<style scoped>
.preview {
  position: sticky;
  top: var(--bar);
  display: grid;
  grid-template-rows: auto 1fr;
  height: calc(100dvh - var(--bar));
  border-left: 1px solid var(--line);
  background: var(--panel);
}
.bar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.5rem 0.5rem 1rem;
  border-bottom: 1px solid var(--line);
}
.title {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 650;
}
.muted {
  color: var(--faint);
  font-weight: 500;
}
.seg {
  display: inline-flex;
  padding: 0.125rem;
  border-radius: var(--r-sm);
  background: var(--hover);
}
.seg button {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 1.75rem;
  border: 0;
  border-radius: 0.3125rem;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
}
.seg button[aria-checked='true'] {
  background: var(--bg);
  color: var(--ink);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.12);
}
.stage {
  display: grid;
  justify-items: center;
  align-items: start;
  min-height: 0;
  padding: 0.75rem;
  overflow: hidden;
}
.frame-box {
  overflow: hidden;
  border-radius: 0.875rem;
  background: var(--bg);
  box-shadow: 0 0.5rem 1.5rem -0.75rem rgb(0 0 0 / 0.35), 0 0 0 1px var(--line);
}
iframe {
  display: block;
  border: 0;
  transform-origin: 0 0;
  background: var(--bg);
}
</style>
