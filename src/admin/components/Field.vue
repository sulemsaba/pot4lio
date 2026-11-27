<template>
  <!-- A field left out of the content (optional): offer to add it. -->
  <div v-if="node.optional && holder[k] === undefined" class="field field--absent">
    <button type="button" class="btn btn--sm" @click="addOptional"><Icon name="plus" :size="16" /> {{ node.label }}</button>
    <p v-if="node.help" class="help">{{ node.help }}</p>
  </div>

  <!-- A field that only applies to some items (the LigiPlay demo). -->
  <template v-else-if="node.showIf && !node.showIf(holder)"></template>

  <!-- A group of fields. -->
  <div v-else-if="node.type === 'object'" class="group" :class="{ 'group--nested': !headless }" :id="id">
    <div v-if="!headless && node.label" class="group-head">
      <h3>{{ node.label }}</h3>
      <button v-if="node.optional" type="button" class="link-btn" @click="removeOptional">Remove</button>
    </div>
    <p v-if="!headless && node.help" class="help">{{ node.help }}</p>
    <div class="fields">
      <Field v-for="(child, name) in node.fields" :key="name" :node="child" :holder="value" :k="name" :ckey="ckey" :path="[...path, name]" />
    </div>
  </div>

  <!-- A list of things: projects' images, CV jobs, tools... -->
  <div v-else-if="node.type === 'array'" class="field field--array" :id="id">
    <div v-if="!headless && node.label" class="field-head">
      <span class="label">{{ node.label }}</span>
      <span class="count">{{ value.length }}</span>
    </div>
    <p v-if="node.warn" class="note note--warn warn"><Icon name="alert" :size="16" />{{ node.warn }}</p>
    <p v-if="!headless && node.help" class="help help--top">{{ node.help }}</p>

    <div class="items" :class="{ 'items--compact': node.compact }">
      <div v-for="(item, i) in value" :key="keyOf(item, i)" class="item" :class="{ 'is-open': isOpen(item, i) }">
        <div class="item-head">
          <button v-if="!node.compact" type="button" class="item-toggle" :aria-expanded="String(isOpen(item, i))" @click="toggle(item, i)">
            <Icon name="chevron" :size="16" class="chev" />
            <span class="item-label">{{ labelOf(item, i) }}</span>
          </button>
          <span v-else class="item-label item-label--static">{{ labelOf(item, i) }}</span>
          <div class="item-tools">
            <button type="button" class="icon-btn" :disabled="i === 0" aria-label="Move up" @click="move(i, -1)"><Icon name="up" :size="16" /></button>
            <button type="button" class="icon-btn" :disabled="i === value.length - 1" aria-label="Move down" @click="move(i, 1)"><Icon name="down" :size="16" /></button>
            <button type="button" class="icon-btn" aria-label="Duplicate" title="Duplicate" @click="duplicate(i)"><Icon name="copy" :size="16" /></button>
            <button type="button" class="icon-btn icon-btn--danger" aria-label="Remove" title="Remove" @click="remove(i)"><Icon name="trash" :size="16" /></button>
          </div>
        </div>
        <div v-if="node.compact || isOpen(item, i)" class="item-body">
          <Field :node="node.of" :holder="value" :k="i" :ckey="ckey" :path="[...path, i]" headless />
        </div>
      </div>
      <p v-if="!value.length" class="empty">Nothing here yet.</p>
    </div>
    <button type="button" class="btn btn--sm add" @click="add"><Icon name="plus" :size="16" /> Add {{ singular }}</button>
  </div>

  <!-- One value. -->
  <div v-else class="field" :class="[`field--${node.type}`, { 'field--wide': wide }]">
    <div v-if="!headless && node.label" class="field-head">
      <label class="label" :for="inputId">{{ node.label }}</label>
      <button v-if="node.optional" type="button" class="link-btn" @click="removeOptional">Remove</button>
    </div>

    <I18nField v-if="node.type === 'i18n'" :value="value" :of="node.of || 'text'" :id="id" :label="node.label" :rows="node.rows || 3" :placeholder="node.placeholder || ''" />

    <ListField v-else-if="node.type === 'list'" :arr="value" :id="id" :label="node.label || 'Line'" />

    <ImageField v-else-if="node.type === 'image'" :holder="holder" :k="k" :node="node" :id="id" :bare="headless" />

    <BlocksField v-else-if="node.type === 'blocks'" :arr="value" :id="id" />

    <div v-else-if="node.type === 'pair'" class="pair-row" :id="id">
      <input class="input pair-a" type="text" :value="value[0]" :placeholder="node.labels[0]" :aria-label="node.labels[0]" @input="value[0] = $event.target.value" />
      <input class="input" type="text" :value="value[1]" :placeholder="node.labels[1]" :aria-label="node.labels[1]" @input="value[1] = $event.target.value" />
    </div>

    <textarea v-else-if="node.type === 'textarea'" :id="inputId" class="input" :rows="node.rows || 3" :value="value" :placeholder="node.placeholder || ''" @input="set($event.target.value)"></textarea>

    <select v-else-if="node.type === 'select'" :id="inputId" class="input" :value="value" @change="set($event.target.value)">
      <option v-for="[option, label] in options" :key="option" :value="option">{{ label }}</option>
    </select>

    <button v-else-if="node.type === 'bool'" :id="inputId" type="button" role="switch" class="switch" :aria-checked="String(Boolean(value))" @click="setBool(!value)">
      <span class="knob"></span>
    </button>

    <div v-else-if="node.type === 'color'" class="color" :id="id">
      <input class="swatch" type="color" :value="value || '#ffffff'" :aria-label="`${node.label} picker`" @input="set($event.target.value)" />
      <input :id="inputId" class="input mono" type="text" :value="value" spellcheck="false" placeholder="none" maxlength="9" @change="set($event.target.value.trim())" />
      <button v-if="node.allowEmpty && value" type="button" class="link-btn" @click="set('')">None</button>
    </div>

    <div v-else-if="node.type === 'svg'" class="svg" :id="id">
      <span class="svg-preview" :style="{ background: holder.hex || 'var(--ink)', color: holder.on || 'var(--bg)' }">
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          <path :d="value" :fill="holder.stroke ? 'none' : 'currentColor'" :stroke="holder.stroke ? 'currentColor' : 'none'" :stroke-width="holder.stroke || 0" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      <textarea :id="inputId" class="input mono" rows="2" spellcheck="false" :value="value" @input="set($event.target.value)"></textarea>
    </div>

    <div v-else class="with-tail">
      <input
        :id="inputId"
        class="input"
        :class="{ mono: node.type === 'slug' }"
        :type="inputType"
        :value="value ?? ''"
        :placeholder="node.placeholder || ''"
        :step="node.step"
        :spellcheck="node.type === 'text'"
        @input="onText($event.target.value)"
        @blur="onBlur"
      />
      <a v-if="node.type === 'url' && /^https?:\/\//.test(value || '')" class="icon-btn tail" :href="value" target="_blank" rel="noopener" aria-label="Open the link"><Icon name="external" :size="16" /></a>
    </div>

    <p v-if="node.help && !headless" class="help">{{ node.help }}</p>
  </div>
