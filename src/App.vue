<template>
  <div
    id="app-shell"
    :class="{ 'chat-started': chatStarted, 'sidecar-open': sidecarOpen }"
    :data-theme="theme"
    :style="shellStyle"
  >
    <!-- ===================== DESKTOP TOP NAVBAR ===================== -->
    <NavigationBar
      v-if="!isMobile"
      class="navbar-header"
      @research-click="handleResearchClick"
      @product-click="toggleSidecar"
      @theme-toggle="toggleTheme"
      :theme="theme"
    />

    <!-- ===================== DESKTOP LEFT SIDEBAR (ChatGPT-style) ===================== -->
    <ChatSidebar
      v-if="!isMobile"
      :theme="theme"
      @nav-select="handleNavSelect"
      @toggle-theme="toggleTheme"
      @toggle-collapse="handleSidebarCollapse"
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

      <a class="mobile-brand" href="#" aria-label="Home">
        <span class="brand-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2l3 7h7l-5.5 4 2.5 7-7-4.5L5 20l2.5-7L2 9h7l3-7z" />
          </svg>
        </span>
        <span class="brand-text">Portfolio ChatGPT</span>
      </a>

      <ThemeToggle :theme="theme" @toggle="toggleTheme" />
    </header>

    <!-- ===================== MOBILE SIDEBAR OVERLAY ===================== -->
    <div
      v-if="isMobile && mobileSidebarOpen"
      class="mobile-overlay"
      @click="closeMobileSidebar"
      aria-hidden="true"
    />

    <ChatSidebar
      v-if="isMobile"
      :theme="theme"
      :class="{ 'mobile-open': mobileSidebarOpen }"
      @close="closeMobileSidebar"
      @nav-select="handleNavSelect"
      @toggle-theme="toggleTheme"
      @toggle-collapse="handleSidebarCollapse"
    />

    <!-- ===================== MAIN CHAT AREA ===================== -->
    <main class="chat-main" :class="{ centered: !chatStarted }">
      <ChatContainer
        ref="chatContainer"
        :messages="messages"
        :is-typing="isTyping"
        :chat-started="chatStarted"
        @send-message="handleSendMessage"
        @footer-action="handleNavSelect"
      />
    </main>

    <!-- ===================== SIDE PANEL ===================== -->
    <SidecarPanel
      :is-open="sidecarOpen"
      :current-persona="currentPersona"
      @close="closeSidecar"
      @project-view="handleProjectView"
      @contact-sent="handleContactSent"
      @width-change="handleSidecarWidthChange"
    />
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

import ChatContainer from './components/ChatContainer.vue'
import ChatSidebar from './components/ChatSidebar.vue'
import NavigationBar from './components/NavigationBar.vue'
import SidecarPanel from './components/SidecarPanel.vue'
import ThemeToggle from './components/ThemeToggle.vue'

import { projects, skills, timeline, contactInfo, cvLink } from './data/portfolio-data.js'

// ── Reactive viewport (fixes non-reactive isMobile bug) ───────────────────
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const isMobile = computed(() => windowWidth.value < 769)

// ── App State ────────────────────────────────────────────────────────────
const theme = ref('dark')
const chatStarted = ref(false)
const mobileSidebarOpen = ref(false)
const sidecarOpen = ref(false)
const currentPersona = ref('default')

const isTyping = ref(false)
const messages = shallowRef([]) // recruiter-friendly perf: avoids deep reactivity cost
const chatContainer = ref(null)

// Desktop sidebar state (so layout stays correct when collapsed)
const sidebarCollapsed = ref(false)

// Sidecar width state (matches SidecarPanel and fixes hardcoded 400px overlap)
const sidecarWidth = ref(420)

// ── Layout style vars (no overlap, no magic numbers) ─────────────────────
const shellStyle = computed(() => {
  const leftWidth = isMobile.value ? 0 : (sidebarCollapsed.value ? 56 : 200)
  const rightWidth = (!isMobile.value && sidecarOpen.value) ? sidecarWidth.value : 0

  return {
    '--left-sidebar-width': `${leftWidth}px`,
    '--sidecar-width': `${rightWidth}px`
  }
})

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

// ── Desktop Sidebar ──────────────────────────────────────────────────────
const handleSidebarCollapse = (collapsed) => {
  sidebarCollapsed.value = !!collapsed
}

