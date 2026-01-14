<template>
  <div id="thread-bottom-container">
    <div class="bg-token-bg-primary">
      <!-- Input Container -->
      <div class="wcDTda_prosemirror-parent">
        <div
          ref="textareaRef"
          id="prompt-textarea"
          contenteditable="true"
          :placeholder="placeholder"
          @input="handleInput"
          @keydown="handleKeydown"
          @focus="handleFocus"
          @blur="handleBlur"
          class="prompt-textarea"
          :class="{ 'has-text': hasText }"
          spellcheck="true"
        ></div>
      </div>

      <!-- Send Button -->
      <div class="send-container">
        <button
          id="sendBtn"
          class="send-btn"
          :class="{ active: canSend }"
          @click="sendMessage"
          :disabled="!canSend"
          aria-label="Send message"
          title="Send message"
        >
          <svg viewBox="0 0 24 24" fill="none" class="send-icon">
            <path d="M5 12L19 12M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Footer actions -->
      <div data-testid="composer-footer-actions">
        <button class="footer-btn" @click="handleFooterClick('Projects')" aria-label="Projects">
          <svg class="footer-icon" viewBox="0 0 24 24" fill="none">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span class="footer-text">Projects</span>
        </button>
        
        <button class="footer-btn" @click="handleFooterClick('About')" aria-label="About">
          <svg class="footer-icon" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span class="footer-text">About</span>
        </button>
        
        <button class="footer-btn" @click="handleFooterClick('Contact')" aria-label="Contact">
          <svg class="footer-icon" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </svg>
          <span class="footer-text">Contact</span>
        </button>
        
        <button class="footer-btn" @click="handleFooterClick('Skills')" aria-label="Skills">
          <svg class="footer-icon" viewBox="0 0 24 24" fill="none">
            <path d="M9 12h.01"></path>
            <path d="M15 12h.01"></path>
            <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"></path>
            <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"></path>
          </svg>
          <span class="footer-text">Skills</span>
        </button>
        
        <button class="footer-btn" @click="handleFooterClick('Experience')" aria-label="Experience">
          <svg class="footer-icon" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="7" width="20" height="14" rx="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          <span class="footer-text">Experience</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'

const emit = defineEmits(['send', 'footer-action'])

const props = defineProps({
  placeholder: {
    type: String,
    default: "Ask anything..."
  }
})

const textareaRef = ref(null)
const hasText = ref(false)
const canSend = computed(() => hasText.value && !isTyping.value)
const isTyping = ref(false)

const handleInput = (e) => {
  const text = e.target.innerText.trim()
  hasText.value = text.length > 0
  
  // Auto-grow
  e.target.style.height = 'auto'
  const newHeight = Math.min(e.target.scrollHeight, 200)
  e.target.style.height = `${newHeight}px`
}

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const handleFocus = () => {
  if (textareaRef.value) {
    textareaRef.value.classList.add('focused')
  }
}

const handleBlur = () => {
  if (textareaRef.value) {
    textareaRef.value.classList.remove('focused')
  }
}

const sendMessage = () => {
  if (!textareaRef.value || !canSend.value) return
  
  const text = textareaRef.value.innerText.trim()
  if (!text) return
  
  emit('send', { text })
  
  // Clear input
  textareaRef.value.innerText = ''
  textareaRef.value.style.height = 'auto'
  hasText.value = false
  
  // Focus back on input
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

const handleFooterClick = (action) => {
  emit('footer-action', action)
}

onMounted(() => {
  // Set initial placeholder if empty
  if (textareaRef.value && !textareaRef.value.innerText.trim()) {
    textareaRef.value.innerHTML = ''
  }
  
  nextTick(() => {
    textareaRef.value?.focus()
  })
})
</script>

<style scoped>
/* =========================
   BASE LAYOUT
========================= */
#thread-bottom-container {
  position: sticky;
  bottom: 0;
  z-index: 10;
  padding: 12px;
  background: linear-gradient(to top, #f9f9f9 70%, transparent);
}

/* =========================
   COMPOSER GRID CONTAINER
========================= */
.bg-token-bg-primary {
  max-width: 760px;
  margin: 0 auto;
  background: #fff;
  border-radius: 28px;
  padding: 10px 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "leading primary trailing"
    ". footer .";
  gap: 8px;
}

/* =========================
   INPUT AREA
========================= */
.wcDTda_prosemirror-parent {
  grid-area: primary;
  display: flex;
  align-items: center;
}

#prompt-textarea {
  flex: 1;
  min-height: 32px;
  max-height: 200px;
  overflow-y: auto;
  font-size: 16px;
  line-height: 1.5;
  outline: none;
  border: none;
  padding: 8px;
  white-space: pre-wrap;
  resize: none;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  background: transparent;
  color: #000;
  width: 100%;
}