</template>

<script setup>
import { computed, reactive, toRaw, watch } from 'vue'
import { fieldId } from '../checks.js'
import { reveal, state, toast } from '../store.js'
import { clone, slugify } from '../util.js'
import BlocksField from './BlocksField.vue'
import I18nField from './I18nField.vue'
import Icon from './Icon.vue'
import ImageField from './ImageField.vue'
import ListField from './ListField.vue'

// One field of the content, built from its description in schema.js. It reads and writes
// holder[k] directly, so the draft changes as you type (and is saved a moment later).
const props = defineProps({
  node: { type: Object, required: true },
  holder: { type: [Object, Array], required: true },
  k: { type: [String, Number], required: true },
  ckey: { type: String, required: true },
  path: { type: Array, default: () => [] },
  headless: { type: Boolean, default: false },
})

const value = computed(() => props.holder[props.k])
const id = computed(() => fieldId(props.ckey, props.path))
const inputId = computed(() => `${id.value}-input`)
const wide = computed(() => ['textarea', 'i18n', 'list', 'image', 'blocks', 'array', 'svg'].includes(props.node.type))
const inputType = computed(() => ({ url: 'url', email: 'email', date: 'date', number: 'number' })[props.node.type] || 'text')
const options = computed(() => {
  const list = typeof props.node.options === 'function' ? props.node.options(state.draft) : props.node.options || []
  // Keep a value that is not in the list (yet), so it is never lost by opening the page.
  const known = list.some(([option]) => option === value.value)
  return known || value.value == null ? list : [[value.value, value.value], ...list]
})

