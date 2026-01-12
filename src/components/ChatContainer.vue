<template>
  <div class="chat-container">
    <!-- Messages Area -->
    <div class="chat-messages" ref="messagesContainer">
      <!-- Welcome Screen -->
      <div v-if="messages.length === 0" class="welcome-screen">
        <div class="welcome-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h1 class="welcome-title">How can I help you?</h1>
        <p class="welcome-subtitle">Ask about projects, skills, experience, or contact info</p>
        
        <div class="suggestion-grid">
          <button 
            v-for="suggestion in suggestions" 
            :key="suggestion.id"
            class="suggestion-btn"
            @click="handleSuggestion(suggestion)"
          >
            <component :is="suggestion.icon" class="suggestion-icon" />
            <span>{{ suggestion.title }}</span>
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div v-else class="messages-list">
        <MessageBubble
          v-for="msg in messages"
          :key="msg.id"
          :message="msg"
          :is-user="msg.isUser"
        />
        
        <!-- Typing Indicator -->
        <div v-if="isTyping" class="typing-indicator">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
      
      <div ref="scrollAnchor"></div>
    </div>

    <!-- Input Area -->
    <InputArea
      :is-typing="isTyping"
      @send="handleSend"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { Briefcase, Code, User, Mail } from 'lucide-vue-next'
import MessageBubble from './MessageBubble.vue'
import InputArea from './InputArea.vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  isTyping: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send-message'])

const messagesContainer = ref(null)
const scrollAnchor = ref(null)

const suggestions = [
  { id: 'projects', icon: Briefcase, title: 'View projects', query: 'Tell me about your projects' },
  { id: 'skills', icon: Code, title: 'Technical skills', query: 'What technologies do you use?' },
  { id: 'about', icon: User, title: 'About me', query: 'Tell me about yourself' },
  { id: 'contact', icon: Mail, title: 'Contact', query: 'How can I contact you?' }
]

const scrollToBottom = () => {
  nextTick(() => {
    scrollAnchor.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

const handleSend = (messageData) => {
  emit('send-message', messageData)
}

const handleSuggestion = (suggestion) => {
  emit('send-message', { text: suggestion.query })
}

watch(() => props.messages.length, scrollToBottom)
watch(() => props.isTyping, (typing) => { if (typing) scrollToBottom() })

onMounted(scrollToBottom)
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
}

/* Messages Area */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px 16px;
}

/* Welcome Screen */
.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  padding: 40px 20px;
}

.welcome-icon {
  width: 56px;
  height: 56px;
  background: var(--brand-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 20px;
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.welcome-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  max-width: 400px;
  width: 100%;
}

.suggestion-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.suggestion-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
  border-color: var(--brand-primary);
}

.suggestion-icon {
  width: 16px;
  height: 16px;
  color: var(--brand-primary);
  flex-shrink: 0;
}

/* Messages List */
.messages-list {
  max-width: 700px;
  margin: 0 auto;
}

/* Typing Indicator */
.typing-indicator {
  padding: 16px 0;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: var(--text-tertiary);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: 0s; }
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

/* Scrollbar */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--border-subtle);
  border-radius: 3px;
}

/* Responsive */
@media (max-width: 768px) {
  .suggestion-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-title {
    font-size: 20px;
  }
}
</style>
