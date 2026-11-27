<template>
  <!-- One project or essay. -->
  <section v-if="index >= 0" class="detail" :key="`${ckey}-${index}`">
    <a class="back" :href="`#/${section}`"><Icon name="back" :size="16" /> All {{ title.toLowerCase() }}</a>
    <header class="page-head">
      <div class="head-main">
        <img v-if="thumb" class="head-thumb" :src="thumb" alt="" />
        <div>
          <h1 data-title tabindex="-1">{{ node.itemLabel(item) }}</h1>
          <p v-if="node.itemMeta(item)">{{ node.itemMeta(item) }}</p>
        </div>
      </div>
      <div class="actions">
        <a class="btn btn--sm" :href="sitePreview" target="_blank" rel="noopener"><Icon name="eye" :size="16" /> Preview</a>
        <button type="button" class="btn btn--sm" @click="duplicate"><Icon name="copy" :size="16" /> Duplicate</button>
        <button type="button" class="btn btn--sm btn--danger" @click="remove"><Icon name="trash" :size="16" /> Delete</button>
      </div>
    </header>
    <Field :node="node.of" :holder="list" :k="index" :ckey="ckey" :path="[index]" headless />
  </section>

  <p v-else-if="itemId" class="note note--warn"><Icon name="alert" :size="16" /> That one is not in the draft any more. <a :href="`#/${section}`">See them all</a></p>

  <!-- The list. -->
  <section v-else class="index">
    <header class="page-head">
      <div>
        <h1 data-title tabindex="-1">{{ title }}</h1>
        <p>{{ intro }}</p>
      </div>
      <div class="actions">
        <button type="button" class="btn btn--ink" @click="create"><Icon name="plus" :size="16" /> {{ addLabel }}</button>
      </div>
    </header>

    <ol class="rows">
      <li v-for="(entry, i) in list" :key="node.itemId(entry) + i" class="row">
        <a class="row-link" :href="`#/${section}/${encodeURIComponent(node.itemId(entry))}`">
          <span class="row-thumb">
            <img v-if="thumbOf(entry)" :src="thumbOf(entry)" alt="" loading="lazy" />
            <Icon v-else name="image" :size="18" />
          </span>
          <span class="row-text">
            <span class="row-name">{{ node.itemLabel(entry) }} <span v-if="isChanged(entry, i)" class="dot" title="Changed since publishing"></span></span>
            <span class="row-meta">{{ node.itemMeta(entry) }}</span>
          </span>
          <Icon name="chevron" :size="16" class="row-chev" />
        </a>
        <div class="row-tools">
          <button type="button" class="icon-btn" :disabled="i === 0" :aria-label="`Move ${node.itemLabel(entry)} up`" @click="move(i, -1)"><Icon name="up" :size="16" /></button>
          <button type="button" class="icon-btn" :disabled="i === list.length - 1" :aria-label="`Move ${node.itemLabel(entry)} down`" @click="move(i, 1)"><Icon name="down" :size="16" /></button>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup>
import { computed, watch } from 'vue'
import { schema } from '../schema.js'
import { state, toast } from '../store.js'
import { assetUrl, clone, same } from '../util.js'
import Field from '../components/Field.vue'
import Icon from '../components/Icon.vue'

// Projects and essays: a list to choose from, then one at a time on its own page.
const props = defineProps({
  ckey: { type: String, required: true },
  section: { type: String, required: true },
  itemId: { type: String, default: '' },
  title: { type: String, required: true },
  intro: { type: String, default: '' },
  addLabel: { type: String, default: 'Add' },
  sitePage: { type: String, required: true },
})

const node = computed(() => schema[props.ckey])
const list = computed(() => state.draft[props.ckey])
const idKey = computed(() => (props.ckey === 'essays' ? 'slug' : 'id'))
const index = computed(() => (props.itemId ? list.value.findIndex((entry) => node.value.itemId(entry) === props.itemId) : -1))
const item = computed(() => list.value[index.value])
const files = computed(() => ({ ...state.recent, ...state.files }))
const thumbOf = (entry) => assetUrl(node.value.itemThumb(entry), files.value)
const thumb = computed(() => (item.value ? thumbOf(item.value) : ''))
const sitePreview = computed(() => `../?preview#/${props.sitePage}/${encodeURIComponent(props.itemId)}`)

// Renaming the address of the one you are editing keeps you on it.
let lastIndex = -1
watch(index, (i) => i >= 0 && (lastIndex = i), { immediate: true })
watch(
  () => (lastIndex >= 0 ? list.value[lastIndex]?.[idKey.value] : null),
  (next, before) => {
    if (next && before && next !== before && props.itemId === before) location.replace(`#/${props.section}/${encodeURIComponent(next)}`)
  },
)

function isChanged(entry, i) {
  const id = node.value.itemId(entry)
  const published = state.published[props.ckey].find((p) => node.value.itemId(p) === id)
  return !published || !same(published, entry) || state.published[props.ckey].indexOf(published) !== i
}

function freeId(base) {
  const taken = new Set(list.value.map((entry) => entry[idKey.value]))
  let id = base
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`
  return id
}

function create() {
  const entry = node.value.newItem()
  entry[idKey.value] = freeId(entry[idKey.value])
  if (props.ckey === 'essays') list.value.unshift(entry)
  else list.value.push(entry)
  location.hash = `#/${props.section}/${entry[idKey.value]}`
}

function duplicate() {
  const copy = clone(item.value)
  copy[idKey.value] = freeId(`${copy[idKey.value]}-copy`)
  list.value.splice(index.value + 1, 0, copy)
  location.hash = `#/${props.section}/${copy[idKey.value]}`
}

function remove() {
  const at = index.value
  const [removed] = list.value.splice(at, 1)
  const arr = list.value
  location.hash = `#/${props.section}`
  toast(`Deleted "${node.value.itemLabel(removed)}". It stays on the live site until you publish.`, { action: 'Undo', run: () => arr.splice(at, 0, removed), ms: 8000 })
}

function move(i, step) {
  const [entry] = list.value.splice(i, 1)
  list.value.splice(i + step, 0, entry)
}
</script>

<style scoped>
.detail,
.index {
  max-width: 60rem;
}
.back {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin: -0.25rem 0 1rem -0.25rem;
  padding: 0.25rem 0.5rem 0.25rem 0.25rem;
  border-radius: var(--r-sm);
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 550;
  text-decoration: none;
}
.back:hover {
  background: var(--hover);
  color: var(--ink);
}
.head-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}
.head-thumb {
  width: 3.5rem;
  height: 3.5rem;
  flex: none;
  border-radius: var(--r);
  object-fit: cover;
  background: var(--panel);
}
.rows {
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--line);
  border-radius: var(--r);
  overflow: hidden;
}
.row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding-right: 0.5rem;
}
.row + .row {
  border-top: 1px solid var(--line);
}
.row-link {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 0.875rem;
  min-width: 0;
  padding: 0.625rem 0.75rem;
  color: inherit;
  text-decoration: none;
}
.row:hover {
  background: var(--panel);
}
.row-thumb {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  flex: none;
  overflow: hidden;
  border-radius: var(--r-sm);
  background: var(--hover);
  color: var(--faint);
}
.row-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.row-text {
  display: grid;
  min-width: 0;
}
.row-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}
.row-meta {
  overflow: hidden;
  color: var(--muted);
  font-size: 0.8125rem;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.row-chev {
  margin-left: auto;
  color: var(--faint);
}
.row-tools {
  display: flex;
}
@media (max-width: 40rem) {
  .row-tools {
    display: none;
  }
  .head-thumb {
    display: none;
  }
}
</style>
