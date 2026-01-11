<template>
  <form class="input-wrapper" @submit.prevent="handleSend">
    <div class="input-container">
      <!-- Attachment Button -->
      <button
        type="button"
        class="action-button attachment-button"
        @click="handleAttachment"
        :disabled="isTyping"
        :aria-label="isUploading ? 'Uploading...' : 'Attach file'"
        :title="isUploading ? 'Uploading...' : 'Attach file'"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
          stroke-linecap="round" 
          stroke-linejoin="round"
          :class="{ 'uploading': isUploading }"
        >
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          <circle v-if="isUploading" cx="12" cy="12" r="10" class="progress-ring" :style="uploadProgressStyle"/>
        </svg>
        <span v-if="attachmentFile" class="attachment-name">
          {{ attachmentFile.name }}
          <button 
            type="button" 
            class="remove-attachment" 
            @click.stop="removeAttachment"
            aria-label="Remove attachment"
          >
            ×
          </button>
        </span>
      </button>

      <!-- Text Input Area -->
      <div class="text-input-wrapper" :class="{ 'has-attachment': attachmentFile }">
        <textarea
          ref="textareaRef"
          v-model="message"
          :placeholder="placeholder"
          rows="1"
          class="chat-textarea"
          @keydown="handleKeydown"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          :disabled="isTyping || isUploading"
          :maxlength="maxLength"
          aria-label="Chat message input"
          :aria-describedby="showCharCounter ? 'char-counter' : undefined"
          :aria-invalid="message.length > maxLength * 0.9"
        ></textarea>

        <!-- Character Counter -->
        <div 
          v-if="showCharCounter" 
          id="char-counter" 
          class="char-counter"
          :class="{ 'warning': message.length > maxLength * 0.9 }"
          role="status"
          aria-live="polite"
        >
          {{ message.length }}/{{ maxLength }}
        </div>
      </div>

      <!-- Send Button -->
      <button
        type="submit"
        class="action-button send-button"
        :disabled="!canSend"
        :aria-label="canSend ? 'Send message' : 'Type a message to send'"
        :title="canSend ? 'Send message' : 'Type a message to send'"
        @keydown.enter="handleSend"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
          stroke-linecap="round" 
          stroke-linejoin="round"
          :class="{ 'ready': canSend }"
        >
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        <span class="button-text">Send</span>
      </button>

      <!-- Voice Input Button (Optional) -->
      <button
        v-if="supportsSpeech"
        type="button"
        class="action-button voice-button"
        @click="toggleVoiceInput"
        :disabled="isTyping || isUploading"
        :aria-label="isListening ? 'Stop listening' : 'Start voice input'"
        :title="isListening ? 'Stop listening' : 'Start voice input'"
        :class="{ 'listening': isListening }"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      </button>
    </div>

    <!-- File Preview (Optional) -->
    <div v-if="attachmentFile && attachmentPreview" class="file-preview">
      <img 
        v-if="isImageFile(attachmentFile)" 
        :src="attachmentPreview" 
        :alt="attachmentFile.name" 
        class="preview-image"
      />
      <div v-else class="file-info">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
        <div>
          <p class="file-name">{{ attachmentFile.name }}</p>
          <p class="file-size">{{ formatFileSize(attachmentFile.size) }}</p>
        </div>
      </div>
      <button 
        type="button" 
        class="remove-preview" 
        @click="removeAttachment"
        aria-label="Remove attachment"
      >
        ×
      </button>
    </div>

    <!-- Quick Suggestions -->
    <div v-if="showSuggestions && !message" class="quick-suggestions">
      <p class="suggestions-label">Try asking:</p>
      <div class="suggestion-buttons">
        <button
          v-for="(suggestion, index) in quickSuggestions"
          :key="index"
          type="button"
          class="suggestion-button"
          @click="applySuggestion(suggestion)"
          @keydown.enter="applySuggestion(suggestion)"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const emit = defineEmits(['send', 'attachment', 'voice-input'])

