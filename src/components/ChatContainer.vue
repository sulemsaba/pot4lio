<template>
  <div class="chat-container">
    <div class="chat-header">
      <div class="chat-title">
        <h1>Portfolio Assistant</h1>
        <p class="chat-subtitle">Ask me anything about my work and experience</p>
      </div>
      <div class="chat-stats">
        <span class="stat-item">{{ messages.length }} messages</span>
        <span class="stat-item">{{ onlineStatus }}</span>
      </div>
    </div>
    
    <div class="messages-container" ref="messagesContainer">
      <MessageBubble 
        v-for="message in messages" 
        :key="message.id"
        :message="message"
      />
      
      <div v-if="isTyping" class="typing-indicator">
        <div class="typing-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        <span class="typing-text">Assistant is typing...</span>
      </div>
      
      <div v-if="messages.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <h3>Start a conversation</h3>
        <p>Ask about my skills, projects, experience, or contact information.</p>
        <div class="suggestions">
          <button 
            v-for="suggestion in suggestions" 
            :key="suggestion"
            @click="$emit('send-message', suggestion)"
            class="suggestion-btn"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>
    
    <InputArea @send-message="handleSendMessage" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import MessageBubble from './MessageBubble.vue';
import InputArea from './InputArea.vue';

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  isTyping: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['send-message']);

const messagesContainer = ref(null);
const onlineStatus = ref('Online');
const suggestions = [
  'Tell me about your projects',
  'What are your skills?',
  'What is your work experience?',
  'How can I contact you?'
];

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const handleSendMessage = (message) => {
  emit('send-message', message);
};

// Watch for new messages and scroll to bottom
watch(() => props.messages.length, scrollToBottom);
watch(() => props.isTyping, scrollToBottom);

onMounted(() => {
  scrollToBottom();
  
  // Simulate online status
  setInterval(() => {
    onlineStatus.value = Math.random() > 0.1 ? 'Online' : 'Online';
  }, 10000);
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.chat-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.chat-title h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.chat-subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.chat-stats {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background-color: var(--bg-tertiary);
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  width: fit-content;
  max-width: 80%;
  animation: fadeIn 0.3s ease;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: var(--text-secondary);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

.typing-text {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  padding: 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 2rem;
  max-width: 400px;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  max-width: 500px;
}

.suggestion-btn {
  padding: 0.75rem 1.25rem;
  background-color: var(--bg-tertiary);
  border: none;
  border-radius: 0.5rem;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.suggestion-btn:hover {
  background-color: var(--user-message);
  color: white;
  transform: translateY(-2px);
}

/* Animations */
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 768px) {
  .chat-header {
    padding: 1rem;
  }
  
  .chat-title h1 {
    font-size: 1.25rem;
  }
  
  .messages-container {
    padding: 1rem;
  }
  
  .typing-indicator {
    max-width: 90%;
  }
  
  .suggestions {
    flex-direction: column;
    width: 100%;
  }
  
  .suggestion-btn {
    width: 100%;
  }
}
</style>