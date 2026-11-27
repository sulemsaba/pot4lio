<template>
  <div class="blocks" :id="id">
    <div v-for="(block, i) in arr" :key="keyOf(block, i)" class="block" :class="`block--${kind(block)}`">
      <div class="block-bar">
        <div class="kinds" role="group" :aria-label="`Block ${i + 1} kind`">
          <button
            v-for="option in kinds"
            :key="option.id"
            type="button"
            class="kind"
            :aria-pressed="String(kind(block) === option.id)"
            :title="option.label"
            @click="convert(i, option.id)"
          >
            <Icon :name="option.icon" :size="15" /><span class="kind-label">{{ option.label }}</span>
          </button>
        </div>
        <div class="tools">
          <button type="button" class="icon-btn" :disabled="i === 0" aria-label="Move up" @click="move(i, -1)"><Icon name="up" :size="16" /></button>
          <button type="button" class="icon-btn" :disabled="i === arr.length - 1" aria-label="Move down" @click="move(i, 1)"><Icon name="down" :size="16" /></button>
          <button type="button" class="icon-btn" aria-label="Add a paragraph below" title="Add a paragraph below" @click="insert(i + 1)"><Icon name="plus" :size="16" /></button>
          <button type="button" class="icon-btn icon-btn--danger" aria-label="Remove block" @click="remove(i)"><Icon name="trash" :size="16" /></button>
        </div>
      </div>

      <textarea v-if="kind(block) === 'p'" class="input prose" rows="3" :value="block" aria-label="Paragraph" @input="arr[i] = $event.target.value"></textarea>
      <input v-else-if="kind(block) === 'h'" class="input heading" type="text" :value="block.h" aria-label="Heading" @input="block.h = $event.target.value" />
      <template v-else-if="kind(block) === 'q'">
        <textarea class="input prose quote" rows="2" :value="block.q" aria-label="Quotation" @input="block.q = $event.target.value"></textarea>
        <input class="input by" type="text" :value="block.by" placeholder="Who said it" aria-label="Who said it" @input="block.by = $event.target.value" />
      </template>
      <ListField v-else :arr="block.list" label="List item" />
    </div>

    <div class="add-row">
      <span class="add-label">Add</span>
      <button v-for="option in kinds" :key="option.id" type="button" class="btn btn--sm" @click="append(option.id)"><Icon :name="option.icon" :size="15" /> {{ option.label }}</button>
    </div>
  </div>
</template>

<script setup>
import Icon from './Icon.vue'
import ListField from './ListField.vue'

// An essay body: a paragraph is plain text, a heading is { h }, a quotation { q, by },
// a list { list }. Changing a block's kind keeps its words.
const props = defineProps({
  arr: { type: Array, required: true },
  id: { type: String, default: '' },
})

const kinds = [
  { id: 'p', label: 'Paragraph', icon: 'paragraph' },
  { id: 'h', label: 'Heading', icon: 'heading' },
  { id: 'q', label: 'Quote', icon: 'quote' },
  { id: 'list', label: 'List', icon: 'list' },
]

const kind = (block) => (typeof block === 'string' ? 'p' : 'h' in block ? 'h' : 'q' in block ? 'q' : 'list')
const textOf = (block) => (typeof block === 'string' ? block : block.h ?? block.q ?? (block.list || []).join('\n'))

// Paragraphs are plain strings, so they get keys from their place; objects keep theirs.
const ids = new WeakMap()
let next = 0
const keyOf = (block, i) => {
  if (typeof block !== 'object' || block === null) return `p${i}`
  if (!ids.has(block)) ids.set(block, `b${next++}`)
  return ids.get(block)
}

function make(id, text = '') {
  if (id === 'p') return text
  if (id === 'h') return { h: text.replace(/\n+/g, ' ') }
  if (id === 'q') return { q: text, by: '' }
  return { list: text ? text.split(/\n+/) : [''] }
}

function convert(i, id) {
  if (kind(props.arr[i]) === id) return
  props.arr[i] = make(id, textOf(props.arr[i]))
}
const insert = (at) => props.arr.splice(at, 0, '')
const append = (id) => props.arr.push(make(id))
const remove = (i) => props.arr.splice(i, 1)
function move(i, step) {
  const [block] = props.arr.splice(i, 1)
  props.arr.splice(i + step, 0, block)
}
</script>

<style scoped>
.blocks {
  display: grid;
  gap: 0.625rem;
}
.block {
  display: grid;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem 0.625rem;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--bg);
}
.block:focus-within {
  border-color: var(--line-strong);
}
.block-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.kinds {
  display: flex;
  gap: 0.125rem;
}
.kind {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  height: 1.75rem;
  padding: 0 0.5rem;
  border: 0;
  border-radius: var(--r-sm);
  background: transparent;
  color: var(--faint);
  font: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}
.kind:hover {
  background: var(--hover);
  color: var(--ink);
}
.kind[aria-pressed='true'] {
  background: var(--panel);
  color: var(--ink);
}
.kind[aria-pressed='false'] .kind-label {
  display: none;
}
.tools {
  display: flex;
}
.prose {
  line-height: 1.6;
}
.heading {
  font-weight: 650;
  font-size: 1.0625rem;
}
.quote {
  font-style: italic;
}
.by {
  max-width: 22rem;
}
.add-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
}
.add-label {
  margin-right: 0.25rem;
  color: var(--muted);
  font-size: 0.8125rem;
  font-weight: 600;
}
</style>
