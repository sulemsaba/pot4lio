<template>
  <div class="scrim" @click.self="$emit('close')">
    <section ref="panel" class="publish" role="dialog" aria-modal="false" aria-labelledby="publish-title" tabindex="-1" @keydown.esc="$emit('close')">
      <header class="head">
        <h2 id="publish-title">{{ state.mode === 'local' ? 'Save your changes' : 'Publish' }}</h2>
        <button type="button" class="icon-btn" aria-label="Close" @click="$emit('close')"><Icon name="close" /></button>
      </header>

      <!-- Done -->
      <div v-if="done" class="body">
        <p class="note note--ok"><Icon name="check" :size="16" />
          <span v-if="state.mode === 'github'">Published to GitHub. {{ deployLine }}</span>
          <span v-else>Published. The site shows it now.</span>
        </p>
        <div class="row">
          <a v-if="state.lastPublish?.url" class="btn" :href="state.lastPublish.url" target="_blank" rel="noopener"><Icon name="github" :size="16" /> The commit</a>
          <a v-if="state.lastPublish?.deploy?.url" class="btn" :href="state.lastPublish.deploy.url" target="_blank" rel="noopener"><Icon name="external" :size="16" /> The deploy</a>
          <a class="btn" href="../" target="_blank" rel="noopener"><Icon name="eye" :size="16" /> The live site</a>
        </div>
      </div>

      <!-- No connection: a file -->
      <div v-else-if="state.mode === 'local'" class="body">
        <p>Your changes are saved in this browser. To put them on the live site from here, <a href="#/settings" @click="$emit('close')">connect GitHub</a> (no server needed).</p>
        <p class="muted">Or save a copy and, in the project folder, run <code>npm run content -- import &lt;file&gt;</code>, then deploy.</p>
        <div class="row">
          <button type="button" class="btn btn--ink" @click="saveCopy"><Icon name="download" :size="16" /> Save a copy</button>
          <a class="btn" href="#/settings" @click="$emit('close')"><Icon name="github" :size="16" /> Connect GitHub</a>
        </div>
      </div>

      <!-- Not connected yet -->
      <div v-else-if="!state.connected" class="body">
        <p class="note note--warn"><Icon name="alert" :size="16" /> {{ state.mode === 'github' ? 'GitHub is not connected.' : 'You are not signed in to your server.' }} {{ state.error }}</p>
        <a class="btn" href="#/settings" @click="$emit('close')">Open Settings</a>
      </div>

      <!-- Ready -->
      <form v-else class="body" @submit.prevent="go">
        <p v-if="!hasChanges" class="muted">Nothing to publish: the draft is the same as the live site.</p>
        <template v-else>
          <ul class="list">
            <li v-for="key in changedKeys" :key="key"><span class="dot"></span> {{ titles[key] }}</li>
            <li v-if="pendingFiles.length"><span class="dot"></span> {{ pendingFiles.length }} new {{ pendingFiles.length === 1 ? 'picture' : 'pictures' }}</li>
          </ul>
          <p v-if="errors" class="note note--bad"><Icon name="alert" :size="16" /> {{ errors }} {{ errors === 1 ? 'thing needs' : 'things need' }} fixing first (a missing title, a wrong address or private details). <a href="#/" @click="$emit('close')">See them</a></p>
          <label class="f">
            <span class="label">What changed</span>
            <input v-model="message" class="input" type="text" maxlength="120" />
            <span class="help">{{ state.mode === 'github' ? 'Saved with the commit, so you can find this change later.' : 'Saved with this version in the history.' }}</span>
          </label>
          <p v-if="error" class="note note--bad" role="alert"><Icon name="alert" :size="16" />{{ error }}</p>
          <div class="row">
            <button type="submit" class="btn btn--ink" :disabled="Boolean(state.busy) || errors > 0">
              <Icon :name="state.busy ? 'refresh' : 'send'" :size="16" :class="{ spin: state.busy }" /> {{ state.busy ? 'Publishing' : `Publish to ${where.short}` }}
            </button>
            <a class="btn btn--ghost" href="#/changes" @click="$emit('close')">Review first</a>
          </div>
        </template>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { runChecks } from '../checks.js'
import { titles } from '../schema.js'
import { changedKeys, describeChanges, exportBundle, hasChanges, pendingFiles, publish, state, where } from '../store.js'
import { download } from '../util.js'
import Icon from './Icon.vue'

defineEmits(['close'])

const panel = ref(null)
const message = ref(describeChanges())
const error = ref('')
const done = ref(false)
const errors = computed(() => runChecks(state.draft).filter((c) => c.level === 'error').length)

const deployLine = computed(() => {
  const d = state.lastPublish?.deploy
  if (!d || d.status === 'unknown') return 'The site rebuilds in about a minute.'
  if (d.status === 'completed') return d.conclusion === 'success' ? 'The live site is updated.' : 'The deploy failed: open it to see why.'
  return 'The site is rebuilding now, about a minute.'
})

async function go() {
  error.value = ''
  try {
    await publish(message.value.trim() || describeChanges())
    done.value = true
  } catch (e) {
    error.value = e.message
  }
}

function saveCopy() {
  download(`portfolio-content-${new Date().toISOString().slice(0, 10)}.json`, exportBundle())
}

onMounted(async () => {
  await nextTick()
  panel.value?.focus()
})
</script>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  z-index: 50;
}
.publish {
  position: fixed;
  top: calc(var(--bar) + 0.5rem);
  right: 0.75rem;
  width: min(26rem, calc(100vw - 1.5rem));
  max-height: calc(100dvh - var(--bar) - 1.25rem);
  overflow: auto;
  border: 1px solid var(--line);
  border-radius: 0.875rem;
  background: var(--bg);
  box-shadow: var(--shadow);
  animation: drop 0.2s var(--ease);
}
.publish:focus {
  outline: 0;
}
@keyframes drop {
  from {
    opacity: 0;
    transform: translateY(-0.375rem);
  }
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0.75rem 0 1.125rem;
}
.head h2 {
  font-size: 1rem;
}
.body {
  display: grid;
  gap: 1rem;
  padding: 0.75rem 1.125rem 1.125rem;
  font-size: 0.9375rem;
}
.body a:not(.btn) {
  color: var(--sky);
}
.muted {
  color: var(--muted);
  font-size: 0.875rem;
}
.list {
  display: grid;
  gap: 0.375rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.875rem;
  font-weight: 550;
}
.list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.f {
  display: grid;
  gap: 0.375rem;
}
.f .help {
  margin: 0;
}
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
code {
  padding: 0.0625rem 0.3125rem;
  border-radius: 0.25rem;
  background: var(--panel);
}
</style>
