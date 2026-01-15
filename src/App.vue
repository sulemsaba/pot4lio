<template>
  <div
    id="app-shell"
    :class="{ 'chat-started': chatStarted, 'sidecar-open': sidecarOpen }"
    :data-theme="theme"
  >
    <!-- ===================== DESKTOP NAVBAR ===================== -->
    <NavigationBar
      v-if="!isMobile"
      class="navbar-header"
      @research-click="handleResearchClick"
      @product-click="toggleSidecar"
      @theme-toggle="toggleTheme"
      :theme="theme"
    />

    <!-- ===================== MOBILE HEADER ===================== -->
    <header v-if="isMobile" class="mobile-header">
      <button
        class="mobile-menu-btn"
        @click="toggleMobileSidebar"
        aria-label="Toggle menu"
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
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      <span class="mobile-brand">Suleiman Msaba</span>

      <button
        class="mobile-theme-btn"
        @click="toggleTheme"
        aria-label="Toggle theme"
      >
        <svg
          v-if="theme === 'dark'"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg
          v-else
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
    </header>

    <!-- ===================== MOBILE OVERLAY ===================== -->
    <div
      v-if="mobileSidebarOpen && isMobile"
      class="mobile-overlay"
      @click="closeMobileSidebar"
    />

    <!-- ===================== LEFT SIDEBAR (MOBILE) ===================== -->
    <ChatSidebar
      v-if="isMobile"
      :theme="theme"
      :class="{ 'mobile-open': mobileSidebarOpen }"
      @toggle-theme="toggleTheme"
      @nav-select="handleNavSelect"
    />

    <!-- ===================== MAIN CHAT ===================== -->
    <main
      class="chat-main"
      :class="{ centered: !chatStarted }"
    >
      <ChatContainer
        ref="chatContainer"
        :messages="messages"
        :is-typing="isTyping"
        :is-centered="!chatStarted"
        @send-message="handleSendMessage"
      />
    </main>

    <!-- ===================== RIGHT SIDECAR ===================== -->
    <SidecarPanel
      v-if="sidecarOpen"
      :is-open="sidecarOpen"
      :current-persona="currentPersona"
      @close="closeSidecar"
      @project-view="handleProjectView"
      @contact-sent="handleContactSent"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'

import NavigationBar from './components/NavigationBar.vue'
import ChatSidebar from './components/ChatSidebar.vue'
import ChatContainer from './components/ChatContainer.vue'
import SidecarPanel from './components/SidecarPanel.vue'

import {
  projects,
  skills,
  timeline,
  contactInfo,
  cvLink
} from './data/portfolio-data.js'

// ── State ────────────────────────────────────────────────────────────────
const theme = ref('dark')
const mobileSidebarOpen = ref(false)
const sidecarOpen = ref(false)
const currentPersona = ref('developer')

const messages = ref([])
const isTyping = ref(false)
const chatStarted = ref(false)
const chatContainer = ref(null)

// ── Computed ─────────────────────────────────────────────────────────────
const isMobile = computed(() => window.innerWidth < 769)

// ── Theme ────────────────────────────────────────────────────────────────
const restoreTheme = () => {
  const saved = localStorage.getItem('theme')
  if (saved) theme.value = saved
  document.documentElement.setAttribute('data-theme', theme.value)
}

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', theme.value)
  document.documentElement.setAttribute('data-theme', theme.value)
}

// ── Mobile Sidebar ───────────────────────────────────────────────────────
const toggleMobileSidebar = () => {
  mobileSidebarOpen.value = !mobileSidebarOpen.value
  document.body.style.overflow = mobileSidebarOpen.value ? 'hidden' : ''
}

const closeMobileSidebar = () => {
  mobileSidebarOpen.value = false
  document.body.style.overflow = ''
}

const handleResize = () => {
  if (!isMobile.value && mobileSidebarOpen.value) {
    closeMobileSidebar()
  }
}

// ── Sidecar ──────────────────────────────────────────────────────────────
const toggleSidecar = () => {
  sidecarOpen.value = !sidecarOpen.value
  if (sidecarOpen.value) {
    addMessage({
      id: Date.now(),
      isUser: false,
      text: "Opened projects panel. Browse my work or contact me directly from here.",
      timestamp: new Date().toISOString()
    })
  }
}

const closeSidecar = () => {
  sidecarOpen.value = false
}