// ── Sidecar ──────────────────────────────────────────────────────────────
const toggleSidecar = () => {
  sidecarOpen.value = !sidecarOpen.value
  if (sidecarOpen.value) {
    addMessage({
      id: Date.now(),
      isUser: false,
      text: 'Opened the portfolio panel. You can browse projects, skills, timeline, or contact me from there.',
      timestamp: new Date().toISOString()
    })
  }
}

const closeSidecar = () => {
  sidecarOpen.value = false
}

const handleSidecarWidthChange = (newWidth) => {
  const n = Number(newWidth)
  if (Number.isFinite(n) && n >= 280 && n <= 900) {
    sidecarWidth.value = n
  }
}

// ── Messages ─────────────────────────────────────────────────────────────
const addMessage = (message) => {
  // shallowRef requires reassign to trigger updates in some patterns; safest:
  messages.value = [...messages.value, message]

  nextTick(() => {
    chatContainer.value?.scrollToBottom?.()
  })
}

const getWelcomeMessage = () => {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return `${greeting}. I'm Suleiman's portfolio assistant.

You can ask about:
• Projects
• Skills
• Experience
• Contact details

Type a question or use the navigation.`
}

// ── Chat Logic ───────────────────────────────────────────────────────────
const handleSendMessage = async (payload) => {
  if (!chatStarted.value) chatStarted.value = true

  if (isMobile.value && mobileSidebarOpen.value) closeMobileSidebar()

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
  }, 450)
}

// ── Local Response Logic (robust to skills structure mismatch) ───────────
async function generateResponse(query) {
  const q = String(query || '').toLowerCase()

  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return "Hello. What would you like to review—projects, skills, experience, or contact details?"
  }

  if (q.includes('project')) {
    if (projects && projects.length > 0) {
      let response = 'Here are selected projects:\n\n'
      projects.forEach((project, index) => {
        response += `${index + 1}. **${project.name}** — ${project.description}\n`
        if (project.technologies?.length) response += `   _Tech: ${project.technologies.join(', ')}_\n`
        response += '\n'
      })
      return response.trim()
    }
    return 'Projects are not available yet.'
  }

  if (q.includes('skill')) {
    if (!skills || skills.length === 0) return 'Skills are not available yet.'

    // Supports:
    // A) [{ category: 'Frontend', items: [{ name, level }] }]
    // B) [{ category: 'Frontend', name: 'Vue' }]
    // C) ['Vue', 'Node']
    const first = skills[0]

    // A) grouped categories
    if (first && typeof first === 'object' && Array.isArray(first.items)) {
      let response = 'My skills by category:\n\n'
      skills.forEach(cat => {
        response += `**${cat.category}**:\n`
        cat.items.forEach(s => {
          const lvl = s.level ? ` (${s.level})` : ''
          response += `• ${s.name}${lvl}\n`
        })
        response += '\n'
      })
      return response.trim()
    }

    // B) flat objects with category + name
    if (first && typeof first === 'object' && first.category && first.name) {
      const categorized = {}
      skills.forEach(s => {
        if (!categorized[s.category]) categorized[s.category] = []
        categorized[s.category].push(s.level ? `${s.name} (${s.level})` : s.name)
      })

      let response = 'My skills by category:\n\n'
      Object.entries(categorized).forEach(([cat, list]) => {
        response += `**${cat}**:\n`
        list.forEach(item => (response += `• ${item}\n`))
        response += '\n'
      })
      return response.trim()
    }

    // C) plain strings
    if (Array.isArray(skills) && typeof skills[0] === 'string') {
      return `My skills include:\n\n• ${skills.join('\n• ')}`
    }

    return 'Skills format is not recognized yet.'
  }

  if (q.includes('experience') || q.includes('work')) {
    if (timeline && timeline.length > 0) {
      let response = 'Experience timeline:\n\n'

      // Supports common shapes; renders what exists
      timeline.forEach((t, i) => {
        const title = t.role || t.title || 'Experience'
        const org = t.company || t.organization || ''
        const when = t.duration || t.date || ''
        const desc = t.description || ''
        response += `${i + 1}. **${title}**${org ? ` at ${org}` : ''}\n`
        if (when) response += `   ${when}\n`
        if (desc) response += `   ${desc}\n`
        response += '\n'
      })

      return response.trim()
    }
    return 'Experience information is not available yet.'
  }

  if (q.includes('contact')) {
    if (!contactInfo) return 'Contact information is not available yet.'
    let response = 'You can reach me via:\n\n'
    if (contactInfo.email) response += `Email: ${contactInfo.email}\n`
    if (contactInfo.phone) response += `Phone: ${contactInfo.phone}\n`
    if (contactInfo.location) response += `Location: ${contactInfo.location}\n`
    if (contactInfo.linkedin) response += `LinkedIn: ${contactInfo.linkedin}\n`
    if (contactInfo.github) response += `GitHub: ${contactInfo.github}\n`
    return response.trim()
  }

  if (q.includes('help')) {
    return 'Ask about projects, skills, experience, or contact details.'
  }

  return 'Ask about projects, skills, experience, or contact details. What should I show you?'
}

