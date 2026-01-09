<template>
  <section class="chat-container">
    <div class="messages">
      <MessageBubble
        v-for="(msg, index) in messages"
        :key="index"
        :role="msg.role"
        :content="msg.content"
      />
    </div>

    <InputArea @send="handleSend" />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import MessageBubble from './MessageBubble.vue'
import InputArea from './InputArea.vue'
import portfolioData from '../data/portfolio-data'

const messages = ref([
  {
    role: 'assistant',
    content: 'Hi 👋 I am a ChatGPT-style portfolio. Ask me about my projects, skills, or experience.'
  }
])

function handleSend(text) {
  messages.value.push({ role: 'user', content: text })

  const reply = portfolioData.getResponse(text)
  messages.value.push({ role: 'assistant', content: reply })
}
</script>

<style scoped>
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}
</style>
