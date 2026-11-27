<template>
  <div class="lines" :id="id">
    <ol v-if="arr.length" class="rows">
      <li v-for="(line, i) in arr" :key="i" class="row">
        <span class="num" aria-hidden="true">{{ i + 1 }}</span>
        <textarea
          ref="inputs"
          class="input line"
          rows="1"
          :lang="lang || undefined"
          :value="line"
          :placeholder="placeholder"
          :aria-label="`${label} ${i + 1}`"
          :class="{ 'is-missing': missing }"
          @input="arr[i] = $event.target.value"
          @keydown="onKey($event, i)"
        ></textarea>
        <div class="tools">
          <button type="button" class="icon-btn" :disabled="i === 0" aria-label="Move up" @click="move(i, -1)"><Icon name="up" :size="16" /></button>
          <button type="button" class="icon-btn" :disabled="i === arr.length - 1" aria-label="Move down" @click="move(i, 1)"><Icon name="down" :size="16" /></button>
          <button type="button" class="icon-btn icon-btn--danger" aria-label="Remove line" @click="remove(i)"><Icon name="trash" :size="16" /></button>
        </div>
      </li>
    </ol>
    <button type="button" class="btn btn--sm add" @click="insert(arr.length)"><Icon name="plus" :size="16" /> Add a line</button>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import Icon from './Icon.vue'

// A list of lines (wins, bullet points, headlines). Enter starts a new line below;
// Backspace on an empty line removes it.
const props = defineProps({
  arr: { type: Array, required: true },
  id: { type: String, default: '' },
  label: { type: String, default: 'Line' },
  lang: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  missing: { type: Boolean, default: false },
})

const inputs = ref([])

async function focusAt(i, end = true) {
  await nextTick()
  const el = inputs.value[i]
  if (!el) return
  el.focus()
  if (end) el.setSelectionRange(el.value.length, el.value.length)
}

function insert(at) {
  props.arr.splice(at, 0, '')
  focusAt(at)
}

function remove(i) {
  props.arr.splice(i, 1)
  if (props.arr.length) focusAt(Math.max(0, i - 1))
}

function move(i, step) {
  const [line] = props.arr.splice(i, 1)
  props.arr.splice(i + step, 0, line)
  focusAt(i + step)
}

function onKey(event, i) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    insert(i + 1)
  } else if (event.key === 'Backspace' && !props.arr[i] && props.arr.length > 0) {
    event.preventDefault()
    remove(i)
  }
}
</script>

<style scoped>
.rows {
  display: grid;
  gap: 0.375rem;
  margin: 0 0 0.5rem;
  padding: 0;
  list-style: none;
}
.row {
  display: grid;
  grid-template-columns: 1.25rem minmax(0, 1fr) auto;
  align-items: start;
  gap: 0.375rem;
}
.num {
  padding-top: 0.5625rem;
  color: var(--faint);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.line {
  resize: none;
}
.tools {
  display: flex;
  padding-top: 0.25rem;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.row:hover .tools,
.row:focus-within .tools {
  opacity: 1;
}
@media (hover: none) {
  .tools {
    opacity: 1;
  }
}
.add {
  margin-left: 1.625rem;
}
</style>
