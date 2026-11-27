<template>
  <form class="compose" @submit.prevent="send">
    <h2 class="title swap">{{ t.composeTitle }}</h2>

    <div class="row">
      <span class="label swap">{{ t.composeTo }}</span>
      <span class="to">{{ email }}</span>
      <button type="button" class="copy" :class="{ done: copied }" @click="copyEmail">
        <span class="swap">{{ copied ? t.copied : t.copy }}</span>
      </button>
      <span class="visually-hidden" aria-live="polite">{{ copied ? t.copied : '' }}</span>
    </div>

    <!-- With a server connected, the message goes straight to it, so it needs a way to reply. -->
    <label v-if="direct" class="row">
      <span class="label swap">{{ t.composeFrom }}</span>
      <input v-model="from" type="text" maxlength="160" autocomplete="email" :placeholder="t.composeFromPlaceholder" />
    </label>
    <label class="row">
      <span class="label swap">{{ t.composeSubject }}</span>
      <input v-model="subject" type="text" maxlength="160" :placeholder="t.composeSubjectPlaceholder" />
    </label>

    <label class="row row--message">
      <span class="label swap">{{ t.composeMessage }}</span>
      <textarea v-model="body" rows="5" maxlength="4000" :placeholder="t.composeMessagePlaceholder"></textarea>
    </label>

    <!-- A trap for spam bots: people never see it, bots fill it in. -->
    <input v-if="direct" v-model="trap" class="trap" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
    <div class="send-row">
      <p v-if="direct && state !== 'idle'" class="state" role="status">{{ stateText }}</p>
      <button type="submit" class="button button--ink" :disabled="!ready"><span class="swap">{{ direct ? (state === 'sending' ? t.composeSending : t.composeSendDirect) : t.composeSend }}</span></button>
    </div>
  </form>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { API, sendMessage } from '../site.js'

const props = defineProps({
  email: { type: String, required: true },
  t: { type: Object, required: true },
})

const subject = ref('')
const body = ref('')

// With a server (VITE_API_URL), the message is sent from here and lands in the admin page's
// inbox. Without one, it opens in the visitor's own email app, ready to send.
const direct = Boolean(API)
const from = ref('')
const trap = ref('')
const state = ref('idle') // idle, sending, done, failed
const ready = computed(() => body.value.trim() && (!direct || (from.value.trim() && state.value !== 'sending')))
const stateText = computed(() => ({ sending: props.t.composeSending, done: props.t.composeDone, failed: props.t.composeFailed })[state.value] || '')

async function send() {
  if (!body.value.trim()) return
  if (direct) {
    if (!from.value.trim()) return
    state.value = 'sending'
    const contact = from.value.trim()
    try {
      await sendMessage({
        email: contact.includes('@') ? contact : '',
        phone: contact.includes('@') ? '' : contact,
        subject: subject.value.trim(),
        message: body.value.trim(),
        page: 'contact',
        website: trap.value,
      })
      state.value = 'done'
      subject.value = ''
      body.value = ''
    } catch {
      state.value = 'failed'
    }
    return
  }
  const query = new URLSearchParams({ subject: subject.value.trim(), body: body.value.trim() }).toString().replace(/\+/g, '%20')
  window.location.href = `mailto:${props.email}?${query}`
}

// Copy the address, with a fallback for browsers without the Clipboard API.
const copied = ref(false)
let timer = 0

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(props.email)
  } catch {
    const area = document.createElement('textarea')
    area.value = props.email
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    document.execCommand('copy')
    area.remove()
  }
  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (copied.value = false), 2200)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.compose {
  display: flex;
  flex-direction: column;
  padding: 0.5rem clamp(1.25rem, 2.4vw, 1.75rem) clamp(1.25rem, 2.4vw, 1.75rem);
  border-radius: var(--radius);
  background: var(--soft);
}

.title {
  margin: 0;
  padding: 1rem 0 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

/* Rows like an email header: a label, then the field. */
.row {
  display: grid;
  grid-template-columns: 4.75rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  min-height: 3.25rem;
  border-top: 1px solid var(--line);
}

.row--message {
  flex: 1;
  align-items: start;
  padding-top: 0.875rem;
}

.label {
  color: var(--muted);
  font-size: 0.875rem;
}

.to {
  min-width: 0;
  font-weight: 500;
  overflow-wrap: anywhere;
}

input,
textarea {
  grid-column: 2 / -1;
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: 0;
  background: none;
  color: inherit;
  font: inherit;
}

textarea {
  min-height: 7.5rem;
  height: 100%;
  resize: vertical;
  line-height: 1.5;
}

input::placeholder,
textarea::placeholder {
  color: var(--muted);
  opacity: 1;
}

.row:focus-within .label {
  color: var(--ink);
}

.copy {
  min-height: 2rem;
  padding: 0 0.75rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--bg);
  color: var(--muted);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.copy:hover,
.copy.done {
  border-color: var(--ink);
  color: var(--ink);
}

.send-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
}

.trap {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}
.state {
  margin: 0 auto 0 0;
  align-self: center;
  color: var(--muted);
  font-size: 0.875rem;
}
/* Until there is a message, the button waits quietly as an outline. */
.send-row .button:disabled {
  border-color: var(--line);
  background: transparent;
  color: var(--muted);
  cursor: default;
}

@media (max-width: 30rem) {
  .row {
    grid-template-columns: 4rem minmax(0, 1fr) auto;
  }

  .send-row .button {
    width: 100%;
  }
}
</style>
