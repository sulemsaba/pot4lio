<template>
  <div 
    id="app-shell" 
    :class="{ 
      'sidebar-collapsed': sidebarCollapsed
    }"
    :data-theme="theme"
  >
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
  // Load theme
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    theme.value = savedTheme
    document.documentElement.setAttribute('data-theme', savedTheme)
  }
  
  // Load sidebar state
  const savedSidebarState = localStorage.getItem('sidebar-collapsed')
  if (savedSidebarState) {
    sidebarCollapsed.value = JSON.parse(savedSidebarState)
  }
  
  // Mobile check
  if (window.innerWidth < 768) {
    sidebarCollapsed.value = true
  }
  
  // Welcome message
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
  
  // Projects
  if (lowerQuery.includes('project') || lowerQuery.includes('work') || lowerQuery.includes('portfolio')) {
    const projectList = projects.map(p => `• **${p.name}**: ${p.description}`).join('\n')
    return `Here are my featured projects:\n\n${projectList}\n\nWant details about any specific project?`
  }
  
  // Skills
  if (lowerQuery.includes('skill') || lowerQuery.includes('technolog') || lowerQuery.includes('stack')) {
    const skillList = skills.join(', ')
    return `My technical skills:\n\n**Core:** ${skillList}\n\nI specialize in Vue.js and modern JavaScript development.`
  }
  
  // Experience
  if (lowerQuery.includes('experience') || lowerQuery.includes('timeline') || lowerQuery.includes('career')) {
    const timelineList = timeline.map(t => `• **${t.year}**: ${t.event}`).join('\n')
    return `My professional journey:\n\n${timelineList}`
  }
  
  // Contact
  if (lowerQuery.includes('contact') || lowerQuery.includes('reach') || lowerQuery.includes('email') || lowerQuery.includes('hire')) {
    return `Let's connect!\n\n📧 **Email:** ${contactInfo.email}\n📱 **Phone:** ${contactInfo.phone}\n💼 **LinkedIn:** ${contactInfo.linkedin}\n🐙 **GitHub:** ${contactInfo.github}`
  }
  
  // CV/Resume
  if (lowerQuery.includes('cv') || lowerQuery.includes('resume') || lowerQuery.includes('download')) {
    return `You can download my CV here:\n\n📄 [Download Resume](${cvLink})\n\nIt includes my complete work history, education, and certifications.`
  }
  
  // About
  if (lowerQuery.includes('about') || lowerQuery.includes('who') || lowerQuery.includes('yourself')) {
    return `I'm **Suleiman Msaba**, a Full Stack Developer based in Dar es Salaam, Tanzania 🇹🇿\n\nI build modern web applications using Vue.js, React, Node.js, and other technologies. I'm passionate about clean code and great user experiences.\n\nWhat would you like to know more about?`
  }
  
  // Greeting
  if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
    return `Hello! 👋 Great to meet you! How can I help you today?`
  }
  
  // Thanks
  if (lowerQuery.includes('thank')) {
    return `You're welcome! 😊 Anything else you'd like to know?`
  }
  
  // Default
  return `I can help you with:\n\n• **Projects** - View my work\n• **Skills** - Technical expertise\n• **Experience** - Career journey\n• **Contact** - Get in touch\n• **Resume** - Download CV\n\nWhat interests you?`
}

// Chat-first navigation handler
const handleNavSelect = (navData) => {
  closeMobileSidebar()
  
  const sectionResponses = {
    home: `Welcome! I'm Suleiman Msaba, a Full Stack Developer from Dar es Salaam, Tanzania.\n\nFeel free to ask me about my projects, skills, or experience!`,
    chat: `I'm here to help! Ask me anything about my work, skills, or how to get in touch.`,
    projects: `Here are my featured projects:\n\n${projects.map(p => `• **${p.name}**: ${p.description}`).join('\n')}\n\nWant to know more about any of these?`,
    skills: `My technical skills:\n\n**Technologies:** ${skills.join(', ')}\n\nI specialize in modern web development with Vue.js and JavaScript.`,
    about: `I'm **Suleiman Msaba**, a Full Stack Developer based in Dar es Salaam, Tanzania 🇹🇿\n\nI build modern web applications and love creating great user experiences. Ask me anything!`,
    resume: `📄 **My Resume**\n\nYou can download my CV here: [Download Resume](${cvLink})\n\nIt includes:\n• Work history\n• Education\n• Certifications\n• Technical skills`,
    contact: `Let's connect!\n\n📧 **Email:** ${contactInfo.email}\n📱 **Phone:** ${contactInfo.phone}\n💼 **LinkedIn:** ${contactInfo.linkedin}\n🐙 **GitHub:** ${contactInfo.github}\n\nFeel free to reach out!`
  }
  
  if (sectionResponses[navData.section]) {
    addMessage({
      id: Date.now(),
      isUser: false,
      text: sectionResponses[navData.section],
      timestamp: new Date().toISOString()
    })
  }
}

// Sidecar panel handlers
const closeSidecar = () => {
  sidecarOpen.value = false
}

const handleProjectView = (project) => {
  addMessage({
    id: Date.now(),
    isUser: false,
    text: `**${project.name}**\n\n${project.description}\n\n**Technologies:** ${project.tags.join(', ')}\n\n${project.demo ? `[View Demo](${project.demo})` : ''} ${project.github ? `[GitHub](${project.github})` : ''}`,
    timestamp: new Date().toISOString()
  })
}

const handleContactSent = (contactData) => {
  addMessage({
    id: Date.now(),
    isUser: false,
    text: `Thanks for reaching out, ${contactData.name}! I'll get back to you at ${contactData.email} soon. 📧`,
    timestamp: new Date().toISOString()
  })
}

// Watch theme changes
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

/* Main Chat Area */
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

/* Mobile Header */
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

.mobile-menu-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-menu-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.mobile-brand {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

/* Mobile Overlay */
.mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Responsive */
@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .chat-main {
    margin-left: 0;
    padding-top: 48px;
  }
  
  #app-shell.sidebar-collapsed .chat-main {
    margin-left: 0;
  }
}
</style>
