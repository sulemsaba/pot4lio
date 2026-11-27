<template>
  <section class="inbox">
    <header class="page-head">
      <div>
        <h1 data-title tabindex="-1">Inbox</h1>
        <p>Messages people send from the contact page.</p>
      </div>
      <div v-if="ready" class="actions">
        <div class="seg" role="radiogroup" aria-label="Show">
          <button type="button" role="radio" :aria-checked="String(filter === 'all')" @click="filter = 'all'">All</button>
          <button type="button" role="radio" :aria-checked="String(filter === 'unread')" @click="filter = 'unread'">Unread <span v-if="unread" class="badge">{{ unread }}</span></button>
        </div>
        <button type="button" class="icon-btn" aria-label="Check for new messages" @click="load"><Icon name="refresh" :size="16" :class="{ spin: loading }" /></button>
      </div>
    </header>

    <div v-if="!ready" class="empty panel">
      <Icon name="inbox" :size="22" />
      <p>Today the contact form opens the visitor's own email app, so messages arrive in your Gmail. Once your server is connected, the form sends messages here instead, and the visitor never leaves the site.</p>
      <a class="btn" href="#/settings">Connect a server</a>
    </div>

    <template v-else>
      <p v-if="error" class="note note--bad" role="alert"><Icon name="alert" :size="16" />{{ error }}</p>
      <ul v-if="loading && !messages.length" class="list" aria-busy="true">
        <li v-for="n in 4" :key="n" class="msg skeleton"><span></span><span></span></li>
      </ul>
      <p v-else-if="!shown.length" class="empty-line">{{ filter === 'unread' ? 'No unread messages.' : 'No messages yet. They show up here as soon as someone writes.' }}</p>
      <ul v-else class="list">
        <li v-for="m in shown" :key="m.id" class="msg" :class="{ unread: !m.read, open: openId === m.id }">
          <button type="button" class="msg-head" :aria-expanded="String(openId === m.id)" @click="toggle(m)">
            <span v-if="!m.read" class="dot" title="Unread"></span>
            <span class="from">{{ m.name || m.email || m.phone || 'Someone' }}</span>
            <span class="subject">{{ m.subject || m.message }}</span>
            <span class="date">{{ when(m.createdAt) }}</span>
          </button>
          <div v-if="openId === m.id" class="msg-body">
            <p class="contact">
              <a v-if="m.email" :href="`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject || 'your message'))}`">{{ m.email }}</a>
              <a v-if="m.phone" :href="`https://wa.me/${m.phone.replace(/\D/g, '')}`" target="_blank" rel="noopener">{{ m.phone }}</a>
            </p>
            <p class="text">{{ m.message }}</p>
            <div class="msg-actions">
              <a v-if="m.email" class="btn btn--sm btn--ink" :href="`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject || 'your message'))}`"><Icon name="mail" :size="16" /> Reply</a>
              <a v-else-if="m.phone" class="btn btn--sm btn--ink" :href="`https://wa.me/${m.phone.replace(/\D/g, '')}`" target="_blank" rel="noopener"><Icon name="chat" :size="16" /> Reply on WhatsApp</a>
              <button type="button" class="btn btn--sm" @click="mark(m, !m.read)">Mark as {{ m.read ? 'unread' : 'read' }}</button>
              <button type="button" class="btn btn--sm btn--danger" @click="remove(m)"><Icon name="trash" :size="16" /> Delete</button>
            </div>
          </div>
        </li>
      </ul>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { server, state, toast } from '../store.js'
import Icon from '../components/Icon.vue'

const ready = computed(() => state.mode === 'server' && state.connected)
const messages = ref([])
const loading = ref(false)
const error = ref('')
const filter = ref('all')
const openId = ref(null)

const shown = computed(() => (filter.value === 'unread' ? messages.value.filter((m) => !m.read) : messages.value))
const unread = computed(() => messages.value.filter((m) => !m.read).length)
const when = (date) => new Date(date).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

async function load() {
  if (!ready.value) return
  loading.value = true
  error.value = ''
  try {
    messages.value = await server().messages('all')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function mark(m, read) {
  try {
    Object.assign(m, await server().markMessage(m.id, read))
  } catch (e) {
    toast(e.message, { tone: 'error' })
  }
}

function toggle(m) {
  openId.value = openId.value === m.id ? null : m.id
  if (openId.value && !m.read) mark(m, true)
}

async function remove(m) {
  try {
    await server().deleteMessage(m.id)
    messages.value = messages.value.filter((x) => x.id !== m.id)
    toast('Message deleted.')
  } catch (e) {
    toast(e.message, { tone: 'error' })
  }
}

onMounted(load)
// Opened straight from a link, the page may still be signing in.
watch(ready, (now) => now && load())
</script>

<style scoped>
.inbox {
  max-width: 52rem;
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
.empty-line {
  padding: 2rem 0;
  color: var(--muted);
}
.seg {
  display: inline-flex;
  padding: 0.1875rem;
  border-radius: 999px;
  background: var(--panel);
}
.seg button {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 1.875rem;
  padding: 0 0.75rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 550;
  cursor: pointer;
}
.seg button[aria-checked='true'] {
  background: var(--bg);
  color: var(--ink);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.12);
}
.list {
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--line);
  border-radius: var(--r);
}
.msg + .msg {
  border-top: 1px solid var(--line);
}
.msg-head {
  display: grid;
  grid-template-columns: 0.5rem minmax(6rem, 12rem) minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 3.25rem;
  padding: 0.5rem 1rem;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
}
.msg-head:hover {
  background: var(--panel);
}
.msg-head .dot {
  grid-column: 1;
  background: var(--sky);
}
.from {
  grid-column: 2;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.unread .from {
  font-weight: 650;
}
.subject {
  overflow: hidden;
  color: var(--muted);
  white-space: nowrap;
  text-overflow: ellipsis;
}
.date {
  color: var(--faint);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.msg-body {
  display: grid;
  gap: 0.75rem;
  padding: 0 1rem 1rem 2.25rem;
}
.contact {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
}
.contact a {
  color: var(--sky);
}
.text {
  max-width: 68ch;
  white-space: pre-wrap;
  line-height: 1.6;
}
.msg-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.skeleton {
  display: flex;
  gap: 1rem;
  padding: 1.125rem 1rem;
}
.skeleton span {
  display: block;
  height: 0.75rem;
  border-radius: 0.25rem;
  background: var(--hover);
}
.skeleton span:first-child {
  width: 20%;
}
.skeleton span:last-child {
  flex: 1;
}
@media (max-width: 40rem) {
  .msg-head {
    grid-template-columns: 0.5rem minmax(0, 1fr) auto;
  }
  .subject {
    grid-column: 2 / -1;
    grid-row: 2;
  }
  .msg-body {
    padding-left: 1rem;
  }
}
</style>