#prompt-textarea:empty::before {
  content: attr(placeholder);
  color: #aaa;
  pointer-events: none;
}

#prompt-textarea[contenteditable="true"]:empty::before {
  content: attr(placeholder);
  color: #aaa;
}

#prompt-textarea:focus {
  outline: none;
}

#prompt-textarea::-webkit-scrollbar {
  width: 6px;
}

#prompt-textarea::-webkit-scrollbar-track {
  background: transparent;
}

#prompt-textarea::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

#prompt-textarea::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}

/* =========================
   FOOTER BUTTONS WITH ICONS
========================= */
[data-testid="composer-footer-actions"] {
  grid-area: footer;
  display: flex;
  gap: 6px;
  padding-top: 6px;
  overflow-x: auto;
  scrollbar-width: none;
}

[data-testid="composer-footer-actions"]::-webkit-scrollbar {
  display: none;
}

.footer-btn {
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  color: #333;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
}

.footer-btn:hover {
  background: #f2f2f2;
  transform: translateY(-1px);
}

.footer-btn:active {
  background: #e8e8e8;
  transform: translateY(0);
}

.footer-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.footer-text {
  font-weight: 500;
}

/* =========================
   SEND BUTTON
========================= */
.send-container {
  grid-area: trailing;
  display: flex;
  align-items: center;
  padding-left: 8px;
}

.send-btn {
  border: none;
  background: #000;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.3;
  pointer-events: none;
  transition: all 0.2s ease;
  padding: 0;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn.active {
  opacity: 1;
  pointer-events: auto;
}

.send-btn:disabled {
  cursor: not-allowed;
}

.send-icon {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* =========================
   RESPONSIVE DESIGN
========================= */
/* Small screens (mobile) - show only icons */
@media (max-width: 768px) {
  .bg-token-bg-primary {
    border-radius: 22px;
    padding: 8px 10px;
  }
  
  #thread-bottom-container {
    padding: 8px;
  }
  
  #prompt-textarea {
    font-size: 15px;
    min-height: 28px;
    padding: 6px 8px;
  }
  
  .send-btn {
    width: 32px;
    height: 32px;
  }
  
  .send-icon {
    width: 16px;
    height: 16px;
  }
  
  /* Hide text, show only icons on mobile */
  .footer-text {
    display: none;
  }
  
  .footer-btn {
    padding: 6px;
    width: 32px;
    height: 32px;
    justify-content: center;
  }
  
  .footer-icon {
    width: 18px;
    height: 18px;
    margin: 0;
  }
  
  /* Adjust gap for icon-only buttons */
  [data-testid="composer-footer-actions"] {
    gap: 4px;
  }
}

/* Medium screens - show text with icons */
@media (min-width: 769px) and (max-width: 1024px) {
  .footer-text {
    font-size: 12px;
  }
  
  .footer-btn {
    padding: 6px 10px;
  }
}

/* Large screens - full text with icons */
@media (min-width: 1025px) {
  .footer-btn {
    padding: 6px 12px;
  }
}

/* Extra small screens (very small phones) */
@media (max-width: 480px) {
  [data-testid="composer-footer-actions"] {
    gap: 3px;
  }
  
  .footer-btn {
    width: 30px;
    height: 30px;
    padding: 4px;
  }
  
  .footer-icon {
    width: 16px;
    height: 16px;
  }
  
  .send-btn {
    width: 30px;
    height: 30px;
  }
  
  .send-icon {
    width: 14px;
    height: 14px;
  }
}

/* =========================
   DARK MODE SUPPORT
========================= */
@media (prefers-color-scheme: dark) {
  #thread-bottom-container {
    background: linear-gradient(to top, #1a1a1a 70%, transparent);
  }
  
  .bg-token-bg-primary {
    background: #2d2d2d;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  
  #prompt-textarea {
    color: #fff;
  }
  
  #prompt-textarea:empty::before {
    color: #888;
  }
  
  .footer-btn {
    background: #3d3d3d;
    border-color: #444;
    color: #fff;
  }
  
  .footer-btn:hover {
    background: #4a4a4a;
  }
  
  .send-btn {
    background: #fff;
  }
  
  .send-icon {
    stroke: #000;
  }
}

/* =========================
   FOCUS STATES & ACCESSIBILITY
========================= */
#prompt-textarea.focused {
  caret-color: #10a37f;
}

.footer-btn:focus-visible,
.send-btn:focus-visible {
  outline: 2px solid #10a37f;
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .footer-btn,
  .send-btn {
    transition: none;
  }
  
  .footer-btn:hover {
    transform: none;
  }
  
  .send-btn:hover:not(:disabled) {
    transform: none;
  }
}

/* 
=========================
   UTILITY CLASSES
========================= */
.prompt-textarea.has-text + .send-container .send-btn {
  opacity: 1;
  pointer-events: auto;
}
</style>