function set(next) {
  props.holder[props.k] = next
}
function onText(text) {
  if (props.node.type === 'number') {
    if (text === '' && props.node.optional) return
    const n = Number(text)
    if (!Number.isNaN(n)) set(n)
  } else set(text)
}
function onBlur(event) {
  if (props.node.type === 'slug') set(slugify(event.target.value))
}
function setBool(on) {
  if (!on && props.node.omitFalse) delete props.holder[props.k]
  else set(on)
}

function blankFor(node) {
  if (node.type === 'i18n') return node.of === 'list' ? { en: [], sw: [] } : { en: '', sw: '' }
  if (node.type === 'image') return node.pathOnly ? '' : { src: '', w: 0, h: 0, ...(node.alt === 'i18n' ? { alt: { en: '', sw: '' } } : node.alt ? { alt: '' } : {}) }
  if (node.type === 'list' || node.type === 'array' || node.type === 'blocks') return []
  if (node.type === 'number') return 0
  if (node.type === 'bool') return true
  if (node.type === 'object') return Object.fromEntries(Object.entries(node.fields).filter(([, f]) => !f.optional).map(([name, f]) => [name, blankFor(f)]))
  return ''
}
const addOptional = () => set(blankFor(props.node))
const removeOptional = () => delete props.holder[props.k]

// ---------- Lists ----------

const singular = computed(() => {
  const label = (props.node.label || 'item').toLowerCase()
  return { images: 'an image', tools: 'a tool', 'contact lines': 'a group', experience: 'a job', projects: 'a project', education: 'an entry', skills: 'a group', referees: 'a referee' }[label] || 'one'
})

// Stable keys for items, so open panels and focus follow an item when it moves.
const ids = new WeakMap()
let counter = 0
function keyOf(item, i) {
  if (item === null || typeof item !== 'object') return `i${i}`
  const raw = toRaw(item)
  if (!ids.has(raw)) ids.set(raw, `k${counter++}`)
  return ids.get(raw)
}

const open = reactive(new Set())
const isOpen = (item, i) => open.has(keyOf(item, i))
function toggle(item, i) {
  const key = keyOf(item, i)
  if (open.has(key)) open.delete(key)
  else open.add(key)
}

// Sent here to a field inside one of the items: open that item.
watch(
  reveal,
  (target) => {
    if (props.node.type !== 'array' || !target || target.key !== props.ckey) return
    const inside = props.path.every((part, n) => target.path[n] === part)
    const i = target.path[props.path.length]
    if (inside && typeof i === 'number' && value.value?.[i] !== undefined) open.add(keyOf(value.value[i], i))
  },
  { immediate: true },
)

function labelOf(item, i) {
  return (props.node.itemLabel ? props.node.itemLabel(item || {}, i) : '') || `Item ${i + 1}`
}

function add() {
  const item = props.node.newItem ? props.node.newItem() : blankFor(props.node.of)
  value.value.push(item)
  const added = value.value[value.value.length - 1]
  open.add(keyOf(added, value.value.length - 1))
}
function move(i, step) {
  const [item] = value.value.splice(i, 1)
  value.value.splice(i + step, 0, item)
}
function duplicate(i) {
  const copy = clone(value.value[i])
  value.value.splice(i + 1, 0, copy)
  open.add(keyOf(value.value[i + 1], i + 1))
}
function remove(i) {
  const list = value.value
  const [item] = list.splice(i, 1)
  const label = labelOf(item, i)
  toast(`Removed "${label}".`, { action: 'Undo', run: () => list.splice(i, 0, item) })
}
</script>

