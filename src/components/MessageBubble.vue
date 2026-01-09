<template>
  <div 
    class="message" 
    :class="[message.sender, { 'has-avatar': showAvatar }]"
    :aria-label="`${message.sender === 'user' ? 'You' : 'Assistant'} message`"
  >
    <div class="message-avatar" v-if="showAvatar">
      <div class="avatar-initial">
        {{ message.sender === 'user' ? 'Y' : 'A' }}
      </div>
    </div>
    
    <div class="message-content">
      <div class="message-text" v-html="formattedText"></div>
      <div class="message-time">
        {{ formattedTime }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  showAvatar: {
    type: Boolean,
    default: true
  }
});

const formattedTime = computed(() => {
  const date = new Date(props.message.timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});

const formattedText = computed(() => {
  // Simple markdown-like formatting
  let text = props.message.text;
  
  // Bold: **text**
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Headers: ### text
  text = text.replace(/^### (.*$)/gm, '<h3 class="message-header">$1</h3>');
  text = text.replace(/^## (.*$)/gm, '<h3 class="message-header">$1</h3>');
  text = text.replace(/^# (.*$)/gm, '<h2 class="message-header">$1</h2>');
  
  // Links: [text](url)
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener" class="message-link">$1</a>');
  
  // Lists: - item
  text = text.replace(/^- (.*$)/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)/s, '<ul class="message-list">$1</ul>');
  
  // New lines to <br>
  text = text.replace(/\n/g, '<br>');
  
  return text;
});
</script>

<style scoped>
.message {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 0.5rem;
  animation: fadeIn 0.3s ease;
  max-width: 85%;
}

.message.user {
  background-color: var(--user-message);
  color: white;
  margin-left: auto;
  border-bottom-right-radius: 0.25rem;
}

.message.bot {
  background-color: var(--bg-tertiary);
  border-bottom-left-radius: 0.25rem;
}

.message.has-avatar {
  padding-top: 0.75rem;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar-initial {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
}

.user .avatar-initial {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.bot .avatar-initial {
  background-color: var(--accent-color);
  color: white;
}

.message-content {
  flex: 1;
  min-width: 0; /* Prevent overflow */
}

.message-text {
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.message-text :deep(.message-header) {
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.message-text :deep(.message-header):first-child {
  margin-top: 0;
}

.message-text :deep(.message-link) {
  color: inherit;
  text-decoration: underline;
  opacity: 0.9;
}

.user .message-text :deep(.message-link) {
  color: white;
}

.message-text :deep(.message-list) {
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.message-text :deep(li) {
  margin-bottom: 0.25rem;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 0.5rem;
  display: flex;
  justify-content: flex-end;
}

.user .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.bot .message-time {
  color: var(--text-secondary);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 768px) {
  .message {
    max-width: 95%;
    padding: 1rem;
    gap: 0.75rem;
  }
  
  .avatar-initial {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
  }
}
</style>