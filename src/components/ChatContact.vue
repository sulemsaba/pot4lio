<template>
  <div class="chat">
    <div class="chat-head">
      <img class="chat-photo" :src="photo" width="40" height="40" alt="" decoding="async" loading="lazy" />
      <p class="chat-who">
        <strong>{{ firstName }}</strong>
        <span class="swap">{{ t.chatChannel }}</span>
      </p>
    </div>

    <ol class="thread" aria-live="polite">
      <li class="bubble bubble--in swap">{{ t.chatGreeting }}</li>
      <li v-for="message in sent" :key="message.id" class="bubble bubble--out">
        {{ message.text }}
        <span class="receipt swap">{{ t.chatSent }}</span>
      </li>
    </ol>

    <form class="composer" @submit.prevent="send">
      <label class="visually-hidden" :for="fieldId">{{ t.chatLabel }}</label>
      <textarea
        :id="fieldId"
        ref="field"
        v-model="draft"
        rows="1"
        :placeholder="t.chatPlaceholder"
        maxlength="1000"
        @input="grow"
        @keydown.enter.exact.prevent="send"
      ></textarea>
      <button type="submit" class="send" :disabled="!draft.trim()" :aria-label="t.chatSend" :title="t.chatSend">
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M9 14.5V3.5M4 8.5l5-5 5 5" />
        </svg>
      </button>
    </form>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  photo: { type: String, required: true },
  whatsapp: { type: String, required: true },
  t: { type: Object, required: true },
})

const fieldId = 'chat-message'
const firstName = computed(() => props.name.split(' ')[0])
const field = ref(null)
const draft = ref('')
const sent = ref([])
let nextId = 0

function grow() {
  const el = field.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 160)}px`
}

// The message opens in WhatsApp, already typed, ready to send from there.
function send() {
  const text = draft.value.trim()
  if (!text) return
  const number = props.whatsapp.replace(/\D/g, '')
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  sent.value.push({ id: nextId++, text })
  draft.value = ''
  nextTick(grow)
}
</script>

<style scoped>
.chat {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius);
  background: var(--soft);
}

.chat-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--line);
}

.chat-photo {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
}

.chat-who {
  display: flex;
  flex-direction: column;
  margin: 0;
  line-height: 1.35;
}

.chat-who span {
  color: var(--muted);
  font-size: 0.875rem;
}

.thread {
  flex: 1;
  min-height: 11rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin: 0;
  padding: 1.25rem 1.25rem 0.5rem;
  list-style: none;
}

.bubble {
  max-width: 85%;
  padding: 0.625rem 0.875rem;
  border-radius: 1.125rem;
  line-height: 1.45;
  overflow-wrap: anywhere;
  white-space: pre-line;
}

.bubble--in {
  align-self: flex-start;
  border-bottom-left-radius: 0.375rem;
  background: var(--bubble);
}

.bubble--out {
  align-self: flex-end;
  display: flex;
  flex-direction: column;
  border-bottom-right-radius: 0.375rem;
  background: var(--sent);
  color: var(--sent-ink);
}

.receipt {
  align-self: flex-end;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  opacity: 0.7;
}

@media (prefers-reduced-motion: no-preference) {
  .bubble--out {
    animation: bubble-in 0.5s var(--ease-out) backwards;
    transform-origin: 100% 100%;
  }
}

@keyframes bubble-in {
  from {
    opacity: 0;
    transform: translate3d(0, 0.75rem, 0) scale(0.92);
  }
}

.composer {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  margin: 0.75rem;
  padding: 0.375rem 0.375rem 0.375rem 1rem;
  border: 1px solid var(--line);
  border-radius: 1.5rem;
  background: var(--bg);
  transition: border-color 0.2s ease;
}

.composer:focus-within {
  border-color: var(--muted);
}

textarea {
  flex: 1;
  min-width: 0;
  min-height: 2.25rem;
  padding: 0.5rem 0;
  border: 0;
  outline: 0;
  resize: none;
  background: none;
  color: inherit;
  font: inherit;
  line-height: 1.4;
}

textarea::placeholder {
  color: var(--muted);
  opacity: 1;
}

.send {
  display: grid;
  place-items: center;
  flex: none;
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  border-radius: 50%;
  background: var(--ink);
  color: var(--bg);
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    transform 0.3s var(--ease-out);
}

.send:hover:not(:disabled) {
  transform: translateY(-1px);
}

.send:disabled {
  opacity: 0.25;
  cursor: default;
}

.send:focus-visible {
  outline-offset: 2px;
  border-radius: 50%;
}

.send path {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