// ── Messages ─────────────────────────────────────────────────────────────
const addMessage = (message) => {
  messages.value.push(message)
  nextTick(() => {
    chatContainer.value?.scrollToBottom?.()
  })
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

Just ask me anything or use the navigation buttons above!`
}

// ── Chat Logic ───────────────────────────────────────────────────────────
const handleSendMessage = async (payload) => {
  if (!chatStarted.value) {
    chatStarted.value = true
  }

  if (isMobile.value && mobileSidebarOpen.value) {
    closeMobileSidebar()
  }

  addMessage({
    id: Date.now(),
    isUser: true,
    text: payload.text,
    timestamp: new Date().toISOString()
  })

  isTyping.value = true

  const response = await generateResponse(payload.text)

  setTimeout(() => {
    isTyping.value = false
    addMessage({
      id: Date.now() + 1,
      isUser: false,
      text: response,
      timestamp: new Date().toISOString()
    })
  }, 700)
}

// ── Simple local response logic (unchanged) ──────────────────────────────
async function generateResponse(query) {
  const q = query.toLowerCase()

  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return "Hello! How can I help you learn about Suleiman's work today?"
  }

  if (q.includes('project')) {
    if (projects && projects.length > 0) {
      let response = "Here are my projects:\n\n"
      projects.forEach((project, index) => {
        response += `${index + 1}. **${project.name}** — ${project.description}\n`
        if (project.technologies && project.technologies.length > 0) {
          response += `   _Tech: ${project.technologies.join(', ')}_\n\n`
        } else {
          response += '\n'
        }
      })
      return response
    }
    return "I don't have projects listed yet. Please check back soon!"
  }

  if (q.includes('skill')) {
    if (skills && skills.length > 0) {
      if (skills[0] && typeof skills[0] === 'object' && skills[0].category) {
        const categorized = {}
        skills.forEach(skill => {
          if (!categorized[skill.category]) categorized[skill.category] = []
          categorized[skill.category].push(skill.name)
        })
        
        let response = "My skills by category:\n\n"
        Object.entries(categorized).forEach(([category, skillList]) => {
          response += `**${category}**:\n`
          skillList.forEach(skill => response += `• ${skill}\n`)
          response += '\n'
        })
        return response
      } else {
        return `My skills include:\n\n• ${skills.join('\n• ')}`
      }
    }
    return "Skills information is not available yet."
  }

  if (q.includes('experience') || q.includes('work')) {
    if (timeline && timeline.length > 0) {
      let response = "My experience timeline:\n\n"
      timeline.forEach((exp, index) => {
        response += `${index + 1}. **${exp.role}** at ${exp.company}\n`
        response += `   ${exp.duration}\n`
        response += `   ${exp.description}\n\n`
      })
      return response
    }
    return "Experience information is not available yet."
  }

  if (q.includes('contact')) {
    if (contactInfo) {
      let response = "You can reach me at:\n\n"
      response += `📧 **Email**: ${contactInfo.email || 'Not provided'}\n`
      response += `📞 **Phone**: ${contactInfo.phone || 'Not provided'}\n`
      if (contactInfo.location) response += `📍 **Location**: ${contactInfo.location}\n`
      if (contactInfo.linkedin) response += `🔗 **LinkedIn**: ${contactInfo.linkedin}\n`
      if (contactInfo.github) response += `💻 **GitHub**: ${contactInfo.github}\n`
      return response
    }
    return "Contact information is not available yet."
  }

  if (q.includes('help')) {
    return "I can help you with:\n\n• **Projects** - View my portfolio work\n• **Skills** - See my technical expertise\n• **Experience** - Check my career timeline\n• **Contact** - Get in touch with me\n\nJust ask about any of these topics!"
  }

  return "I can help you with information about projects, skills, experience, or contact details. What would you like to know more about?"
}

// ── Navigation & Sidecar Events ──────────────────────────────────────────
const handleNavSelect = (navData) => {
  closeMobileSidebar()
  
  switch (navData.type) {
    case 'projects':
      handleSendMessage({ text: 'Tell me about your projects' })
      break
    case 'skills':
      handleSendMessage({ text: 'What are your skills?' })
      break
    case 'experience':
      handleSendMessage({ text: 'Show me your experience' })
      break
    case 'contact':
      handleSendMessage({ text: 'How can I contact you?' })
      break
    case 'cv':
      if (cvLink) window.open(cvLink, '_blank')
      break
  }
}

const handleResearchClick = () => {
  currentPersona.value = 'researcher'
  sidecarOpen.value = true
  
  addMessage({
    id: Date.now(),
    isUser: false,
    text: "Switched to **Researcher** mode. You can now explore my academic and research projects.",
    timestamp: new Date().toISOString()
  })
}

const handleProjectView = (project) => {
  addMessage({
    id: Date.now(),
    isUser: false,
    text: `**${project.name}**\n\n${project.description}\n\n**Technologies**: ${project.technologies?.join(', ') || 'Various technologies'}\n\n**Features**:\n${project.features?.map(f => `• ${f}`).join('\n') || 'Check the project panel for details.'}`,
    timestamp: new Date().toISOString()
  })
  
  if (isMobile.value) closeSidecar()
}

const handleContactSent = (data) => {
  addMessage({
    id: Date.now(),
    isUser: false,
    text: `Thank you ${data.name}! Your message has been sent. I'll get back to you shortly.`,
    timestamp: new Date().toISOString()
  })
  
  closeSidecar()
}

// ── Lifecycle ────────────────────────────────────────────────────────────
onMounted(() => {
  restoreTheme()
  
  if (messages.value.length === 0) {
    setTimeout(() => {
      addMessage({
        id: Date.now(),
        isUser: false,
        text: getWelcomeMessage(),
        timestamp: new Date().toISOString()
      })
    }, 300)
  }
  
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style>
/* Your original style remains unchanged - just keeping it here for completeness */
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  --bg-tertiary: #2a2a2a;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --text-tertiary: #707070;
  --accent-primary: #3b82f6;
  --accent-secondary: #8b5cf6;
  --border-subtle: #333333;
  --border-medium: #444444;
  --surface-hover: rgba(255, 255, 255, 0.05);
  --surface-active: rgba(255, 255, 255, 0.1);
  --shadow-small: 0 1px 3px rgba(0, 0, 0, 0.5);
  --shadow-medium: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-large: 0 10px 25px rgba(0, 0, 0, 0.4);
}

[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #e5e5e5;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --text-tertiary: #888888;
  --accent-primary: #2563eb;
  --accent-secondary: #7c3aed;
  --border-subtle: #e0e0e0;
  --border-medium: #d0d0d0;
  --surface-hover: rgba(0, 0, 0, 0.05);
  --surface-active: rgba(0, 0, 0, 0.1);
  --shadow-small: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-medium: 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-large: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Rest of your original style remains the same... */
* { margin:0; padding:0; box-sizing:border-box; }
html, body { height:100%; width:100%; overflow:hidden; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif; }
/* ...and so on - keeping your original style intact */
</style>