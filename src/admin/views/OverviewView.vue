<template>
  <section class="overview">
    <header class="page-head">
      <div>
        <h1 data-title tabindex="-1">Your portfolio</h1>
        <p>Edit anything on the left. Your changes are saved in this browser as you type, and reach the live site when you publish.</p>
      </div>
      <div class="actions">
        <a class="btn" href="../" target="_blank" rel="noopener"><Icon name="external" :size="16" /> Open the live site</a>
      </div>
    </header>

    <!-- Where things stand. -->
    <div class="status panel">
      <div class="status-main">
        <span class="status-icon" :class="hasChanges ? 'is-pending' : 'is-clean'"><Icon :name="hasChanges ? 'pen' : 'check'" :size="18" /></span>
        <div>
          <h2 v-if="hasChanges">{{ summary }}</h2>
          <h2 v-else>Everything is published</h2>
          <p class="muted">
            <template v-if="state.savedAt">Draft saved {{ ago(state.savedAt) }}. </template>
            Changes go to: <strong>{{ where.label }}</strong>.
          </p>
        </div>
      </div>
      <div class="status-actions">
        <a v-if="hasChanges" class="btn" href="#/changes">Review changes</a>
        <button v-if="hasChanges" type="button" class="btn btn--ink" @click="$emit('publish')"><Icon :name="state.mode === 'local' ? 'download' : 'send'" :size="16" /> {{ state.mode === 'local' ? 'Save a copy' : 'Publish' }}</button>
      </div>
      <p v-if="state.lastPublish" class="last">
        <Icon name="send" :size="14" /> Published {{ ago(state.lastPublish.at) }}.
        <template v-if="deployText"> {{ deployText }}</template>
        <a v-if="state.lastPublish.url" :href="state.lastPublish.url" target="_blank" rel="noopener">See the commit</a>
      </p>
    </div>

    <!-- With no connection, say what that means once, plainly. -->
    <div v-if="state.mode === 'local'" class="connect panel">
      <div>
        <h2>Publish from here, with no server</h2>
        <p class="muted">Right now your edits stay in this browser. Connect GitHub and the Publish button updates the live site directly: it saves the files to the repository and the site rebuilds in about a minute. It takes two minutes to set up. When you have your own server, switch to it in Settings.</p>
      </div>
      <a class="btn btn--ink" href="#/settings"><Icon name="github" :size="16" /> Connect GitHub</a>
    </div>

    <!-- Things worth a look. -->
    <div class="checks">
      <div class="checks-head">
        <h2>Worth a look</h2>
        <span class="muted">{{ checks.length ? `${checks.length} ${checks.length === 1 ? 'thing' : 'things'}` : 'Nothing' }}</span>
      </div>
      <p v-if="!checks.length" class="note note--ok"><Icon name="check" :size="16" /> No missing translations, empty descriptions or long dashes. Nice.</p>
      <ul v-else class="check-list">
        <li v-for="(check, i) in visibleChecks" :key="i" class="check-row" :class="`is-${check.level}`">
          <Icon :name="check.level === 'info' ? 'info' : 'alert'" :size="16" class="check-icon" />
          <div class="check-text">
            <span>{{ check.text }}</span>
            <button type="button" class="link-btn where" @click="$emit('go', check)">{{ check.where }}</button>
          </div>
          <button v-if="check.fix === 'dash'" type="button" class="btn btn--sm" @click="fixAllDashes">Fix all</button>
        </li>
      </ul>
      <button v-if="checks.length > limit" type="button" class="btn btn--sm more" @click="limit = checks.length">Show all {{ checks.length }}</button>
    </div>

    <!-- Shortcuts to the usual jobs. -->
    <div class="jobs">
      <a class="job" href="#/projects"><Icon name="grid" /><span><strong>Projects</strong><span class="muted">{{ state.draft.projects.length }} on the Work page</span></span></a>
      <a class="job" href="#/essays"><Icon name="pen" /><span><strong>Writing</strong><span class="muted">{{ state.draft.essays.length }} essays</span></span></a>
      <a class="job" href="#/cv"><Icon name="file" /><span><strong>CV</strong><span class="muted">The page and the PDF</span></span></a>
      <a class="job" href="#/copy"><Icon name="type" /><span><strong>Site text</strong><span class="muted">Headings, buttons, messages</span></span></a>
      <a v-if="state.draft.profile.stats?.umami" class="job" href="https://cloud.umami.is" target="_blank" rel="noopener"><Icon name="eye" /><span><strong>Visitors</strong><span class="muted">Countries, devices, pages</span></span></a>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { fixDashes, runChecks } from '../checks.js'
