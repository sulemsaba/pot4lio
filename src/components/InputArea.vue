<template>
  <div class="input-container">
    <div class="input-area" :class="{ 'has-text': inputText.trim(), 'focused': isFocused }">
      <!-- Attachment Button -->
      <button 
        class="icon-btn attachment-btn" 
        @click="handleAttachment"
        aria-label="Attach file"
        title="Attach file"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
      </button>

      <!-- Text Input Wrapper -->
      <div class="input-wrapper">
        <textarea
          ref="textareaRef"
          v-model="inputText"
          @keydown.enter.exact.prevent="handleSend"
          @keydown.enter.shift.exact.prevent="insertNewLine"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @compositionstart="handleCompositionStart"
          @compositionend="handleCompositionEnd"
          placeholder="Message Portfolio Assistant..."
          rows="1"
          :disabled="disabled"
          aria-label="Type your message"
          :maxlength="maxLength"
        ></textarea>
      </div>

      <!-- Send Button -->
      <button 
        class="send-btn" 
        :disabled="!canSend || disabled"
        @click="handleSend"
        aria-label="Send message"
        :title="canSend ? 'Send message' : 'Enter a message'"
      >
        <svg class="send-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </button>
    </div>
    
    <!-- Character Counter (only shows when approaching limit) -->
    <div v-if="showCharCounter" class="char-counter" :class="{ 'warning': charCount > maxLength * 0.9 }">
      {{ charCount }}/{{ maxLength }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const emit = defineEmits(['send', 'typing-start', 'typing-end', 'attachment'])

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Message Portfolio Assistant...'
  },
  maxLength: {
    type: Number,
    default: 2000
  },
  autoFocus: {
    type: Boolean,
    default: true
  }
})

// Refs
const inputText = ref('')
const textareaRef = ref(null)
const isFocused = ref(false)
const isTyping = ref(false)
const isComposing = ref(false)
const typingTimer = ref(null)

// Computed
const canSend = computed(() => {
  return inputText.value.trim().length > 0 && !isComposing.value
})

const showCharCounter = computed(() => {
  return inputText.value.length > props.maxLength * 0.8
})

const charCount = computed(() => {
  return inputText.value.length
})

// Methods
const handleSend = () => {
  if (!canSend.value || props.disabled) return
  
  const text = inputText.value.trim()
  emit('send', text)
  inputText.value = ''
  resetTextareaHeight()
  clearTypingIndicator()
  
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

const insertNewLine = () => {
  const textarea = textareaRef.value
  if (!textarea) return
  
  const cursorPos = textarea.selectionStart
  const textBefore = inputText.value.substring(0, cursorPos)
  const textAfter = inputText.value.substring(cursorPos)
  
  inputText.value = textBefore + '\n' + textAfter
  
  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = cursorPos + 1
    adjustHeight()
  })
}

const handleInput = () => {
  adjustHeight()
  
  clearTimeout(typingTimer.value)
  if (!isTyping.value) {
    isTyping.value = true
    emit('typing-start')
  }
  
  typingTimer.value = setTimeout(() => {
    isTyping.value = false
    emit('typing-end')
  }, 1000)
}

const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = () => {
  isFocused.value = false
  clearTypingIndicator()
}

const handleCompositionStart = () => {
  isComposing.value = true
}

const handleCompositionEnd = () => {
  isComposing.value = false
}

const adjustHeight = () => {
  const textarea = textareaRef.value
  if (!textarea) return
  
  requestAnimationFrame(() => {
    textarea.style.height = 'auto'
    const newHeight = Math.min(textarea.scrollHeight, 200)
    textarea.style.height = `${newHeight}px`
  })
}

const resetTextareaHeight = () => {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.style.height = 'auto'
  }
}

const clearTypingIndicator = () => {
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
    typingTimer.value = null
  }
  if (isTyping.value) {
    isTyping.value = false
    emit('typing-end')
  }
}

const handleAttachment = () => {
  emit('attachment')
}

// Lifecycle
onMounted(() => {
  if (props.autoFocus) {
    setTimeout(() => {
      textareaRef.value?.focus()
    }, 100)
  }
})

onUnmounted(() => {
  clearTypingIndicator()
})
</script>

<style scoped>
.input-container {
  position: relative;
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  padding: 0 1rem;
}

.input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px;
  background: #40414f;
  border-radius: 12px;
  border: 1px solid rgba(86, 88, 105, 0.5);
  transition: all 0.15s ease;
  box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
}

.input-area.focused {
  border-color: rgba(217, 217, 227, 0.3);
  background: #40414f;
  box-shadow: 0 0 0 2px rgba(217, 217, 227, 0.1);
}

/* Icon Buttons */
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.15s ease;
  color: #8e8ea0;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
}

.icon-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  color: #ececf1;
}

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Input Wrapper */
.input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  min-height: 40px;
}

/* Textarea */
textarea {
  width: 100%;
  background: transparent;
  border: none;
  color: #ececf1;
  font-size: 16px;
  line-height: 24px;
  resize: none;
  outline: none;
  padding: 8px 0;
  min-height: 24px;
  max-height: 200px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  overflow-y: auto;
}

textarea::placeholder {
  color: #8e8ea0;
}

textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Custom scrollbar for textarea */
textarea::-webkit-scrollbar {
  width: 4px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background: rgba(217, 217, 227, 0.2);
  border-radius: 2px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(217, 217, 227, 0.3);
}

/* Send Button */
.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ececf1;
  border: none;
  cursor: pointer;
  padding: 0;
  border-radius: 8px;
  transition: all 0.15s ease;
  color: #2f2f2f;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
}

.send-btn:hover:not(:disabled) {
  background: #d9d9e3;
}

.send-btn:disabled {
  background: rgba(236, 236, 241, 0.3);
  cursor: not-allowed;
}

.send-icon {
  width: 20px;
  height: 20px;
}

/* Character Counter */
.char-counter {
  position: absolute;
  bottom: -24px;
  right: 16px;
  font-size: 12px;
  color: #8e8ea0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.char-counter.warning {
  color: #ef4444;
}

/* Light Theme Support */
@media (prefers-color-scheme: light) {
  .input-area {
    background: #ffffff;
    border-color: rgba(0, 0, 0, 0.1);
  }
  
  .input-area.focused {
    border-color: rgba(0, 0, 0, 0.2);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
  }
  
  textarea {
    color: #2f2f2f;
  }
  
  textarea::placeholder {
    color: #6e6e80;
  }
  
  .icon-btn {
    color: #6e6e80;
  }
  
  .icon-btn:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.05);
    color: #2f2f2f;
  }
  
  .send-btn {
    background: #2f2f2f;
    color: #ffffff;
  }
  
  .send-btn:hover:not(:disabled) {
    background: #1a1a1a;
  }
  
  .send-btn:disabled {
    background: rgba(0, 0, 0, 0.1);
  }
  
  .char-counter {
    color: #6e6e80;
  }
  
  textarea::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
  }
  
  textarea::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .input-container {
    padding: 0 0.75rem;
  }
  
  .input-area {
    padding: 8px;
  }
  
  textarea {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

@media (max-width: 480px) {
  .input-container {
    padding: 0 0.5rem;
  }
  
  .icon-btn {
    width: 36px;
    height: 36px;
    padding: 6px;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .input-area,
  .icon-btn,
  .send-btn {
    transition: none !important;
  }
}
</style>