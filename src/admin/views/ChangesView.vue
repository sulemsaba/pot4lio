<template>
  <section class="changes">
    <header class="page-head">
      <div>
        <h1 data-title tabindex="-1">Changes</h1>
        <p v-if="hasChanges">What publishing will change on the live site. Undo any line you do not want.</p>
        <p v-else>The draft is the same as the live site. Edit anything and it shows up here.</p>
      </div>
      <div v-if="hasChanges" class="actions">
        <button type="button" class="btn" @click="discard"><Icon name="undo" :size="16" /> Discard all</button>
        <button type="button" class="btn btn--ink" @click="$emit('publish')"><Icon :name="state.mode === 'local' ? 'download' : 'send'" :size="16" /> {{ state.mode === 'local' ? 'Save a copy' : 'Publish' }}</button>
      </div>
    </header>

    <div v-for="key in changedKeys" :key="key" class="group">
      <div class="group-head">
        <h2>{{ titles[key] }}</h2>
        <span class="muted">{{ count(key) }}</span>
        <button type="button" class="btn btn--sm btn--ghost" @click="revertKey(key)"><Icon name="undo" :size="16" /> Undo all</button>
      </div>
      <ul class="diffs">
        <li v-for="(change, i) in diffsOf(key)" :key="i" class="diff">
          <button type="button" class="link-btn where" @click="$emit('go', { key, path: change.path })">{{ describe(key, change.path, state.draft) }}</button>
          <div class="values">
            <span class="before"><span class="visually-hidden">Was: </span>{{ preview(change.before) }}</span>
            <Icon name="chevron" :size="14" class="arrow" />
            <span class="after"><span class="visually-hidden">Now: </span>{{ preview(change.after) }}</span>
          </div>
          <button type="button" class="icon-btn" :aria-label="`Undo: ${describe(key, change.path, state.draft)}`" title="Undo this" @click="revertPath(key, change.path, change.before)"><Icon name="undo" :size="16" /></button>
        </li>
      </ul>
    </div>

    <div v-if="pendingFiles.length" class="group">
      <div class="group-head">
        <h2>New pictures</h2>
        <span class="muted">{{ pendingFiles.length }}</span>
      </div>
      <ul class="pictures">
        <li v-for="path in pendingFiles" :key="path">
          <img :src="state.files[path]" alt="" />
          <code>{{ path }}</code>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { describe } from '../checks.js'
import { titles } from '../schema.js'
import { changedKeys, discardAll, hasChanges, pendingFiles, revertKey, revertPath, state, toast } from '../store.js'
import { clone, diff, preview } from '../util.js'
import Icon from '../components/Icon.vue'

defineEmits(['publish', 'go'])

const diffsOf = (key) => diff(state.published[key], state.draft[key])
const count = (key) => {
  const n = diffsOf(key).length
  return `${n} ${n === 1 ? 'change' : 'changes'}`
}

function discard() {
  const before = { draft: clone(state.draft), files: { ...state.files } }
  discardAll()
  toast('All changes discarded.', {
    action: 'Undo',
    run: () => {
      Object.assign(state.draft, before.draft)
      state.files = before.files
    },
    ms: 8000,
  })
}
</script>

<style scoped>
.changes {
  max-width: 56rem;
}
.muted {
  color: var(--muted);
  font-size: 0.8125rem;
}
.group + .group {
  margin-top: 2rem;
}
.group-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.625rem;
}
.group-head .btn {
  margin-left: auto;
}
.diffs {
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--line);
  border-radius: var(--r);
}
.diff {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.25rem 0.75rem;
  align-items: center;
  padding: 0.75rem 0.5rem 0.75rem 0.875rem;
}
.diff + .diff {
  border-top: 1px solid var(--line);
}
.where {
  grid-column: 1;
  justify-self: start;
  text-align: left;
}
.values {
  grid-column: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.5rem;
  min-width: 0;
  font-size: 0.875rem;
}
.diff .icon-btn {
  grid-column: 2;
  grid-row: 1 / span 2;
}
.before {
  color: var(--muted);
  text-decoration: line-through;
  text-decoration-color: color-mix(in srgb, var(--bad) 55%, transparent);
  overflow-wrap: anywhere;
}
.after {
  overflow-wrap: anywhere;
}
.arrow {
  align-self: center;
  color: var(--faint);
}
.pictures {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.pictures li {
  display: grid;
  gap: 0.375rem;
}
.pictures img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: var(--r-sm);
  background: var(--panel);
}
.pictures code {
  overflow-wrap: anywhere;
  color: var(--muted);
  font-size: 0.75rem;
}
</style>