import { changedKeys, describeChanges, hasChanges, pendingFiles, state, toast, where } from '../store.js'
import { ago, clone } from '../util.js'
import Icon from '../components/Icon.vue'

defineEmits(['publish', 'go'])

const checks = computed(() => runChecks(state.draft))
const limit = ref(8)
const visibleChecks = computed(() => checks.value.slice(0, limit.value))

const summary = computed(() => {
  const n = changedKeys.value.length
  const p = pendingFiles.value.length
  const parts = []
  if (n) parts.push(`${n} ${n === 1 ? 'part' : 'parts'} changed`)
  if (p) parts.push(`${p} new ${p === 1 ? 'picture' : 'pictures'}`)
  return `${parts.join(', ')}: ${describeChanges().replace(/^Update /, '')}`
})

const deployText = computed(() => {
  const d = state.lastPublish?.deploy
  if (!d || state.mode !== 'github') return ''
  if (d.status === 'completed') return d.conclusion === 'success' ? 'The live site is updated.' : 'The deploy failed.'
  if (d.status === 'unknown') return 'The site rebuilds in about a minute.'
  return 'The site is rebuilding now.'
})

function fixAllDashes() {
  const before = clone(state.draft)
  for (const key of Object.keys(state.draft)) state.draft[key] = fixDashes(state.draft[key])
  toast('Every long dash is now a plain hyphen.', { action: 'Undo', run: () => Object.assign(state.draft, before) })
}
</script>

<style scoped>
.overview {
  display: grid;
  gap: 1.25rem;
  max-width: 56rem;
}
.overview > .page-head {
  margin-bottom: 0.25rem;
}
.muted {
  color: var(--muted);
}
.status {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem 1.5rem;
  padding: 1.125rem 1.25rem;
}
.status-main {
  display: flex;
  gap: 0.875rem;
  align-items: flex-start;
  min-width: 0;
}
.status-main h2 {
  font-size: 1rem;
}
.status-main p {
  margin-top: 0.25rem;
  font-size: 0.875rem;
}
.status-icon {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  flex: none;
  border-radius: 50%;
}
.is-pending {
  background: var(--amber-soft);
  color: var(--amber);
}
.is-clean {
  background: var(--ok-soft);
  color: var(--ok);
}
.status-actions {
  display: flex;
  gap: 0.5rem;
}
.last {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
  padding-top: 0.875rem;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.8125rem;
}
.last a {
  color: var(--sky);
}
.connect {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 1.5rem;
  padding: 1.125rem 1.25rem;
  background: var(--panel);
  border-color: transparent;
}
.connect h2 {
  font-size: 1rem;
}
.connect p {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  max-width: 62ch;
}
.checks {
  padding-top: 0.75rem;
}
.checks-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 0.625rem;
}
.checks-head h2 {
  font-size: 1rem;
}
.checks-head .muted {
  font-size: 0.8125rem;
}
.check-list {
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--line);
  border-radius: var(--r);
}
.check-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
}
.check-row + .check-row {
  border-top: 1px solid var(--line);
}
.check-icon {
  margin-top: 0.1875rem;
}
.is-error .check-icon {
  color: var(--bad);
}
.is-warn .check-icon {
  color: var(--amber);
}
.is-info .check-icon {
  color: var(--faint);
}
.check-text {
  display: grid;
  flex: 1;
  gap: 0.125rem;
  min-width: 0;
  font-size: 0.875rem;
}
.where {
  justify-self: start;
  text-align: left;
}
.more {
  margin-top: 0.625rem;
}
.jobs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 12.5rem), 1fr));
  gap: 0.5rem;
  padding-top: 0.75rem;
}
.job {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--line);
  border-radius: var(--r);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.15s ease;
}
.job:hover {
  border-color: var(--line-strong);
  background: var(--panel);
}
.job .icon {
  color: var(--muted);
}
.job > span {
  display: grid;
  font-size: 0.875rem;
}
.job .muted {
  font-size: 0.8125rem;
}
@media (max-width: 40rem) {
  .status {
    grid-template-columns: 1fr;
  }
  .connect {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
