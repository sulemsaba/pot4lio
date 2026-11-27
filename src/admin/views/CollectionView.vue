<template>
  <section class="collection">
    <header class="page-head">
      <div>
        <h1 data-title tabindex="-1">{{ title }}</h1>
        <p v-if="intro">{{ intro }}</p>
      </div>
      <div v-if="keys.length === 1 && changed(keys[0])" class="actions">
        <button type="button" class="btn btn--sm" @click="undo(keys[0])"><Icon name="undo" :size="16" /> Undo changes here</button>
      </div>
    </header>

    <div v-for="key in keys" :key="key" class="part" :id="`part-${key}`">
      <div v-if="keys.length > 1" class="part-head">
        <h2>{{ titles[key] }} <span v-if="changed(key)" class="dot" title="Changed"></span></h2>
        <button v-if="changed(key)" type="button" class="btn btn--sm btn--ghost" @click="undo(key)"><Icon name="undo" :size="16" /> Undo</button>
      </div>
      <Field :node="schema[key]" :holder="state.draft" :k="key" :ckey="key" :path="[]" headless />
    </div>
  </section>
</template>

<script setup>
import { schema, titles } from '../schema.js'
import { changedKeys, revertKey, state, toast } from '../store.js'
import { clone } from '../util.js'
import Field from '../components/Field.vue'
import Icon from '../components/Icon.vue'

defineProps({
  keys: { type: Array, required: true },
  title: { type: String, required: true },
  intro: { type: String, default: '' },
})

const changed = (key) => changedKeys.value.includes(key)

function undo(key) {
  const before = clone(state.draft[key])
  revertKey(key)
  toast(`${titles[key]} is back to the published version.`, { action: 'Redo', run: () => (state.draft[key] = before) })
}
</script>

<style scoped>
.collection {
  max-width: 60rem;
}
.part + .part {
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--line);
}
.part-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}
.part-head h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
