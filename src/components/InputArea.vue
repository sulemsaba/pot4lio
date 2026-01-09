<template>
  <form class="input-area" @submit.prevent="send">
    <input
      v-model="text"
      type="text"
      placeholder="Ask me about my portfolio..."
      @keydown.enter.exact.prevent="send"
    />
    <button type="submit">Send</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['send'])
const text = ref('')

function send() {
  if (!text.value.trim()) return
  emit('send', text.value)
  text.value = ''
}
</script>

<style scoped>
.input-area {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-primary);
}

input {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  outline: none;
}

input::placeholder {
  color: var(--text-muted);
}

button {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: none;
  background-color: var(--accent);
  color: white;
  cursor: pointer;
}

button:hover {
  opacity: 0.9;
}
</style>
