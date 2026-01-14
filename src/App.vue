<template>
  <div 
    id="app-shell" 
    :class="{ 
      'sidebar-collapsed': sidebarCollapsed
    }"
    :data-theme="theme"
  >
    <!-- ✅ ONLY ADDED -->
    <NavigationBar />

    <!-- Mobile Header -->
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
    </header>

    <!-- Mobile Overlay -->
    <div 
      v-if="mobileSidebarOpen" 
      class="mobile-overlay"
      @click="closeMobileSidebar"
    ></div>

    <!-- Left Sidebar -->
    <ChatSidebar 
      :theme="theme"
      :class="{ 'mobile-open': mobileSidebarOpen }"
      @toggle-theme="toggleTheme"
      @nav-select="handleNavSelect"
      @toggle-collapse="handleSidebarCollapse"
    />

    <!-- Main Chat Area -->
    <main class="chat-main">
      <ChatContainer
        ref="chatContainer"
        :messages="messages"
        :is-typing="isTyping"
        @send-message="handleSendMessage"
      />
    </main>

    <!-- Right Sidecar Panel -->
    <SidecarPanel
      :is-open="sidecarOpen"
      :current-persona="currentPersona"
      @close="closeSidecar"
      @project-view="handleProjectView"
      @contact-sent="handleContactSent"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import NavigationBar from './components/navigationBar.vue' // ✅ ONLY ADDED
import ChatSidebar from './components/ChatSidebar.vue'
import ChatContainer from './components/ChatContainer.vue'
import SidecarPanel from './components/SidecarPanel.vue'
import { projects, skills, timeline, contactInfo, cvLink } from './data/portfolio-data.js'

// Theme state
const theme = ref('dark')

// Sidebar states
const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)

// Sidecar panel state
const sidecarOpen = ref(true)
const currentPersona = ref('default')

// Chat state
const messages = reactive([])
const isTyping = ref(false)

// Chat container ref
const chatContainer = ref(null)

// Portfolio data
const portfolioContext = {
  name: 'Suleiman Msaba',
  title: 'Full Stack Developer',
  location: 'Dar es Salaam, Tanzania',
  projects,
  skills,
  timeline,
  contactInfo,
  cvLink
}

// Initialize
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    theme.value = savedTheme
    document.documentElement.setAttribute('data-theme', savedTheme)
  }

  const savedSidebarState = localStorage.getItem('sidebar-collapsed')
  if (savedSidebarState) {
    sidebarCollapsed.value = JSON.parse(savedSidebarState)
  }

  if (window.innerWidth < 768) {
    sidebarCollapsed.value = true
  }

  setTimeout(() => {
    addMessage({
      id: Date.now(),
      isUser: false,
      text: getWelcomeMessage(),
      timestamp: new Date().toISOString()
    })
  }, 300)

  window.addEventListener('resize', handleResize)
})

// Methods
const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('theme', theme.value)
}

const handleSidebarCollapse = (collapsed) => {
  sidebarCollapsed.value = collapsed
}

const toggleMobileSidebar = () => {
  mobileSidebarOpen.value = !mobileSidebarOpen.value
}

const closeMobileSidebar = () => {
  mobileSidebarOpen.value = false
}

const handleResize = () => {
  if (window.innerWidth < 768) {
    mobileSidebarOpen.value = false
  }
}

const addMessage = (message) => {
  messages.push(message)
}

const getWelcomeMessage = () => {
  const hour = new Date().getHours()
  let greeting = 'Hello'

  if (hour < 12) greeting = 'Good morning'
  else if (hour < 18) greeting = 'Good afternoon'
  else greeting = 'Good evening'

  return `${greeting}! 👋 I'm Suleiman's portfolio assistant.

I can help you learn about:
• **Projects** - My portfolio work
• **Skills** - Technical expertise
• **Experience** - Career journey
• **Contact** - Get in touch

Just ask me anything or use the sidebar to navigate!`
}

const handleSendMessage = async (messageData) => {
  const userMessage = {
    id: Date.now(),
    isUser: true,
    text: messageData.text,
    timestamp: new Date().toISOString()
  }

  addMessage(userMessage)
  isTyping.value = true

  const response = await generateResponse(messageData.text)

  setTimeout(() => {
    isTyping.value = false
    addMessage({
      id: Date.now() + 1,
      isUser: false,
      text: response,
      timestamp: new Date().toISOString()
    })
  }, 800 + Math.random() * 800)
}

const generateResponse = async (query) => {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes('project')) {
    return `Here are my projects:\n\n${projects.map(p => `• **${p.name}**: ${p.description}`).join('\n')}`
  }

  if (lowerQuery.includes('skill')) {
    return `My skills:\n\n${skills.join(', ')}`
  }

  if (lowerQuery.includes('contact')) {
    return `Email: ${contactInfo.email}\nPhone: ${contactInfo.phone}`
  }

  return `Ask me about projects, skills, experience, or contact.`
}

const handleNavSelect = (navData) => {
  closeMobileSidebar()
}

const closeSidecar = () => {
  sidecarOpen.value = false
}

const handleProjectView = (project) => {
  addMessage({
    id: Date.now(),
    isUser: false,
    text: project.name,
    timestamp: new Date().toISOString()
  })
}

const handleContactSent = (contactData) => {
  addMessage({
    id: Date.now(),
    isUser: false,
    text: `Thanks ${contactData.name}`,
    timestamp: new Date().toISOString()
  })
}

watch(theme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme)
})
</script>

<style>
#app-shell {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: var(--bg-primary);
  overflow: hidden;
}

.chat-main {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  height: 100vh;
  transition: margin-left 0.2s ease;
}

#app-shell.sidebar-collapsed .chat-main {
  margin-left: var(--sidebar-collapsed-width);
}

.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-subtle);
  z-index: 1001;
  padding: 0 12px;
  align-items: center;
  gap: 12px;
}

.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
}

@media (max-width: 768px) {
  .mobile-header { display: flex; }
  .mobile-overlay { display: block; }
  .chat-main { margin-left: 0; padding-top: 48px; }
}
</style>