const props = defineProps({
  placeholder: {
    type: String,
    default: "Message Suleiman's assistant..."
  },
  isTyping: {
    type: Boolean,
    default: false
  },
  maxLength: {
    type: Number,
    default: 2000
  },
  showSuggestions: {
    type: Boolean,
    default: true
  },
  suggestions: {
    type: Array,
    default: () => [
      "Tell me about your projects",
      "What technologies do you use?",
      "Show me your experience",
      "What are your skills?"
    ]
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// Refs
const message = ref('')
const textareaRef = ref(null)
const attachmentFile = ref(null)
const attachmentPreview = ref(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const isListening = ref(false)
const supportsSpeech = ref(false)
const isFocused = ref(false)

// Computed properties
const canSend = computed(() => {
  return message.value.trim().length > 0 && !props.isTyping && !isUploading.value && !props.disabled
})

const showCharCounter = computed(() => {
  return message.value.length > props.maxLength * 0.8
})

const uploadProgressStyle = computed(() => {
  return {
    strokeDasharray: '63',
    strokeDashoffset: 63 - (uploadProgress.value * 63 / 100)
  }
})

const quickSuggestions = computed(() => {
  return props.suggestions.slice(0, 4)
})

// Methods
const handleSend = () => {
  if (!canSend.value) return
  
  const trimmedMessage = message.value.trim()
  if (!trimmedMessage) return
  
  emit('send', {
    text: trimmedMessage,
    attachment: attachmentFile.value
  })
  
  // Reset
  message.value = ''
  removeAttachment()
  resetTextareaHeight()
  
  // Return focus to textarea
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
    handleSend()
  }
  
  // Tab key handling for accessibility
  if (e.key === 'Tab' && !e.shiftKey && e.target === textareaRef.value) {
    // Allow default tab behavior if we're at the end
    if (message.value.trim() === '') {
      return
    }
  }
}

const handleInput = () => {
  adjustTextareaHeight()
}

const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = () => {
  isFocused.value = false
}

const adjustTextareaHeight = () => {
  if (!textareaRef.value) return
  
  requestAnimationFrame(() => {
    textareaRef.value.style.height = 'auto'
    const newHeight = Math.min(textareaRef.value.scrollHeight, 120)
    textareaRef.value.style.height = `${newHeight}px`
  })
}

const resetTextareaHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
}

const handleAttachment = async () => {
  if (isUploading.value || props.isTyping || props.disabled) return
  
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*,.pdf,.doc,.docx,.txt,.md'
  input.style.display = 'none'
  
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }
    
    attachmentFile.value = file
    isUploading.value = true
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 50))
      uploadProgress.value = i
    }
    
    isUploading.value = false
    
    // Generate preview if image
    if (isImageFile(file)) {
      const reader = new FileReader()
      reader.onload = (e) => {
        attachmentPreview.value = e.target.result
      }
      reader.readAsDataURL(file)
    }
    
    emit('attachment', file)
  }
  
  input.click()
}

const removeAttachment = () => {
  attachmentFile.value = null
  attachmentPreview.value = null
  uploadProgress.value = 0
}

const isImageFile = (file) => {
  return file && file.type.startsWith('image/')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const applySuggestion = (suggestion) => {
  message.value = suggestion
  textareaRef.value?.focus()
}

const toggleVoiceInput = () => {
  if (!supportsSpeech.value) return
  
  if (!isListening.value) {
    startVoiceInput()
  } else {
    stopVoiceInput()
  }
}

const startVoiceInput = () => {
  isListening.value = true
  // Initialize Web Speech API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    alert('Speech recognition not supported in this browser')
    isListening.value = false
    return
  }
  
  const recognition = new SpeechRecognition()
  recognition.lang = 'en-US'
  recognition.continuous = false
  recognition.interimResults = false
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    message.value = transcript
    emit('voice-input', transcript)
  }
  
  recognition.onend = () => {
    isListening.value = false
  }
  
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error)
    isListening.value = false
  }
  
  recognition.start()
}

const stopVoiceInput = () => {
  isListening.value = false
  // SpeechRecognition.stop() would be called here
}

// Lifecycle
onMounted(() => {
  supportsSpeech.value = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  
  // Focus textarea on mount
  setTimeout(() => {
    textareaRef.value?.focus()
  }, 100)
  
  // Listen for paste events
  const handlePaste = (e) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (file) {
          attachmentFile.value = file
          
          // Generate preview
          if (isImageFile(file)) {
            const reader = new FileReader()
            reader.onload = (e) => {
              attachmentPreview.value = e.target.result
            }
            reader.readAsDataURL(file)
          }
          
          emit('attachment', file)
          break
        }
      }
    }
  }
  
  textareaRef.value?.addEventListener('paste', handlePaste)
  
  onUnmounted(() => {
    textareaRef.value?.removeEventListener('paste', handlePaste)
  })
})
</script>

<style scoped>
.input-wrapper {
  padding: 16px;
  background: linear-gradient(
    180deg,
    rgba(var(--bg-glass-rgb, 33, 33, 33), 0.95) 0%,
    rgba(var(--bg-glass-rgb, 33, 33, 33), 0.85) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgba(var(--border-glass-rgb, 255, 255, 255), 0.08);
  position: relative;
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 8px 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 56px;
}

.input-container:focus-within {
  border-color: rgba(var(--persona-color-rgb, 16, 163, 127), 0.3);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(var(--persona-color-rgb, 16, 163, 127), 0.1);
}

/* Action Buttons */
.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.2s;
  min-width: 40px;
  min-height: 40px;
  position: relative;
  flex-shrink: 0;
}

