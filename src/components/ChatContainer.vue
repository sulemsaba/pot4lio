<!-- src/components/ChatContainer.vue -->
<template>
  <section class="chat-container" :class="{ 'light-theme': isLightTheme }">
    <!-- Messages Area -->
    <div 
      class="messages" 
      ref="messagesRef" 
      role="log" 
      aria-live="polite"
      @scroll="handleScroll"
      :style="{ 
        'padding-bottom': showScrollButton ? '6rem' : '4rem'
      }"
    >
      <!-- Message list -->
      <MessageBubble
        v-for="(msg, index) in messages"
        :key="msg.id || index"
        :role="msg.role"
        :content="msg.content"
        :timestamp="msg.timestamp"
        :is-streaming="isStreaming && index === messages.length - 1"
        @delete="deleteMessage(msg.id)"
      />

      <!-- Typing indicator -->
      <div v-if="isTyping" class="typing-indicator-wrapper">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    </div>

    <!-- Scroll to bottom button -->
    <button 
      v-if="showScrollButton" 
      class="scroll-bottom-btn"
      @click="scrollToBottom(true)"
      :class="{ 'pulse': scrollButtonPulse }"
      aria-label="Scroll to bottom"
      title="Scroll to latest messages"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" fill="currentColor"/>
      </svg>
    </button>

    <!-- Input Area -->
    <div class="input-container">
      <InputArea 
        @send="handleSend"
        @typing-start="handleTypingStart"
        @typing-end="handleTypingEnd"
        :disabled="isTyping"
      />
      
      <!-- Quick Suggestions -->
      <div v-if="showSuggestions" class="quick-suggestions">
        <button 
          v-for="(suggestion, index) in suggestions" 
          :key="index"
          class="suggestion-btn"
          @click="handleSuggestionClick(suggestion)"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, nextTick, onMounted, watch, computed } from 'vue'
import MessageBubble from './MessageBubble.vue'
import InputArea from './InputArea.vue'
import { getBotResponse } from '../data/portfolio-data.js'

// Theme
const isLightTheme = ref(false)

// Messages
const messages = ref([
  {
    id: generateId(),
    role: 'assistant',
    content: 'Hi 👋 I am a ChatGPT-style portfolio assistant. Ask me about my projects, skills, or experience.',
    timestamp: new Date()
  }
])

// UI States
const isTyping = ref(false)
const isStreaming = ref(false)
const showScrollButton = ref(false)
const scrollButtonPulse = ref(false)

// Refs
const messagesRef = ref(null)

// Quick suggestions
const suggestions = [
  'Tell me about your projects',
  'What technologies do you use?',
  'Show me your experience',
  'What are your skills?'
]

const showSuggestions = computed(() => {
  return messages.value.length <= 2 && !isTyping.value
})

// Generate unique ID for messages
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Handle user scroll
function handleScroll() {
  const container = messagesRef.value
  if (!container) return
  
  const scrollPosition = container.scrollTop + container.clientHeight
  const totalHeight = container.scrollHeight
  
  showScrollButton.value = totalHeight - scrollPosition > 100
  
  if (totalHeight - scrollPosition > 300 && messages.value[messages.value.length - 1]?.role === 'assistant') {
    scrollButtonPulse.value = true
    setTimeout(() => scrollButtonPulse.value = false, 2000)
  }
}

// Scroll to bottom
const scrollToBottom = async (smooth = false) => {
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTo({
      top: messagesRef.value.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    })
    showScrollButton.value = false
  }
}

// Handle sending messages
async function handleSend(text) {
  if (!text.trim() || isTyping.value) return
  
  // Add user message
  const userMessage = {
    id: generateId(),
    role: 'user',
    content: text.trim(),
    timestamp: new Date()
  }
  messages.value.push(userMessage)
  
  await scrollToBottom()
  
  // Typing indicator
  isTyping.value = true

  setTimeout(async () => {
    const reply = getBotResponse(text)
    await simulateStreaming(reply)
    isTyping.value = false
    isStreaming.value = false
    await scrollToBottom(true)
  }, 800)
}

// Simulate streaming response
async function simulateStreaming(text) {
  isStreaming.value = true
  const botMessage = {
    id: generateId(),
    role: 'assistant',
    content: '',
    timestamp: new Date()
  }
  messages.value.push(botMessage)
  const words = text.split(' ')
  const messageIndex = messages.value.length - 1

  for (const word of words) {
    await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 20))
    messages.value[messageIndex].content += (messages.value[messageIndex].content ? ' ' : '') + word
    if (words.indexOf(word) % 5 === 0) await scrollToBottom()
  }
}

// Handle quick suggestions
function handleSuggestionClick(suggestion) {
  handleSend(suggestion)
}

// Typing events
function handleTypingStart() {}
function handleTypingEnd() {}

// Delete a message
function deleteMessage(id) {
  const idx = messages.value.findIndex(m => m.id === id)
  if (idx !== -1) messages.value.splice(idx, 1)
}

watch(messages, async (newMessages, oldMessages) => {
  if (newMessages.length > oldMessages.length) {
    const lastMessage = newMessages[newMessages.length - 1]
    if (lastMessage.role === 'user') await scrollToBottom()
  }
}, { deep: true })

// Initialize
onMounted(() => {
  setTimeout(() => scrollToBottom(), 100)
  const savedTheme = localStorage.getItem('portfolio-chat-theme')
  if (savedTheme) {
    isLightTheme.value = savedTheme === 'light'
  } else {
    isLightTheme.value = window.matchMedia('(prefers-color-scheme: light)').matches
  }
})
</script>

<style scoped>
/* Keep your current gradient, padding, and scroll styles here... 
   This will work perfectly with your MessageBubble.vue and InputArea.vue
   No major structural changes needed
*/
</style>