<style scoped>
.fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem 1.25rem;
}
.field {
  min-width: 0;
}
.field--wide,
.field--absent,
.group--nested,
.field--array {
  grid-column: 1 / -1;
}
.field-head,
.group-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.4375rem;
}
.group--nested {
  padding: 1rem 1.125rem 1.125rem;
  border: 1px solid var(--line);
  border-radius: var(--r);
}
.group--nested > .help {
  margin: -0.125rem 0 0.875rem;
}
.group-head h3 {
  font-size: 0.875rem;
}
.field--absent {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.75rem;
}
.field--absent .btn {
  border-style: dashed;
  color: var(--muted);
}
.field--absent .help {
  margin: 0;
}
.count {
  color: var(--faint);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}
.help--top {
  margin: -0.125rem 0 0.625rem;
}
.warn {
  margin-bottom: 0.625rem;
}

/* Lists of things */
.items {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 0.625rem;
}
.item {
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--bg);
  transition: border-color 0.15s ease;
}
.item.is-open,
.items--compact .item {
  border-color: var(--line-strong);
}
.item-head {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-height: 2.75rem;
  padding: 0.25rem 0.375rem 0.25rem 0.25rem;
}
.item-toggle {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
  min-height: 2.25rem;
  padding: 0 0.5rem;
  border: 0;
  border-radius: var(--r-sm);
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.item-toggle:hover {
  background: var(--hover);
}
.chev {
  color: var(--faint);
  transition: transform 0.2s var(--ease);
}
.is-open .chev {
  transform: rotate(90deg);
}
.item-label {
  overflow: hidden;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.item-label--static {
  flex: 1;
  padding-left: 0.625rem;
  color: var(--muted);
  font-size: 0.8125rem;
}
.item-tools {
  display: flex;
  flex: none;
}
.item-body {
  padding: 0.25rem 1rem 1rem;
}
.items--compact .item-body {
  padding-top: 0;
}
.items--compact .item-head {
  min-height: 2.25rem;
}
.empty {
  padding: 0.75rem;
  border: 1px dashed var(--line-strong);
  border-radius: var(--r);
  color: var(--muted);
  font-size: 0.875rem;
  text-align: center;
}

/* Small controls */
.with-tail {
  position: relative;
}
.with-tail .input {
  padding-right: 2.5rem;
}
.tail {
  position: absolute;
  top: 50%;
  right: 0.25rem;
  transform: translateY(-50%);
}
.pair-row {
  display: grid;
  grid-template-columns: minmax(0, 12rem) minmax(0, 1fr);
  gap: 0.5rem;
}
.color {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.color .input {
  max-width: 8.5rem;
}
.swatch {
  width: 2.5rem;
  height: 2.5rem;
  flex: none;
  padding: 0.1875rem;
  border: 1px solid var(--line-strong);
  border-radius: var(--r-sm);
  background: var(--field);
  cursor: pointer;
}
.swatch::-webkit-color-swatch-wrapper {
  padding: 0;
}
.swatch::-webkit-color-swatch {
  border: 0;
  border-radius: 0.25rem;
}
.swatch::-moz-color-swatch {
  border: 0;
  border-radius: 0.25rem;
}
.svg {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.625rem;
  align-items: start;
}
.svg-preview {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--r-sm);
}
.switch {
  position: relative;
  width: 2.75rem;
  height: 1.625rem;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--line-strong);
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.switch[aria-checked='true'] {
  background: var(--ink);
}
.knob {
  position: absolute;
  top: 0.1875rem;
  left: 0.1875rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: var(--bg);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.2);
  transition: transform 0.2s var(--ease);
}
.switch[aria-checked='true'] .knob {
  transform: translateX(1.125rem);
}

@media (max-width: 40rem) {
  .fields {
    grid-template-columns: minmax(0, 1fr);
  }
  .item-body {
    padding: 0.25rem 0.75rem 0.875rem;
  }
  .pair-row {
    grid-template-columns: 1fr;
  }
}
</style>
