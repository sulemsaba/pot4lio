<template>
  <div class="input-area" :class="{ 'has-text': inputText.trim(), 'focused': isFocused }">
    <!-- Attachment Button (Optional) -->
    <button 
      class="attachment-btn" 
      @click="handleAttachment"
      aria-label="Attach file"
      title="Attach file"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" 
              fill="currentColor"/>
      </svg>
    </button>

    <!-- Text Input -->
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
      
      <!-- Character Counter -->
      <div v-if="showCharCounter" class="char-counter" :class="{ 'warning': charCount > maxLength * 0.9 }">
        {{ charCount }}/{{ maxLength }}
      </div>
    </div>

    <!-- Send Button -->
    <button 
      class="send-btn" 
      :disabled="!canSend || disabled"
      @click="handleSend"
      aria-label="Send message"
      :title="canSend ? 'Send message (Ctrl+Enter)' : 'Type a message to send'"
      :class="{ 'pulse': canSend && isTypingDetected }"
    >
      <svg class="send-icon" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M22 2L15 22L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span class="send-text">Send</span>
    </button>
    
    <!-- Voice Input Button (Optional) -->
    <button 
      class="voice-btn" 
      @click="toggleVoiceInput"
      :class="{ 'recording': isRecording }"
      aria-label="Voice input"
      title="Voice input"
      v-if="showVoiceButton"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 1C10.34 1 9 2.34 9 4v4c0 1.66 1.34 3 3 3s3-1.34 3-3V4c0-1.66-1.34-3-3-3z" fill="currentColor"/>
        <path d="M19 10v-1c0-3.87-3.13-7-7-7s-7 3.13-7 7v1c0 3.87 3.13 7 7 7s7-3.13 7-7z" fill="currentColor" opacity="0.3"/>
        <path d="M12 13c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z" fill="currentColor"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const emit = defineEmits(['send', 'typing-start', 'typing-end', 'attachment', 'voice-start', 'voice-end'])

