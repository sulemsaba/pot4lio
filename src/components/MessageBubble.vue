<template>
  <div :class="['message-row', isUser ? 'user-row' : 'ai-row']">
    <!-- Content -->
    <div class="content-wrapper">
      <!-- Message Body -->
      <div :class="['message-body', isUser ? 'user-message' : 'ai-message']">
        <div
          v-if="!isUser"
          class="message-content"
          v-html="formattedContent"
        ></div>
        <div v-else class="message-content">
          {{ message.text }}
        </div>
      </div>

      <!-- Copy Button (AI messages only) -->
      <button
        v-if="!isUser"
        class="copy-btn"
        @click="copyMessage"
        :title="copied ? 'Copied!' : 'Copy'"
      >
        <svg
          v-if="!copied"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <svg
          v-else
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  isUser: {
    type: Boolean,
    default: false
  }
})

const copied = ref(false)

// Configure Marked once (not on every computed run).
marked.setOptions({
  breaks: true,
  gfm: true
})

const formattedContent = computed(() => {
  const text = props.message?.text ?? ''
  if (!text) return ''

  const rawHtml = marked.parse(text)

  // Sanitize rendered HTML to prevent XSS (e.g., <script>, onerror=, javascript: URLs).
  // Keep the default safe configuration, while enabling standard HTML output.
  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true }
  })
})

const copyMessage = async () => {
  try {
    await navigator.clipboard.writeText(props.message?.text ?? '')
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<style scoped>
.message-row {
  padding: 12px 0;
  animation: fadeIn 0.2s ease-out;
}

.user-row {
  display: flex;
  justify-content: flex-end;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content-wrapper {
  max-width: 85%;
  position: relative;
}

.user-row .content-wrapper {
  max-width: 70%;
}

/* Message Body */
.ai-message {
  color: var(--text-primary);
  line-height: 1.6;
}

.user-message {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 10px 14px;
  border-radius: 16px;
  word-wrap: break-word;
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

/* Copy Button */
.copy-btn {
  position: absolute;
  top: 0;
  right: -28px;
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.message-row:hover .copy-btn {
  opacity: 1;
}

.copy-btn:hover {
  color: var(--text-primary);
  background: var(--surface);
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

  .copy-btn {
    opacity: 1;
    position: static;
    margin-top: 4px;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .message-row {
    animation: none;
  }
}
</style>
