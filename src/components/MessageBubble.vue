<template>
  <div 
    :class="['message-row', isUser ? 'user-row' : 'ai-row']"
    @dblclick="startDelete"
    :title="`Double-click to ${deleteState === 'idle' ? 'delete' : 'confirm delete'}`"
  >
    <!-- Content -->
    <div class="content-wrapper">
      <!-- Message Body -->
      <div :class="['message-body', isUser ? 'user-message' : 'ai-message']">
        <!-- Safe HTML rendering with DOMPurify -->
        <div 
          v-if="!isUser" 
          class="message-content"
          v-html="sanitizedContent"
        ></div>
        <div v-else class="message-content">
          {{ message.text }}
        </div>
        
        <!-- Delete confirmation overlay -->
        <div v-if="deleteState === 'confirm'" class="delete-confirmation-overlay">
          <div class="delete-confirmation">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
            <span>Delete message? Click again to confirm</span>
            <button @click.stop="cancelDelete" class="cancel-delete-btn" aria-label="Cancel delete">
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons (always visible on hover for desktop) -->
      <div class="message-actions">
        <!-- Copy Button (AI messages only) -->
        <button 
          v-if="!isUser"
          class="action-btn copy-btn"
          @click="copyMessage"
          :title="copied ? 'Copied!' : 'Copy to clipboard'"
          :aria-label="copied ? 'Message copied to clipboard' : 'Copy message to clipboard'"
        >
          <svg v-if="!copied" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>
        
        <!-- Delete Button (trash bin icon) -->
        <button 
          class="action-btn delete-btn"
          @click="startDelete"
          :title="`Delete message (double-click row to confirm)`"
          :aria-label="`Delete message ${message.text.substring(0, 30)}...`"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
  message: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && 'id' in value && 'text' in value
    }
  },
  isUser: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['delete'])

// State
const copied = ref(false)
const deleteState = ref('idle') // 'idle', 'confirm'
const deleteTimeout = ref(null)

// Configure marked for safe defaults
marked.setOptions({
  breaks: true,
  gfm: true,
  // Disable dangerous features
  sanitize: false, // We'll handle sanitization ourselves
  silent: true, // Don't throw on parse errors
})

// Initialize DOMPurify
const purify = DOMPurify(window)
purify.setConfig({
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'code', 'pre',
    'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'hr', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'span', 'div'
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'src', 'alt', 'title', 'width', 'height',
    'class', 'id', 'style', 'colspan', 'rowspan', 'align', 'valign'
  ],
  // Add safe links only
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  // Force safe attributes
  FORCE_ATTR: {
    'a': { 'rel': 'noopener noreferrer' },
    'target': '_blank'
  },
  // Return trusted HTML
  RETURN_TRUSTED_TYPE: true,
})