// Props
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Type your message...'
  },
  maxLength: {
    type: Number,
    default: 2000
  },
  showVoiceButton: {
    type: Boolean,
    default: true
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
const isRecording = ref(false)
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

const isTypingDetected = computed(() => {
  return isTyping.value && canSend.value
})

// Methods
const handleSend = () => {
  if (!canSend.value || props.disabled) return
  
  const text = inputText.value.trim()
  emit('send', text)
  inputText.value = ''
  resetTextareaHeight()
  clearTypingIndicator()
  
  // Return focus to textarea
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

const handleInput = (event) => {
  adjustHeight()
  
  // Typing detection
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
    const newHeight = Math.min(textarea.scrollHeight, 120)
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
  // Optional: Implement file picker
  // const input = document.createElement('input')
  // input.type = 'file'
  // input.onchange = (e) => {
  //   const file = e.target.files[0]
  //   if (file) {
  //     // Handle file
  //   }
  // }
  // input.click()
}

const toggleVoiceInput = () => {
  if (isRecording.value) {
    stopVoiceRecording()
  } else {
    startVoiceRecording()
  }
}

const startVoiceRecording = () => {
  // This is a mock implementation
  // For real implementation, use Web Speech API
  isRecording.value = true
  emit('voice-start')
  
  // Simulate voice input after 3 seconds
  setTimeout(() => {
    if (isRecording.value) {
      inputText.value = "Tell me about your recent projects and technologies you used."
      stopVoiceRecording()
      adjustHeight()
    }
  }, 3000)
}

const stopVoiceRecording = () => {
  isRecording.value = false
  emit('voice-end')
}

// Keyboard shortcuts
const handleKeyDown = (event) => {
  // Ctrl/Cmd + Enter to send
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    handleSend()
  }
  
  // Escape to blur
  if (event.key === 'Escape' && isFocused.value) {
    textareaRef.value?.blur()
  }
}

// Lifecycle
onMounted(() => {
  if (props.autoFocus) {
    setTimeout(() => {
      textareaRef.value?.focus()
    }, 100)
  }
  
  // Add global keyboard listener
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  clearTypingIndicator()
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.input-area {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-input, rgba(64, 65, 79, 0.8));
  border-radius: 16px;
  border: 1px solid var(--border-input, rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.input-area.focused {
  border-color: var(--border-focused, rgba(16, 163, 127, 0.5));
  box-shadow: 0 0 0 1px var(--border-focused, rgba(16, 163, 127, 0.2));
}

.input-area.has-text {
  background: var(--bg-input-active, rgba(68, 70, 84, 0.9));
}

/* Input Wrapper */
.input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Textarea */
textarea {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--text-primary, #ececf1);
  font-size: 0.9375rem;
  line-height: 1.5;
  resize: none;
  outline: none;
  padding: 0.5rem 0;
  min-height: 24px;
  max-height: 120px;
  font-family: inherit;
}

textarea::placeholder {
  color: var(--text-placeholder, rgba(236, 236, 241, 0.5));
}

textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Character Counter */
.char-counter {
  position: absolute;
  bottom: -1.5rem;
  right: 0;
  font-size: 0.75rem;
  color: var(--text-secondary, rgba(236, 236, 241, 0.5));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.char-counter.warning {
  color: var(--text-warning, #fbbf24);
}

.input-wrapper:focus-within .char-counter,
.input-wrapper:hover .char-counter {
  opacity: 1;
}

/* Buttons */
button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: var(--text-secondary, rgba(236, 236, 241, 0.7));
}

button:hover:not(:disabled) {
  background: var(--bg-button-hover, rgba(255, 255, 255, 0.1));
  color: var(--text-primary, #ececf1);
  transform: translateY(-1px);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Send Button */
.send-btn {
  background: var(--bg-send, #10a37f);
  color: white;
  padding: 0.625rem 1.25rem;
  border-radius: 12px;
  gap: 0.5rem;
  min-width: 80px;
  font-weight: 500;
  font-size: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.send-btn:hover:not(:disabled) {
  background: var(--bg-send-hover, #0d8c6d);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 163, 127, 0.3);
}

.send-btn:disabled {
  background: var(--bg-send-disabled, rgba(16, 163, 127, 0.3));
}

.send-btn.pulse:not(:disabled) {
  animation: pulseSend 2s infinite;
}

.send-icon {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  stroke-width: 2;
}

.send-text {
  display: none;
}

/* Attachment Button */
.attachment-btn {
  margin-right: 0.25rem;
}

/* Voice Button */
.voice-btn {
  position: relative;
}

.voice-btn.recording {
  color: var(--text-warning, #ef4444);
  animation: pulseRecording 1.5s infinite;
}

.voice-btn.recording::after {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: var(--text-warning, #ef4444);
  border-radius: 50%;
  animation: blink 1s infinite;
}

/* Animations */
@keyframes pulseSend {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(16, 163, 127, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(16, 163, 127, 0);
  }
}

@keyframes pulseRecording {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Responsive Design */
@media (min-width: 768px) {
  .send-text {
    display: inline;
  }
  
  .send-btn {
    padding: 0.625rem 1rem;
  }
}

@media (max-width: 480px) {
  .input-area {
    padding: 0.625rem;
    gap: 0.5rem;
  }
  
  textarea {
    font-size: 0.875rem;
  }
  
  .send-btn {
    min-width: 60px;
  }
  
  .attachment-btn,
  .voice-btn {
    padding: 0.375rem;
  }
}

/* Light Theme Support */
:global(.light-theme) .input-area {
  --bg-input: rgba(247, 247, 248, 0.9);
  --bg-input-active: rgba(255, 255, 255, 0.95);
  --border-input: rgba(0, 0, 0, 0.1);
  --border-focused: rgba(16, 163, 127, 0.4);
  --text-primary: #374151;
  --text-secondary: #6b7280;
  --text-placeholder: rgba(107, 114, 128, 0.6);
  --text-warning: #d97706;
  --bg-button-hover: rgba(0, 0, 0, 0.05);
  --bg-send: #10a37f;
  --bg-send-hover: #0d8c6d;
  --bg-send-disabled: rgba(16, 163, 127, 0.2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .input-area,
  button,
  textarea {
    transition: none !important;
    animation: none !important;
  }
}
</style>