// ── Navigation & Sidecar Events ──────────────────────────────────────────
const handleNavSelect = (navData) => {
  if (isMobile.value) closeMobileSidebar()

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
    text: 'Switched to Research mode. You can explore academic and research work in the side panel.',
    timestamp: new Date().toISOString()
  })
}

const handleProjectView = (project) => {
  addMessage({
    id: Date.now(),
    isUser: false,
    text: `**${project.name}**\n\n${project.description}\n\n**Technologies**: ${project.technologies?.join(', ') || 'Various'}\n`,
    timestamp: new Date().toISOString()
  })

  if (isMobile.value) closeSidecar()
}

const handleContactSent = (data) => {
  addMessage({
    id: Date.now(),
    isUser: false,
    text: `Thank you, ${data.name}. Your message has been sent.`,
    timestamp: new Date().toISOString()
  })

  closeSidecar()
}

// ── Resize handling (reactive isMobile + safe cleanup) ───────────────────
function debounce(fn, wait = 100) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
}

const onResize = debounce(() => {
  windowWidth.value = window.innerWidth

  // If we crossed back to desktop, ensure mobile overlay is closed
  if (!isMobile.value && mobileSidebarOpen.value) closeMobileSidebar()
}, 100)

// ── Lifecycle ────────────────────────────────────────────────────────────
onMounted(() => {
  restoreTheme()

  // Restore desktop sidebar state for correct initial layout
  const savedCollapsed = localStorage.getItem('sidebar-collapsed')
  if (savedCollapsed === 'true') sidebarCollapsed.value = true

  // Restore sidecar width to match SidecarPanel/localStorage
  const savedSidecarWidth = localStorage.getItem('sidecar-width')
  if (savedSidecarWidth) {
    const n = parseInt(savedSidecarWidth, 10)
    if (!Number.isNaN(n)) sidecarWidth.value = n
  }

  if (messages.value.length === 0) {
    setTimeout(() => {
      addMessage({
        id: Date.now(),
        isUser: false,
        text: getWelcomeMessage(),
        timestamp: new Date().toISOString()
      })
    }, 250)
  }

  window.addEventListener('resize', onResize, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  document.body.style.overflow = ''
})
</script>

<style>
/* ================================
   App Shell Variables
   ================================ */
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
  --brand-gradient: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);

  /* Layout vars (controlled by App.vue computed style) */
  --left-sidebar-width: 0px;
  --sidecar-width: 0px;
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

/* ================================
   Base Reset
   ================================ */
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* ================================
   App Shell Layout
   ================================ */
#app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background 0.3s ease;
}

/* ================================
   Mobile Header
   ================================ */
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-subtle);
  z-index: 1000;
}

[data-theme="light"] .mobile-header { background: rgba(255, 255, 255, 0.85); }

.mobile-menu-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.mobile-menu-btn:hover { background: var(--surface-hover); }

.mobile-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 16px;
}

.mobile-brand .brand-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--brand-gradient);
  border-radius: 6px;
  color: white;
}

.mobile-brand .brand-icon svg { width: 16px; height: 16px; }

.mobile-brand .brand-text {
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ================================
   Mobile Overlay
   ================================ */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 998;
}

/* ================================
   Desktop Navbar
   ================================ */
.navbar-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 950;
}

/* ================================
   Main Chat Area
   ================================ */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* account for fixed top navbar on desktop */
  padding-top: 64px;

  /* critical: no overlap with sidebars */
  margin-left: var(--left-sidebar-width);
  margin-right: var(--sidecar-width);

  transition: margin 0.2s ease, padding 0.2s ease;
}

.chat-main.centered {
  justify-content: center;
  align-items: center;
}

@media (max-width: 768px) {
  .chat-main {
    padding-top: 60px;
    margin-left: 0;
    margin-right: 0;
  }
}

/* ================================
   Reduced Motion
   ================================ */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
