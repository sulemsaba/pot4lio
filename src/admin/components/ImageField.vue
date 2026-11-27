<template>
  <div class="image" :class="{ 'is-over': over, 'is-bare': bare }" :id="id" @dragover.prevent="over = true" @dragleave="over = false" @drop.prevent="onDrop">
    <div class="thumb" :class="{ empty: !src }">
      <img v-if="src && !broken" :src="url" alt="" @error="broken = true" @load="broken = false" />
      <div v-else class="placeholder">
        <Icon name="image" :size="22" />
        <span>{{ broken ? 'Not on the site yet' : 'No picture' }}</span>
      </div>
      <span v-if="pending" class="pending"><span class="dot"></span> New</span>
    </div>

    <div class="side">
      <div class="actions">
        <label class="btn btn--sm">
          <Icon :name="busy ? 'refresh' : 'upload'" :size="16" :class="{ spin: busy }" />
          {{ busy ? 'Preparing' : src ? 'Replace' : 'Choose picture' }}
          <input type="file" accept="image/*" class="visually-hidden" :disabled="busy" @change="onPick" />
        </label>
        <span v-if="!pathOnly && value.w" class="size">{{ value.w }} by {{ value.h }}</span>
      </div>
      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <label class="sub">
        <span class="sub-label">File</span>
        <input class="input mono" type="text" :value="src" spellcheck="false" placeholder="work/name.webp" @change="setSrc($event.target.value)" />
      </label>

      <template v-if="!pathOnly && node.alt">
        <div class="sub">
          <span class="sub-label">Description <span class="hint">for people who cannot see it</span></span>
          <I18nField v-if="node.alt === 'i18n'" :value="ensureAlt()" :id="`${id}-alt`" label="Description" :rows="2" of="textarea" />
          <textarea v-else class="input" rows="2" :value="value.alt" :id="`${id}-alt`" @input="value.alt = $event.target.value"></textarea>
        </div>
      </template>

      <div v-if="!pathOnly && node.extra" class="extra">
        <label v-for="(field, name) in node.extra" :key="name" class="sub">
          <span class="sub-label">{{ field.label }}</span>
          <input class="input" :type="field.type === 'url' ? 'url' : 'text'" :value="value[name] ?? ''" :placeholder="field.placeholder || ''" @input="value[name] = $event.target.value" />
          <span v-if="field.help" class="help">{{ field.help }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { addPicture, state } from '../store.js'
import { measure } from '../images.js'
import { assetUrl } from '../util.js'
import I18nField from './I18nField.vue'
import Icon from './Icon.vue'

// A picture: its file, its size, and what it shows (for screen readers). New pictures are
// resized and turned into WebP here before they go anywhere.
const props = defineProps({
  holder: { type: [Object, Array], required: true },
  k: { type: [String, Number], required: true },
  node: { type: Object, required: true },
  id: { type: String, default: '' },
  bare: { type: Boolean, default: false }, // inside a list item, which is already a frame
})

const pathOnly = computed(() => Boolean(props.node.pathOnly))
const value = computed(() => props.holder[props.k])
const src = computed(() => (pathOnly.value ? value.value : value.value?.src) || '')
const url = computed(() => assetUrl(src.value, { ...state.recent, ...state.files }))
const pending = computed(() => Boolean(state.files[src.value]))

const busy = ref(false)
const error = ref('')
const over = ref(false)
const broken = ref(false)
watch(src, () => (broken.value = false))

function ensureAlt() {
  if (!value.value.alt || typeof value.value.alt !== 'object') value.value.alt = { en: '', sw: '' }
  return value.value.alt
}

async function setSrc(next) {
  next = next.trim()
  if (pathOnly.value) {
    props.holder[props.k] = next
    return
  }
  value.value.src = next
  const size = next ? await measure(assetUrl(next, state.files)) : null
  if (size) Object.assign(value.value, size)
}

async function use(file) {
  if (!file) return
  error.value = ''
  busy.value = true
  try {
    const result = await addPicture(file, { dir: props.node.dir ?? 'uploads', max: props.node.max || 1600, small: props.node.small || 0 })
    if (pathOnly.value) props.holder[props.k] = result.src
    else {
      value.value.src = result.src
      value.value.w = result.w
      value.value.h = result.h
      if (props.node.small) value.value.small = result.small || result.src
    }
  } catch (e) {
    error.value = e.message || 'That picture could not be used.'
  } finally {
    busy.value = false
  }
}

const onPick = (event) => {
  use(event.target.files?.[0])
  event.target.value = ''
}
const onDrop = (event) => {
  over.value = false
  use(event.dataTransfer.files?.[0])
}
</script>

<style scoped>
.image {
  display: grid;
  grid-template-columns: minmax(0, 11rem) minmax(0, 1fr);
  gap: 1rem;
  padding: 0.75rem;
  border: 1px dashed var(--line-strong);
  border-radius: var(--r);
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}
.image.is-bare {
  padding: 0;
  border: 0;
}
.image.is-bare.is-over {
  outline: 2px dashed var(--sky);
  outline-offset: 0.375rem;
  background: none;
}
.image.is-over {
  border-color: var(--sky);
  background: var(--sky-soft);
}
.thumb {
  position: relative;
  align-self: start;
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: var(--r-sm);
  background:
    repeating-conic-gradient(var(--hover) 0 25%, var(--bg) 0 50%) 0 0 / 1rem 1rem;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.placeholder {
  display: grid;
  justify-items: center;
  gap: 0.25rem;
  color: var(--faint);
  font-size: 0.75rem;
  text-align: center;
  padding: 0.5rem;
}
.pending {
  position: absolute;
  top: 0.375rem;
  left: 0.375rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  background: var(--bg);
  font-size: 0.6875rem;
  font-weight: 700;
  box-shadow: var(--shadow);
}
.side {
  display: grid;
  gap: 0.75rem;
  min-width: 0;
}
.actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.actions .btn {
  cursor: pointer;
}
.size {
  color: var(--muted);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
}
.sub {
  display: grid;
  gap: 0.3125rem;
}
.sub-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted);
}
.hint {
  font-weight: 400;
}
.extra {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: 0.75rem;
}
.help {
  margin: 0;
  color: var(--muted);
  font-size: 0.75rem;
}
.error {
  color: var(--bad);
  font-size: 0.8125rem;
}
@media (max-width: 34rem) {
  .image {
    grid-template-columns: 1fr;
  }
  .thumb {
    max-width: 14rem;
  }
}
</style>
