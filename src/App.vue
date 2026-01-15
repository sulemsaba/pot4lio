<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import NavigationBar from './components/NavigationBar.vue'
import ChatSidebar from './components/ChatSidebar.vue'
import ChatContainer from './components/ChatContainer.vue'
import SidecarPanel from './components/SidecarPanel.vue'
import portfolioData from './data/portfolio-data.js'

// --- State Management ---

// Theme: Initialize immediately to prevent flash
const theme = ref(localStorage.getItem('theme') || 'dark')

// UI States
const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)
const chatStarted = ref(false)
const sidecarOpen = ref(false)
const currentPersona = ref('technical') // Default persona for Sidecar

// Chat States
const messages = ref([
  // Example initial messages for testing delete functionality
  {
    id: 'welcome-1',
    text: 'Hello! I\'m Suleiman, a Full Stack Developer. Ask me anything about my projects, skills, or experience!',
    isUser: false,
    timestamp: new Date(Date.now() - 300000) // 5 minutes ago
  },
  {
    id: 'welcome-2',
    text: 'I\'m interested in learning about your Vue.js projects.',
    isUser: true,
    timestamp: new Date(Date.now() - 240000) // 4 minutes ago
  },
  {
    id: 'welcome-3',
    text: 'Great! I\'ve worked extensively with Vue 3, including this portfolio chat application. I\'ve built several projects using Vue\'s Composition API, Vue Router, and Pinia for state management.',
    isUser: false,
    timestamp: new Date(Date.now() - 180000) // 3 minutes ago
  }
])
const isTyping = ref(false)

// --- Logic & Methods ---

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', theme.value)
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleMobileSidebar = () => {
  mobileSidebarOpen.value = !mobileSidebarOpen.value
}

const closeMobileSidebar = () => {
  mobileSidebarOpen.value = false
}

const handleSend = async (text) => {
  if (!text.trim()) return

  // Mark chat as started to transition UI
  if (!chatStarted.value) chatStarted.value = true

  // 1. Add User Message
  const userMessage = {
    id: crypto.randomUUID(),
    text: text.trim(),
    isUser: true,
    timestamp: new Date()
  }
  
  messages.value.push(userMessage)

  // 2. Simulate AI Typing
  isTyping.value = true
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  // 3. Add AI Response (Example logic)
  const aiMessage = {
    id: crypto.randomUUID(),
    text: generateAIResponse(text),
    isUser: false,
    timestamp: new Date()
  }
  
  messages.value.push(aiMessage)
  isTyping.value = false
}

// Generate contextual AI responses
const generateAIResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase()
  
  if (lowerMessage.includes('project') || lowerMessage.includes('portfolio')) {
    return "I've worked on several interesting projects including a full-featured e-commerce platform, task management app, and this portfolio chat application. Would you like me to open the projects panel to show you more details?"
  } else if (lowerMessage.includes('skill') || lowerMessage.includes('technology')) {
    return "My technical stack includes Vue.js, React, Node.js, Python, and various databases. I'm also proficient with Docker, AWS, and modern CI/CD pipelines. Check the skills tab for a detailed breakdown!"
  } else if (lowerMessage.includes('experience') || lowerMessage.includes('work')) {
    return "I have 3+ years of experience as a Full Stack Developer, working with both startups and established companies. I've led development teams, implemented microservices architecture, and delivered scalable web applications."
  } else if (lowerMessage.includes('contact') || lowerMessage.includes('hire')) {
    return "I'd love to connect! You can reach me via email at suleiman@example.com, or check the contact tab for more ways to get in touch. I'm available for both full-time positions and freelance projects."
  } else if (lowerMessage.includes('about') || lowerMessage.includes('yourself')) {
    return "I'm a passionate Full Stack Developer with a focus on creating beautiful, functional web applications. I enjoy solving complex problems, learning new technologies, and contributing to open-source projects. When I'm not coding, you can find me hiking or playing chess!"
  } else {
    return "That's an interesting question! Based on my portfolio and experience, I can tell you about my projects, technical skills, work experience, or how to contact me. What would you like to know more about?"
  }
}

// Handle message deletion
const handleDeleteMessage = (messageId) => {
  // Find message index
  const messageIndex = messages.value.findIndex(msg => msg.id === messageId)
  
  if (messageIndex === -1) {
    console.warn('Message not found:', messageId)
    return
  }
  
  const message = messages.value[messageIndex]
  const isUserMessage = message.isUser
  
  // Show confirmation (optional - you could use a toast/notification here)
  if (confirm(`Are you sure you want to delete this ${isUserMessage ? 'message you sent' : 'response'}?`)) {
    // Remove message from array
    messages.value.splice(messageIndex, 1)
    
    // Optional: If this was the last message and it was from AI, show welcome state
    if (messages.value.length === 0) {
      chatStarted.value = false
    }
    
    // Log for debugging (remove in production)
    console.log(`Deleted ${isUserMessage ? 'user' : 'AI'} message:`, message.text.substring(0, 50))
  }
}

