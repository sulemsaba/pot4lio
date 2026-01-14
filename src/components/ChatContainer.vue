<template>
  <div class="chat-container" :class="{ centered: isCentered }">
    <!-- Messages Area -->
    <div class="chat-messages" ref="messagesContainer" :class="{ hidden: isCentered && messages.length === 0 }">
      <!-- Messages -->
      <div class="messages-list">
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
      :is-centered="isCentered"
      @send="handleSend"
      @footer-action="handleFooterAction"
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
  },
  isCentered: {
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

const handleFooterAction = (action) => {
  // Map footer actions to queries
  const actionQueries = {
    'Projects': 'Tell me about your projects',
    'About': 'Tell me about yourself',
    'Contact': 'How can I contact you?',
    'Contacts': 'How can I contact you?',
    'Skills': 'What technologies do you use?',
    'Experience': 'Tell me about your experience'
  }
  
  const query = actionQueries[action] || `Tell me about ${action}`
  emit('send-message', { text: query })
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
  transition: all 0.4s ease;
}

/* Centered mode (initial state like ChatGPT) */
.chat-container.centered {
  justify-content: center;
}

/* Messages Area */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px 16px;
  transition: all 0.4s ease;
}

.chat-messages.hidden {
  display: none;
}

/* Messages List */
.messages-list {
  max-width: 760px;
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
  .chat-messages {
    padding: 16px 12px;
  }
}
</style>
