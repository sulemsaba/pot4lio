<!-- src/components/MessageBubble.vue -->
<template>
  <div :class="['message-bubble', role]" :aria-label="role + ' message'">
    <div class="message-content">
      <p v-html="content"></p>
      <span class="timestamp">{{ formattedTime }}</span>
    </div>
    <button v-if="role==='user'" class="delete-btn" @click="$emit('delete')">
      &times;
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  role: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, required: true },
  isStreaming: { type: Boolean, default: false }
})

const formattedTime = computed(() => {
  const h = props.timestamp.getHours().toString().padStart(2,'0')
  const m = props.timestamp.getMinutes().toString().padStart(2,'0')
  return `${h}:${m}`
})
</script>

<style scoped>
.message-bubble {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  max-width: 75%;
  position: relative;
}

.message-bubble.user {
  align-self: flex-end;
  justify-content: flex-end;
}

.message-bubble.assistant {
  align-self: flex-start;
  justify-content: flex-start;
}

.message-content {
  background: rgba(68,70,84,0.5);
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  color: var(--text-primary, #ececf1);
  font-size: 0.875rem;
  line-height: 1.4;
  word-wrap: break-word;
  position: relative;
}

.message-bubble.user .message-content {
  background: var(--user-message, #10a37f);
  color: white;
}

.timestamp {
  display: block;
  font-size: 0.65rem;
  color: rgba(236,236,241,0.5);
  margin-top: 0.25rem;
  text-align: right;
}

/* Delete button */
.delete-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.6);
  font-size: 1rem;
  cursor: pointer;
  transition: color 0.2s;
}

.delete-btn:hover {
  color: red;
}

/* Streaming animation (optional) */
.message-bubble.assistant p::after {
  content: attr(data-stream);
}
</style>
