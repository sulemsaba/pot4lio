<template>
  <section class="history">
    <header class="page-head">
      <div>
        <h1 data-title tabindex="-1">History</h1>
        <p v-if="state.mode === 'github'">Every publish is a commit on GitHub, so nothing is ever lost.</p>
        <p v-else-if="state.mode === 'server'">Every publish is kept on the server. Restoring one publishes it again as a new version.</p>
        <p v-else>Connect GitHub or your server to keep a history of every publish.</p>
      </div>
      <div v-if="state.mode === 'github' && state.connected" class="actions">
        <a class="btn btn--sm" :href="`https://github.com/${state.github.owner}/${state.github.repo}/commits/${state.github.branch}/src/data`" target="_blank" rel="noopener"><Icon name="external" :size="16" /> On GitHub</a>
      </div>
    </header>

    <div v-if="state.mode === 'local'" class="empty panel">
      <Icon name="clock" :size="22" />
      <p>This browser keeps only your current draft. With GitHub, each publish becomes a commit you can look back at; with your server, you can restore any earlier version in one click.</p>
      <a class="btn" href="#/settings">Open Settings</a>
    </div>

    <p v-else-if="!state.connected" class="note note--warn"><Icon name="alert" :size="16" /> Not connected. <a href="#/settings">Connect in Settings</a> to see the history.</p>

    <template v-else>
      <ul v-if="loading" class="rows" aria-busy="true">
        <li v-for="n in 5" :key="n" class="row skeleton"><span></span><span></span></li>
      </ul>
      <p v-else-if="error" class="note note--bad" role="alert"><Icon name="alert" :size="16" />{{ error }}</p>
      <ul v-else class="rows">
        <li v-for="entry in entries" :key="entry.id" class="row">
          <div class="text">
            <strong>{{ entry.message || 'Update content' }}</strong>
            <span class="meta">{{ when(entry.date) }}<template v-if="entry.by">, by {{ entry.by }}</template><template v-if="entry.keys?.length"> · {{ entry.keys.join(', ') }}</template></span>
          </div>
          <a v-if="entry.url" class="btn btn--sm btn--ghost" :href="entry.url" target="_blank" rel="noopener">View</a>
          <template v-if="state.mode === 'server'">
            <button v-if="confirming !== entry.id" type="button" class="btn btn--sm" @click="confirming = entry.id">Restore</button>
            <button v-else type="button" class="btn btn--sm btn--ink" :disabled="restoring" @click="restore(entry.id)">{{ restoring ? 'Restoring' : 'Publish this again?' }}</button>
          </template>
        </li>
        <li v-if="!entries.length" class="row"><span class="meta">Nothing published yet.</span></li>
      </ul>
    </template>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { connect, github, server, state, toast } from '../store.js'
import Icon from '../components/Icon.vue'

const entries = ref([])
const loading = ref(false)
const error = ref('')
const confirming = ref(null)
const restoring = ref(false)

const when = (date) => (date ? new Date(date).toLocaleString([], { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '')

async function load() {
  if (!state.connected) return
  loading.value = true
  error.value = ''
  try {
    if (state.mode === 'github') entries.value = (await github().history()).map((c) => ({ ...c, id: c.sha }))
    else entries.value = (await server().versions()).map((v) => ({ id: v.id, message: v.message, date: v.createdAt, by: v.by, keys: v.keys }))
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function restore(id) {
  restoring.value = true
  try {
    await server().restore(id)
    await connect()
    toast('Restored. The site shows that version now.', { tone: 'ok' })
    await load()
  } catch (e) {
    toast(e.message, { tone: 'error' })
  } finally {
    restoring.value = false
    confirming.value = null
  }
}

onMounted(load)
</script>

<style scoped>
.history {
  max-width: 52rem;
}
.rows {
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--line);
  border-radius: var(--r);
}
.row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 3.5rem;
  padding: 0.625rem 0.75rem 0.625rem 1rem;
}
.row + .row {
  border-top: 1px solid var(--line);
}
.text {
  display: grid;
  flex: 1;
  min-width: 0;
  font-size: 0.875rem;
}
.meta {
  color: var(--muted);
  font-size: 0.8125rem;
}
.skeleton span {
  display: block;
  height: 0.75rem;
  border-radius: 0.25rem;
  background: var(--hover);
}
.skeleton span:first-child {
  width: 40%;
}
.skeleton span:last-child {
  width: 20%;
  margin-left: auto;
}
.empty {
  display: grid;
  justify-items: start;
  gap: 0.75rem;
  padding: 1.25rem;
  color: var(--muted);
}
.empty p {
  max-width: 60ch;
}
</style>