// Clear all chat messages
const clearChat = () => {
  if (messages.value.length === 0) return
  
  if (confirm('Are you sure you want to clear the entire chat history?')) {
    messages.value = []
    chatStarted.value = false
    console.log('Chat cleared')
  }
}

// Sidecar Controls
const handleNavAction = (action) => {
  if (action === 'projects') {
    currentPersona.value = 'technical'
    sidecarOpen.value = true
  } else if (action === 'clear-chat') {
    clearChat()
  }
  // Close mobile menu if an action is taken
  mobileSidebarOpen.value = false
}

// --- Lifecycle ---
onMounted(() => {
  // Sync theme to document attribute for CSS variables
  document.documentElement.setAttribute('data-theme', theme.value)
  
  // Load saved messages from localStorage (optional feature)
  try {
    const savedMessages = localStorage.getItem('portfolio-chat-messages')
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages)
      // Convert string dates back to Date objects
      parsed.forEach(msg => {
        msg.timestamp = new Date(msg.timestamp)
      })
      messages.value = parsed
      chatStarted.value = parsed.length > 0
    }
  } catch (error) {
    console.error('Failed to load saved messages:', error)
  }
})

// Watch for theme changes to update DOM
watch(theme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme)
})

// Watch for message changes to save to localStorage (optional feature)
watch(messages, (newMessages) => {
  try {
    // Save to localStorage (max 50 messages to prevent storage issues)
    const toSave = newMessages.slice(-50)
    localStorage.setItem('portfolio-chat-messages', JSON.stringify(toSave))
  } catch (error) {
    console.error('Failed to save messages:', error)
  }
}, { deep: true })
</script>

<template>
  <div 
    id="app-shell" 
    :class="{ 
      'sidebar-collapsed': sidebarCollapsed,
      'chat-started': chatStarted,
      'sidecar-open': sidecarOpen
    }"
    :data-theme="theme"
  >
    <NavigationBar 
      @research-click="handleNavAction('research')" 
      @product-click="handleNavAction('product')"
    />

    <header class="mobile-header">
      <button 
        class="mobile-menu-btn"
        @click="toggleMobileSidebar"
        aria-label="Toggle menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
      </button>
      <span class="mobile-brand">Suleiman Msaba</span>
      <!-- Add clear chat button on mobile -->
      <button 
        v-if="messages.length > 0"
        class="mobile-clear-btn"
        @click="clearChat"
        aria-label="Clear chat"
        title="Clear all messages"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </header>

    <Transition name="fade">
      <div 
        v-if="mobileSidebarOpen" 
        class="mobile-overlay"
        @click="closeMobileSidebar"
      ></div>
    </Transition>

    <div class="main-layout">
      <ChatSidebar 
        :theme="theme"
        :is-collapsed="sidebarCollapsed"
        :class="{ 'mobile-open': mobileSidebarOpen }"
        @toggle-sidebar="toggleSidebar"
        @toggle-theme="toggleTheme"
        @nav-item-click="handleNavAction"
      />

      <main class="content-container">
        <ChatContainer 
          :messages="messages"
          :is-typing="isTyping"
          :is-centered="!chatStarted"
          @send="handleSend"
          @delete-message="handleDeleteMessage" <!-- ADD THIS -->
        />
      </main>

      <SidecarPanel 
        :is-open="sidecarOpen"
        :current-persona="currentPersona"
        @close="sidecarOpen = false"
      />
    </div>
  </div>
</template>

<style>
/* Global Layout Styles */
#app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease;
}

.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Prevents flex items from overflowing */
  position: relative;
}

/* Mobile Specific */
.mobile-header {
  display: none;
}

@media (max-width: 768px) {
  .mobile-header {
    display: flex;
    height: 56px;
    padding: 0 16px;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border-subtle);
    background: var(--bg-secondary);
  }

  .mobile-brand {
    font-weight: 600;
    font-size: 16px;
    color: var(--text-primary);
  }

  .mobile-menu-btn {
    background: transparent;
    border: none;
    color: var(--text-primary);
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-clear-btn {
    background: transparent;
    border: none;
    color: var(--text-tertiary);
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .mobile-clear-btn:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  .mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    z-index: 100;
  }
}

/* Clear Chat Button for Desktop (optional - could add to sidebar) */
.clear-chat-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.clear-chat-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-1px);
}

.clear-chat-btn:active {
  transform: translateY(0);
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Toast notification for delete (optional) */
.delete-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.delete-toast button {
  background: transparent;
  border: none;
  color: var(--brand-primary);
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}

.delete-toast button:hover {
  background: rgba(var(--brand-primary-rgb, 16, 163, 127), 0.1);
}
</style>