// Parse markdown
const formattedContent = computed(() => {
  if (!props.message.text || typeof props.message.text !== 'string') return ''
  
  try {
    // Parse markdown
    return marked.parse(props.message.text.trim())
  } catch (error) {
    console.error('Markdown parsing error:', error)
    // Return plain text on error (HTML escaped)
    return props.message.text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
})

// Sanitize HTML content
const sanitizedContent = computed(() => {
  if (!formattedContent.value) return ''
  
  try {
    // Sanitize the HTML
    return purify.sanitize(formattedContent.value, {
      // Additional safety measures
      SAFE_FOR_JQUERY: true,
      SAFE_FOR_TEMPLATES: true,
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onkeydown', 'onkeypress']
    })
  } catch (error) {
    console.error('HTML sanitization error:', error)
    // Fallback: escape all HTML
    return formattedContent.value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
})

// Copy message to clipboard
const copyMessage = async () => {
  if (copied.value || !props.message.text) return
  
  try {
    await navigator.clipboard.writeText(props.message.text)
    copied.value = true
    
    // Reset copy state after 2 seconds
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
    // Could show a toast notification here
  }
}

// Start delete process (first click/double-click)
const startDelete = () => {
  if (deleteState.value === 'idle') {
    // First interaction - show confirmation
    deleteState.value = 'confirm'
    
    // Auto-cancel after 5 seconds
    deleteTimeout.value = setTimeout(() => {
      deleteState.value = 'idle'
    }, 5000)
  } else if (deleteState.value === 'confirm') {
    // Second interaction - confirm delete
    confirmDelete()
  }
}

// Cancel delete
const cancelDelete = () => {
  deleteState.value = 'idle'
  if (deleteTimeout.value) {
    clearTimeout(deleteTimeout.value)
    deleteTimeout.value = null
  }
}

// Confirm and emit delete event
const confirmDelete = () => {
  if (deleteTimeout.value) {
    clearTimeout(deleteTimeout.value)
    deleteTimeout.value = null
  }
  
  emit('delete', props.message.id)
}

// Cleanup on unmount
onUnmounted(() => {
  if (deleteTimeout.value) {
    clearTimeout(deleteTimeout.value)
  }
})
</script>

<style scoped>
.message-row {
  padding: 12px 0;
  animation: fadeIn 0.2s ease-out;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.message-row:hover {
  background-color: rgba(var(--surface-hover-rgb, 0, 0, 0), 0.05);
}

.user-row {
  display: flex;
  justify-content: flex-end;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.content-wrapper {
  max-width: 85%;
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.user-row .content-wrapper {
  max-width: 70%;
  justify-content: flex-end;
}

/* Message Body */
.ai-message {
  color: var(--text-primary);
  line-height: 1.6;
  position: relative;
  min-width: 0;
  flex: 1;
}

.user-message {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 10px 14px;
  border-radius: 16px;
  word-wrap: break-word;
  min-width: 0;
  flex: 1;
  position: relative;
}

/* Message Content */
.message-content {
  font-size: 14px;
}

.message-content :deep(p) {
  margin: 0 0 10px 0;
}

.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.message-content :deep(strong) {
  font-weight: 600;
  color: var(--text-primary);
}

.message-content :deep(ul),
.message-content :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.message-content :deep(li) {
  margin: 4px 0;
}

.message-content :deep(code) {
  background: var(--surface);
  padding: 2px 5px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 13px;
}

.message-content :deep(pre) {
  background: var(--bg-secondary);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 10px 0;
}

.message-content :deep(pre code) {
  background: transparent;
  padding: 0;
}

.message-content :deep(a) {
  color: var(--brand-primary);
  text-decoration: none;
}

.message-content :deep(a:hover) {
  text-decoration: underline;
}

/* Message Actions */
.message-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  padding-top: 4px;
}

.message-row:hover .message-actions {
  opacity: 1;
}

.action-btn {
  background: transparent;
  border: 1px solid var(--border-subtle);
  color: var(--text-tertiary);
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  width: 28px;
  height: 28px;
}

.action-btn:hover {
  background: var(--surface);
  color: var(--text-primary);
  border-color: var(--text-tertiary);
  transform: translateY(-1px);
}

.action-btn.copy-btn:hover {
  color: var(--brand-primary);
  border-color: var(--brand-primary);
}

.action-btn.delete-btn:hover {
  color: #ef4444;
  border-color: #ef4444;
}

/* Delete Confirmation Overlay */
.delete-confirmation-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  border-radius: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: fadeInOverlay 0.2s ease;
}

@keyframes fadeInOverlay {
  from { opacity: 0; }
  to { opacity: 1; }
}

.delete-confirmation {
  background: var(--bg-secondary);
  border: 2px solid #ef4444;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  max-width: 90%;
  animation: scaleIn 0.2s ease;
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.delete-confirmation svg {
  color: #ef4444;
  flex-shrink: 0;
}

.delete-confirmation span {
  flex: 1;
}

.cancel-delete-btn {
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.cancel-delete-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .message-row {
    padding: 8px 0;
  }
  
  .content-wrapper,
  .user-row .content-wrapper {
    max-width: 90%;
  }
  
  .message-actions {
    opacity: 1;
    flex-direction: row;
    position: static;
    margin-top: 4px;
  }
  
  .action-btn {
    width: 32px;
    height: 32px;
  }
  
  .delete-confirmation {
    font-size: 12px;
    padding: 10px 12px;
  }
}

/* Touch devices */
@media (hover: none) and (pointer: coarse) {
  .message-actions {
    opacity: 1;
  }
  
  .message-row {
    padding: 16px 0;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .message-row,
  .action-btn,
  .delete-confirmation-overlay,
  .delete-confirmation {
    animation: none;
    transition: none;
  }
  
  .action-btn:hover {
    transform: none;
  }
}
</style>