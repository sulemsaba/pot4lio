<template>
  <div :class="['message', role]">
    <div class="bubble">
      {{ content }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  role: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.message {
  display: flex;
  margin-bottom: 1.5rem;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.bubble {
  max-width: 75%;
  padding: 0.9rem 1.1rem;
  border-radius: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.message.user .bubble {
  background-color: var(--accent);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .bubble {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
}
</style>
