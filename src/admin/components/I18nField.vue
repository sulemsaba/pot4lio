<template>
  <div class="pair" :class="{ 'pair--list': of === 'list' }" :id="id">
    <div v-for="side in sides" :key="side.code" class="side" :id="`${id}-${side.code}`">
      <span class="lang" :title="side.name">{{ side.code.toUpperCase() }}<span class="visually-hidden"> {{ side.name }}</span></span>
      <ListField
        v-if="of === 'list'"
        :arr="ensureList(side.code)"
        :label="`${label} (${side.name})`"
        :lang="side.code"
        :missing="isMissing(side.code)"
      />
      <textarea
        v-else-if="of === 'textarea'"
        class="input"
        :rows="rows"
        :lang="side.code"
        :value="value[side.code] ?? ''"
        :placeholder="side.code === 'en' ? placeholder : ''"
        :aria-label="`${label} (${side.name})`"
        :class="{ 'is-missing': isMissing(side.code) }"
        @input="value[side.code] = $event.target.value"
      ></textarea>
      <input
        v-else
        class="input"
        type="text"
        :lang="side.code"
        :value="value[side.code] ?? ''"
        :placeholder="side.code === 'en' ? placeholder : ''"
        :aria-label="`${label} (${side.name})`"
        :class="{ 'is-missing': isMissing(side.code) }"
        @input="value[side.code] = $event.target.value"
      />
      <p v-if="isMissing(side.code)" class="missing">No {{ side.name }} yet</p>
    </div>
  </div>
</template>

<script setup>
import ListField from './ListField.vue'

// English and Kiswahili side by side, so neither is forgotten. A side left empty while the
// other has text is marked.
const props = defineProps({
  value: { type: Object, required: true },
  of: { type: String, default: 'text' },
  id: { type: String, default: '' },
  label: { type: String, default: '' },
  rows: { type: Number, default: 3 },
  placeholder: { type: String, default: '' },
})

const sides = [
  { code: 'en', name: 'English' },
  { code: 'sw', name: 'Kiswahili' },
]

const filled = (v) => (Array.isArray(v) ? v.some((line) => String(line).trim()) : Boolean(String(v ?? '').trim()))

function isMissing(code) {
  const other = code === 'en' ? 'sw' : 'en'
  return !filled(props.value[code]) && filled(props.value[other])
}

function ensureList(code) {
  if (!Array.isArray(props.value[code])) props.value[code] = []
  return props.value[code]
}
</script>

<style scoped>
.pair {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
  gap: 0.5rem 0.75rem;
}
.pair--list {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
}
.side {
  position: relative;
  min-width: 0;
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
.side :deep(.input) {
  padding-right: 2.25rem;
}
.pair--list .lang {
  position: static;
  display: block;
  margin: 0 0 0.375rem 1.625rem;
}
.pair--list .side :deep(.input) {
  padding-right: 0.75rem;
}
.missing {
  margin-top: 0.25rem;
  color: var(--amber);
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