.action-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.action-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-button:focus-visible {
  outline: 2px solid var(--persona-color, #10a37f);
  outline-offset: 2px;
}

/* Attachment Button */
.attachment-button {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.attachment-button svg {
  transition: all 0.3s;
}

.attachment-button.uploading svg {
  animation: rotate 2s linear infinite;
}

.progress-ring {
  fill: none;
  stroke: var(--persona-color, #10a37f);
  stroke-linecap: round;
  stroke-dasharray: 63;
  stroke-dashoffset: 63;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dashoffset 0.3s;
}

.attachment-name {
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-attachment {
  background: rgba(239, 68, 68, 0.2);
  border: none;
  color: #ef4444;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.remove-attachment:hover {
  background: rgba(239, 68, 68, 0.3);
}

/* Text Input */
.text-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 40px;
  position: relative;
}

.text-input-wrapper.has-attachment {
  margin-left: 8px;
}

.chat-textarea {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 15px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.5;
  resize: none;
  max-height: 120px;
  padding: 8px 0;
  overflow-y: auto;
}

.chat-textarea::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.chat-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chat-textarea:focus {
  outline: none;
}

/* Custom scrollbar for textarea */
.chat-textarea::-webkit-scrollbar {
  width: 4px;
}

.chat-textarea::-webkit-scrollbar-track {
  background: transparent;
}

.chat-textarea::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.chat-textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Character Counter */
.char-counter {
  position: absolute;
  bottom: -20px;
  right: 0;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  transition: color 0.2s;
}

.char-counter.warning {
  color: #ef4444;
}

/* Send Button */
.send-button {
  background: rgba(var(--persona-color-rgb, 16, 163, 127), 0.1);
  border: 1px solid rgba(var(--persona-color-rgb, 16, 163, 127), 0.2);
  color: var(--persona-color, #10a37f);
}

.send-button:not(:disabled):hover {
  background: rgba(var(--persona-color-rgb, 16, 163, 127), 0.2);
  transform: translateY(-1px);
}

.send-button.ready svg {
  animation: pulse 2s infinite;
}

.send-button .button-text {
  display: none;
  font-weight: 500;
  margin-left: 4px;
}

/* Voice Button */
.voice-button {
  display: none; /* Hidden by default, shown when supported */
}

.voice-button.listening {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  animation: pulse 1.5s infinite;
}

/* File Preview */
.file-preview {
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.preview-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-name {
  font-size: 0.875rem;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.file-size {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.remove-preview {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(239, 68, 68, 0.2);
  border: none;
  color: #ef4444;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-preview:hover {
  background: rgba(239, 68, 68, 0.3);
}

/* Quick Suggestions */
.quick-suggestions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.suggestions-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.suggestion-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-button {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  border-radius: 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.suggestion-button:hover {
  background: rgba(var(--persona-color-rgb, 16, 163, 127), 0.1);
  color: var(--persona-color, #10a37f);
  border-color: rgba(var(--persona-color-rgb, 16, 163, 127), 0.2);
}

.suggestion-button:focus-visible {
  outline: 2px solid var(--persona-color, #10a37f);
  outline-offset: 2px;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive Design */
@media (min-width: 640px) {
  .send-button .button-text {
    display: inline;
  }
  
  .voice-button {
    display: flex;
  }
  
  .attachment-name {
    display: flex;
  }
}

@media (max-width: 639px) {
  .input-wrapper {
    padding: 12px;
  }
  
  .input-container {
    padding: 8px 12px;
  }
  
  .action-button {
    padding: 6px;
    min-width: 36px;
    min-height: 36px;
  }
  
  .attachment-name {
    display: none;
  }
  
  .suggestion-buttons {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 4px;
  }
  
  .suggestion-button {
    flex-shrink: 0;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .action-button,
  .suggestion-button,
  .send-button,
  .remove-preview,
  .input-container {
    transition: none;
  }
  
  .send-button.ready svg,
  .voice-button.listening,
  .attachment-button.uploading svg {
    animation: none;
  }
}

/* Dark/Light Theme Variables */
:root {
  --bg-glass-rgb: 33, 33, 33;
  --border-glass-rgb: 255, 255, 255;
  --text-primary: #ffffff;
  --text-secondary: #8e8ea0;
  --text-tertiary: #6e6e80;
  --persona-color: #10a37f;
  --persona-color-rgb: 16, 163, 127;
}

[data-theme="light"] {
  --bg-glass-rgb: 255, 255, 255;
  --border-glass-rgb: 0, 0, 0;
  --text-primary: #202123;
  --text-secondary: #6e6e80;
  --text-tertiary: #8e8ea0;
}

[data-theme="light"] .input-wrapper {
  background: linear-gradient(
    180deg,
    rgba(var(--bg-glass-rgb, 255, 255, 255), 0.95) 0%,
    rgba(var(--bg-glass-rgb, 255, 255, 255), 0.85) 100%
  );
}

[data-theme="light"] .input-container {
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .input-container:focus-within {
  background: rgba(0, 0, 0, 0.05);
}

[data-theme="light"] .action-button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

[data-theme="light"] .file-preview {
  background: rgba(0, 0, 0, 0.03);
}

[data-theme="light"] .suggestion-button {
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .chat-textarea::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
}

[data-theme="light"] .chat-textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>