<template>
  <div class="input-area">
    <div class="input-container">
      <textarea
        ref="textareaRef"
        v-model="inputText"
        @keydown.enter.exact.prevent="handleSubmit"
        @keydown.enter.shift.exact.prevent="inputText += '\n'"
        @input="adjustHeight"
        placeholder="Message Portfolio Assistant..."
        class="message-input"
        rows="1"
        aria-label="Type your message"
      />
      <button 
        @click="handleSubmit" 
        class="send-button"
        :disabled="!inputText.trim()"
        aria-label="Send message"
      >
        <svg class="send-icon" viewBox="0 0 24 24" fill="none">
          <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    <div class="input-footer">
      <p class="input-hint">
        Press <kbd>Enter</kbd> to send, <kbd>Shift</kbd> + <kbd>Enter</kbd> for new line
      </p>
      <div class="quick-actions">
        <button 
          v-for="action in quickActions" 
          :key="action.text"
          @click="handleQuickAction(action)"
          class="quick-action-btn"
          :aria-label="action.label"
        >
          {{ action.text }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';

const emit = defineEmits(['send-message']);

const inputText = ref('');
const textareaRef = ref(null);

const quickActions = [
  { text: 'Projects', label: 'Ask about projects', value: 'What projects have you worked on?' },
  { text: 'Skills', label: 'Ask about skills', value: 'Tell me about your technical skills' },
  { text: 'Experience', label: 'Ask about experience', value: 'What is your work experience?' },
  { text: 'Contact', label: 'Ask for contact info', value: 'How can I contact you?' }
];

const handleSubmit = () => {
  const trimmedText = inputText.value.trim();
  if (!trimmedText) return;
  
  emit('send-message', trimmedText);
  inputText.value = '';
  
  // Reset textarea height
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
    }
  });
};

const handleQuickAction = (action) => {
  inputText.value = action.value;
  // Auto-focus on input after quick action
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus();
      adjustHeight();
    }
  });
};

const adjustHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + 'px';
  }
};

// Focus input on mount
import { onMounted } from 'vue';
onMounted(() => {
  if (textareaRef.value) {
    textareaRef.value.focus();
  }
});
</script>

<style scoped>
.input-area {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  background-color: var(--bg-tertiary);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  transition: border-color 0.2s;
}

.input-container:focus-within {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(16, 163, 127, 0.1);
}

.message-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
  resize: none;
  max-height: 120px;
  min-height: 24px;
  line-height: 1.5;
  outline: none;
  padding: 0.25rem 0;
}

.message-input::placeholder {
  color: var(--text-secondary);
}

.send-button {
  background-color: var(--accent-color);
  border: none;
  border-radius: 0.375rem;
  color: white;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  background-color: #0d8c6d;
  transform: translateY(-1px);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-icon {
  width: 18px;
  height: 18px;
}

.input-footer {
  margin-top: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.input-hint {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

kbd {
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  padding: 0.125rem 0.375rem;
  font-size: 0.75rem;
  font-family: inherit;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.quick-action-btn {
  padding: 0.375rem 0.75rem;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  color: var(--text-primary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-action-btn:hover {
  background-color: var(--user-message);
  color: white;
  border-color: var(--user-message);
}

/* Responsive */
@media (max-width: 768px) {
  .input-area {
    padding: 1rem;
  }
  
  .input-footer {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .quick-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>