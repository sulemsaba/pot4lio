<template>
  <section class="copy">
    <header class="page-head">
      <div>
        <h1 data-title tabindex="-1">Site text</h1>
        <p>Every other line on the site: headings, buttons and messages, English and Kiswahili side by side.</p>
      </div>
    </header>

    <div class="tools">
      <label class="search">
        <Icon name="search" :size="16" />
        <span class="visually-hidden">Search the site text</span>
        <input v-model="query" class="input" type="search" placeholder="Search in both languages" />
      </label>
      <div class="groups" role="group" aria-label="Page">
        <button v-for="group in groups" :key="group.name" type="button" class="chip" :aria-pressed="String(active === group.name)" @click="active = group.name">
          {{ group.name }} <span class="chip-count">{{ group.count }}</span>
        </button>
      </div>
    </div>

    <p v-if="!shown.length" class="empty">No line has "{{ query }}". Try another word, or another page.</p>

    <ul class="entries">
      <li v-for="entry in shown" :key="entry.key" class="entry">
        <div class="entry-head">
          <span class="entry-label">{{ entry.label }}</span>
          <span class="entry-group">{{ entry.group }}</span>
        </div>
        <p v-if="entry.hasSlot" class="slot">Keep <code>{n}</code> as it is: it becomes a number.</p>
        <div class="entry-pair">
          <div v-for="lang in ['en', 'sw']" :key="lang" class="entry-side" :id="fieldId('copy', [lang, ...entry.path])">
            <span class="lang">{{ lang.toUpperCase() }}</span>
            <ListField v-if="entry.list" :arr="listOf(lang, entry.path)" :label="`${entry.label} (${lang})`" :lang="lang" :missing="isMissing(entry, lang)" />
            <textarea
              v-else
              class="input"
              rows="1"
              :lang="lang"
              :value="read(lang, entry.path)"
              :aria-label="`${entry.label} (${lang === 'en' ? 'English' : 'Kiswahili'})`"
              :class="{ 'is-missing': isMissing(entry, lang) }"
              @input="write(lang, entry.path, $event.target.value)"
            ></textarea>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { fieldId } from '../checks.js'
import { copyGroups } from '../schema.js'
import { state } from '../store.js'
import { getPath, isObject, setPath } from '../util.js'
import Icon from '../components/Icon.vue'
import ListField from '../components/ListField.vue'

const query = ref('')
const active = ref('All')

const words = (key) => key.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
const human = (path) => {
  const text = path.map((part) => (typeof part === 'number' ? String(part + 1) : words(part))).join(', ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Every line of copy.json, found by walking the English side.
const entries = computed(() => {
  const out = []
  const walk = (value, path) => {
    if (typeof value === 'string' || (Array.isArray(value) && value.every((v) => typeof v === 'string'))) {
      const top = String(path[0])
      const group = copyGroups.find(([, test]) => test.test(top))[0]
      const sw = getPath(state.draft.copy.sw, path)
      const text = [value, sw].flat().join(' ')
      out.push({ key: path.join('.'), path, label: human(path), group, list: Array.isArray(value), hasSlot: /\{n\}/.test(text), text: `${path.join(' ')} ${text}`.toLowerCase() })
      return
    }
    if (Array.isArray(value)) value.forEach((v, i) => walk(v, [...path, i]))
    else if (isObject(value)) for (const [k, v] of Object.entries(value)) walk(v, [...path, k])
  }
  walk(state.draft.copy.en, [])
  return out
})

const groups = computed(() => {
  const names = copyGroups.map(([name]) => name)
  return [{ name: 'All', count: entries.value.length }, ...names.map((name) => ({ name, count: entries.value.filter((e) => e.group === name).length }))]
})

const shown = computed(() => {
  const terms = query.value.toLowerCase().split(/\s+/).filter(Boolean)
  return entries.value.filter((e) => (active.value === 'All' || e.group === active.value) && terms.every((term) => e.text.includes(term)))
})

const read = (lang, path) => getPath(state.draft.copy[lang], path) ?? ''
function write(lang, path, value) {
  // A line missing on one side is created where it belongs.
  let holder = state.draft.copy[lang]
  for (let i = 0; i < path.length - 1; i++) {
    if (holder[path[i]] == null) holder[path[i]] = typeof path[i + 1] === 'number' ? [] : {}
    holder = holder[path[i]]
  }
  setPath(state.draft.copy[lang], path, value)
}
function listOf(lang, path) {
  if (!Array.isArray(getPath(state.draft.copy[lang], path))) write(lang, path, [])
  return getPath(state.draft.copy[lang], path)
}
const filled = (v) => (Array.isArray(v) ? v.some((x) => String(x).trim()) : Boolean(String(v ?? '').trim()))
function isMissing(entry, lang) {
  const other = lang === 'en' ? 'sw' : 'en'
  return !filled(getPath(state.draft.copy[lang], entry.path)) && filled(getPath(state.draft.copy[other], entry.path))
}
</script>

<style scoped>
.copy {
  max-width: 64rem;
}
.tools {
  position: sticky;
  top: var(--bar);
  z-index: 5;
  display: grid;
  gap: 0.75rem;
  margin: 0 -0.5rem 1rem;
  padding: 0.75rem 0.5rem;
  background: var(--bg);
}
.search {
  position: relative;
  display: block;
  max-width: 26rem;
  color: var(--faint);
}
.search .icon {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  transform: translateY(-50%);
}
.search .input {
  padding-left: 2.25rem;
}
.groups {
  display: flex;
  gap: 0.375rem;
  overflow-x: auto;
  scrollbar-width: none;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  flex: none;
  height: 2rem;
  padding: 0 0.75rem;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: var(--bg);
  color: var(--ink);
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 550;
  cursor: pointer;
}
.chip:hover {
  background: var(--hover);
}
.chip[aria-pressed='true'] {
  border-color: var(--ink);
  background: var(--ink);
  color: var(--on-ink);
}
.chip-count {
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
}
.entries {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}
.entry {
  padding: 0.875rem 0 1rem;
  border-top: 1px solid var(--line);
}
.entry-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.entry-label {
  font-size: 0.8125rem;
  font-weight: 600;
}
.entry-group {
  color: var(--faint);
  font-size: 0.75rem;
}
.slot {
  margin: -0.25rem 0 0.5rem;
  color: var(--muted);
  font-size: 0.75rem;
}
.entry-pair {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: 0.5rem 0.75rem;
}
.entry-side {
  position: relative;
  min-width: 0;
}
.entry-side > .input {
  padding-right: 2.25rem;
  resize: none;
}
.lang {
  position: absolute;
  top: 0.6875rem;
  right: 0.625rem;
  z-index: 1;
  color: var(--faint);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  pointer-events: none;
}
.entry-side:has(.lines) .lang {
  position: static;
  display: block;
  margin: 0 0 0.375rem 1.625rem;
}
.empty {
  padding: 2rem;
  color: var(--muted);
  text-align: center;
}
</style>
