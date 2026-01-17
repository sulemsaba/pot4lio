<template>
  <div class="chat-container" :class="{ centered: isCentered }">
    <!-- Messages Area -->
    <div class="chat-messages" ref="messagesContainer" :class="{ hidden: isCentered && messages.length === 0 }">
      <!-- Messages -->
      <div class="messages-list" role="log" aria-live="polite" aria-label="Chat messages">
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

    <!-- Starter Suggestions (initial centered state) -->
    <div v-if="isCentered && messages.length === 0" class="starter" aria-label="Suggested prompts">
      <div class="starter-grid" role="list">
        <button
          v-for="s in suggestions"
          :key="s.id"
          type="button"
          class="starter-card"
          role="listitem"
          @click="handleSuggestion(s)"
        >
          <component :is="s.icon" class="starter-icon" aria-hidden="true" />
          <div class="starter-copy">
            <div class="starter-title">{{ s.title }}</div>
            <div class="starter-sub">{{ s.query }}</div>
          </div>
        </button>
      </div>
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
import { ref, watch, nextTick, onMounted, defineExpose } from 'vue'
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

defineExpose({ scrollToBottom })

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

/* Starter Suggestions */
.starter {
  width: 100%;
  padding: 0 16px 18px;
}

.starter-grid {
  max-width: 760px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.starter-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}

.starter-card:hover {
  background: var(--surface-hover);
  border-color: var(--border-medium);
  transform: translateY(-1px);
}

.starter-card:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.starter-icon {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  flex: 0 0 auto;
  color: var(--text-secondary);
}

.starter-copy {
  min-width: 0;
}

.starter-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.starter-sub {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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

  .starter {
    padding: 0 12px 14px;
  }

  .starter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
