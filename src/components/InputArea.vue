<template>
  <div class="input-area">
    <div class="input-wrapper">
      <!-- Attachment Button -->
      <button 
        class="input-action-btn attachment-btn"
        @click="handleAttachment"
        aria-label="Attach file"
        title="Attach file"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
      </button>

      <!-- Input Container -->
      <div class="input-container">
        <textarea
          ref="textareaRef"
          v-model="message"
          :placeholder="placeholder"
          rows="1"
          class="chat-input"
          @keydown="handleKeydown"
          @input="adjustHeight"
          :disabled="isTyping"
          aria-label="Message input"
        ></textarea>
        
        <!-- Character Counter (optional) -->
        <div v-if="showCharCount && message.length > 0" class="char-counter">
          {{ message.length }}
        </div>
      </div>

      <!-- Send Button -->
      <button 
        class="input-action-btn send-btn"
        @click="sendMessage"
        :disabled="!message.trim() || isTyping"
        aria-label="Send message"
        title="Send message"
      >
        <svg 
          v-if="!isTyping" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
        >
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
        <div v-else class="loading-spinner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
          </svg>
        </div>
      </button>
    </div>

    <!-- Input Hint -->
    <div class="input-footer">
      <p class="input-hint">
        <kbd>Enter</kbd> to send, <kbd>Shift</kbd> + <kbd>Enter</kbd> for new line
      </p>
      <p class="input-info">
        AI can make mistakes. Check important info.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const emit = defineEmits(['send', 'attach'])

const props = defineProps({
  placeholder: {
    type: String,
    default: "Message Suleiman's assistant..."
  },
  isTyping: {
    type: Boolean,
    default: false
  },
  showCharCount: {
    type: Boolean,
    default: false
  }
})

const message = ref('')
const textareaRef = ref(null)

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const sendMessage = () => {
  const trimmed = message.value.trim()
  if (!trimmed || props.isTyping) return
  
  emit('send', { text: trimmed })
  message.value = ''
  resetHeight()
  
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

const handleAttachment = () => {
  emit('attach')
}

const adjustHeight = () => {
  if (!textareaRef.value) return
  textareaRef.value.style.height = 'auto'
  const newHeight = Math.min(textareaRef.value.scrollHeight, 200)
  textareaRef.value.style.height = `${newHeight}px`
}

const resetHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
}

onMounted(() => {
  textareaRef.value?.focus()
})
</script>

<style scoped>
.input-area {
  padding: 16px 20px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-subtle);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 8px;
}

.input-action-btn {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.input-action-btn:hover:not(:disabled) {
  background: var(--surface-hover);
  border-color: var(--border-medium);
  color: var(--text-primary);
}

.input-action-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.input-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn:not(:disabled) {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: white;
}

.send-btn:hover:not(:disabled) {
  background: var(--brand-hover);
  border-color: var(--brand-hover);
  box-shadow: 0 2px 8px rgba(var(--brand-primary-rgb, 16, 163, 127), 0.3);
}

.loading-spinner svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.input-container {
  flex: 1;
  position: relative;
  background: var(--surface);
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
}

.input-container:focus-within {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(var(--brand-primary-rgb, 16, 163, 127), 0.1);
}

.chat-input {
  flex: 1;
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 15px;
  font-family: inherit;
  line-height: 1.6;
  resize: none;
  padding: 10px 16px;
  max-height: 200px;
  overflow-y: auto;
}

.chat-input::placeholder {
  color: var(--text-tertiary);
}

.chat-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chat-input::-webkit-scrollbar {
  width: 6px;
}

.chat-input::-webkit-scrollbar-track {
  background: transparent;
}

.chat-input::-webkit-scrollbar-thumb {
  background: var(--border-subtle);
  border-radius: 3px;
}

.chat-input::-webkit-scrollbar-thumb:hover {
  background: var(--border-medium);
}

.char-counter {
  position: absolute;
  right: 12px;
  bottom: 8px;
  font-size: 11px;
  color: var(--text-tertiary);
  pointer-events: none;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.input-hint,
.input-info {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.input-hint kbd {
  display: inline-block;
  padding: 2px 6px;
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  font-size: 11px;
  font-family: inherit;
  font-weight: 500;
  color: var(--text-secondary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Responsive */
@media (max-width: 768px) {
  .input-area {
    padding: 12px 16px;
  }

  .input-wrapper {
    gap: 6px;
  }

  .input-action-btn {
    width: 36px;
    height: 36px;
  }

  .input-action-btn svg {
    width: 18px;
    height: 18px;
  }

  .chat-input {
    font-size: 14px;
    padding: 9px 12px;
  }

  .input-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .input-hint,
  .input-info {
    font-size: 11px;
  }
}

/* Dark theme enhancements */
[data-theme="dark"] .input-container:focus-within {
  box-shadow: 0 0 0 3px rgba(var(--brand-primary-rgb, 16, 163, 127), 0.15);
}

[data-theme="dark"] .send-btn:hover:not(:disabled) {
  box-shadow: 0 2px 12px rgba(var(--brand-primary-rgb, 16, 163, 127), 0.4);
}

/* Light theme enhancements */
[data-theme="light"] .input-container {
  background: white;
}

[data-theme="light"] .input-action-btn {
  background: white;
}

[data-theme="light"] .input-hint kbd {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .input-action-btn,
  .input-container {
    transition: none;
  }

  .loading-spinner svg {
    animation: none;
  }

  .input-action-btn:active:not(:disabled) {
    transform: none;
  }
}

/* Focus visible for keyboard navigation */
.input-action-btn:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}
</style>
