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

    <!-- ===================== DESKTOP LEFT SIDEBAR ===================== -->
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

// IMPORTANT: matches your src/data/portfolio-data.js exports
import { projects, skills, timeline, contactInfo, cvLink, bio } from './data/portfolio-data.js'

// ── Reactive viewport ────────────────────────────────────────────────────
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const isMobile = computed(() => windowWidth.value < 769)

// ── App State ────────────────────────────────────────────────────────────
const theme = ref('dark')
const chatStarted = ref(false)
const mobileSidebarOpen = ref(false)

const sidecarOpen = ref(false)
const currentPersona = ref('default')

const isTyping = ref(false)
const messages = shallowRef([])
const chatContainer = ref(null)

const sidebarCollapsed = ref(false)
const sidecarWidth = ref(420)

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
  localStorage.setItem('sidebar-collapsed', sidebarCollapsed.value ? 'true' : 'false')
}

// ── Sidecar ──────────────────────────────────────────────────────────────
const toggleSidecar = () => {
  sidecarOpen.value = !sidecarOpen.value
}

const closeSidecar = () => {
  sidecarOpen.value = false
}

const handleSidecarWidthChange = (newWidth) => {
  const n = Number(newWidth)
  if (Number.isFinite(n) && n >= 280 && n <= 900) sidecarWidth.value = n
}

// ── Messages ─────────────────────────────────────────────────────────────
const addMessage = (message) => {
  messages.value = [...messages.value, message]
  nextTick(() => chatContainer.value?.scrollToBottom?.())
}

const getWelcomeMessage = () => {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const tagline = bio?.tagline ? `\n\n${bio.tagline}` : ''
  return `${greeting}. I'm Suleiman's portfolio assistant.

Ask me about:
• Projects
• Skills
• Experience / Timeline
• Contact
• CV / Resume${tagline}`
}

// ── Formatting helpers (clean output for recruiters) ─────────────────────
const formatList = (arr, bullet = '•') => (Array.isArray(arr) ? arr.map(i => `${bullet} ${i}`).join('\n') : '')
const titleCase = (s) => String(s || '').replace(/(^|\s)\S/g, (t) => t.toUpperCase())

function formatSkillLevel(level) {
  // your data uses strings: advanced/intermediate
  if (!level) return ''
  return `(${titleCase(level)})`
}

// ── Chat Logic ───────────────────────────────────────────────────────────
const handleSendMessage = async (payload) => {
  const text = payload?.text ?? ''
  if (!chatStarted.value) chatStarted.value = true
  if (isMobile.value && mobileSidebarOpen.value) closeMobileSidebar()

  addMessage({
    id: Date.now(),
    isUser: true,
    text,
    timestamp: new Date().toISOString()
  })

  isTyping.value = true
  const response = await generateResponse(text)

  setTimeout(() => {
    isTyping.value = false
    addMessage({
      id: Date.now() + 1,
      isUser: false,
      text: response,
      timestamp: new Date().toISOString()
    })
  }, 350)
}

async function generateResponse(query) {
  const q = String(query || '').toLowerCase().trim()

  if (!q) {
    return 'Type a question about projects, skills, experience, contact, or CV.'
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return "Hello. What would you like to see—projects, skills, experience, contact, or CV?"
  }

  // ABOUT/BIO
  if (q.includes('about') || q.includes('bio') || q.includes('who are you')) {
    if (!bio) return 'Bio information is not available yet.'
    return `**About Suleiman**\n\n${bio.long || bio.short || ''}`.trim()
  }

  // PROJECTS
  if (q.includes('project')) {
    if (!Array.isArray(projects) || projects.length === 0) return 'Projects are not available yet.'

    let out = `**Projects (${projects.length})**\n\n`
    projects.forEach((p, i) => {
      out += `${i + 1}. **${p.name}** (${p.year || '—'}, ${titleCase(p.status)})\n`
      out += `   ${p.description}\n`
      if (Array.isArray(p.techStack) && p.techStack.length) out += `   Tech: ${p.techStack.join(', ')}\n`
      if (Array.isArray(p.features) && p.features.length) out += `   Features:\n${formatList(p.features, '   •')}\n`
      if (p.link && p.link !== '#') out += `   Link: ${p.link}\n`
      out += `\n`
    })
    return out.trim()
  }

  // SKILLS
  if (q.includes('skill') || q.includes('stack') || q.includes('technology')) {
    if (!Array.isArray(skills) || skills.length === 0) return 'Skills are not available yet.'

    let out = `**Skills & Technologies**\n\n`
    skills.forEach((cat) => {
      out += `**${cat.category}**\n`
      ;(cat.items || []).forEach((s) => {
        out += `• ${s.name} ${formatSkillLevel(s.level)}\n`
      })
      out += `\n`
    })
    return out.trim()
  }

  // EXPERIENCE / TIMELINE
  if (q.includes('experience') || q.includes('timeline') || q.includes('work') || q.includes('career')) {
    if (!Array.isArray(timeline) || timeline.length === 0) return 'Experience timeline is not available yet.'

    let out = `**Experience Timeline**\n\n`
    timeline.forEach((t, i) => {
      out += `${i + 1}. **${t.role}** — ${t.company}\n`
      out += `   ${t.duration}${t.year ? ` | ${t.year}` : ''}\n`
      out += `   ${t.description}\n`
      if (Array.isArray(t.highlights) && t.highlights.length) {
        out += `   Highlights:\n${formatList(t.highlights, '   •')}\n`
      }
      out += `\n`
    })
    return out.trim()
  }

  // CONTACT
  if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('reach')) {
    if (!contactInfo) return 'Contact information is not available yet.'
    const lines = []
    if (contactInfo.email) lines.push(`Email: ${contactInfo.email}`)
    if (contactInfo.phone) lines.push(`Phone: ${contactInfo.phone}`)
    if (contactInfo.location) lines.push(`Location: ${contactInfo.location}`)
    if (contactInfo.linkedin) lines.push(`LinkedIn: ${contactInfo.linkedin}`)
    if (contactInfo.github) lines.push(`GitHub: ${contactInfo.github}`)
    if (contactInfo.availability) lines.push(`Availability: ${contactInfo.availability}`)
    return `**Contact**\n\n${lines.join('\n')}`.trim()
  }

  // CV
  if (q.includes('cv') || q.includes('resume') || q.includes('résumé')) {
    if (!cvLink) return 'CV link is not available yet.'
    return `**CV / Resume**\n\nYou can open or download the CV here:\n${cvLink}`
  }

  return 'Ask about projects, skills, experience/timeline, contact, or CV. What would you like to see?'
}

// ── Navigation / Sidecar Events ──────────────────────────────────────────
const handleNavSelect = (navData) => {
  if (isMobile.value) closeMobileSidebar()

  // Defensive: supports both {type:'projects'} and string types
  const type = typeof navData === 'string' ? navData : navData?.type

  switch (type) {
    case 'projects':
      handleSendMessage({ text: 'Show me your projects' })
      break
    case 'skills':
      handleSendMessage({ text: 'What are your skills and tech stack?' })
      break
    case 'experience':
    case 'timeline':
      handleSendMessage({ text: 'Show me your experience timeline' })
      break
    case 'contact':
      handleSendMessage({ text: 'How can I contact you?' })
      break
    case 'cv':
      if (cvLink) window.open(cvLink, '_blank')
      else handleSendMessage({ text: 'CV' })
      break
    case 'about':
      handleSendMessage({ text: 'Tell me about you' })
      break
    default:
      // If sidebar sends unknown types, don’t crash.
      handleSendMessage({ text: 'Help' })
  }
}

const handleResearchClick = () => {
  currentPersona.value = 'researcher'
  sidecarOpen.value = true
  addMessage({
    id: Date.now(),
    isUser: false,
    text: 'Research mode enabled. You can use the side panel while we discuss projects, experience, and documentation.',
    timestamp: new Date().toISOString()
  })
}

const handleProjectView = (project) => {
  // SidecarPanel currently emits its own project object.
  // We support either shape: your portfolio-data project or SidecarPanel project.
  const name = project?.name || 'Project'
  const desc = project?.description || ''
  const stack = project?.techStack || project?.technologies || []
  const features = project?.features || []
  const link = project?.link || project?.demo || ''

  let out = `**${name}**\n\n${desc}\n`
  if (Array.isArray(stack) && stack.length) out += `\n**Tech Stack**: ${stack.join(', ')}\n`
  if (Array.isArray(features) && features.length) out += `\n**Key Features**:\n${formatList(features)}\n`
  if (link && link !== '#') out += `\n**Link**: ${link}\n`

  addMessage({
    id: Date.now(),
    isUser: false,
    text: out.trim(),
    timestamp: new Date().toISOString()
  })
}

const handleContactSent = (data) => {
  addMessage({
    id: Date.now(),
    isUser: false,
    text: `Thank you, ${data?.name || 'there'}. Your message has been captured.`,
    timestamp: new Date().toISOString()
  })
  closeSidecar()
}

// ── Resize handling ──────────────────────────────────────────────────────
function debounce(fn, wait = 100) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
}

const onResize = debounce(() => {
  windowWidth.value = window.innerWidth
  if (!isMobile.value && mobileSidebarOpen.value) closeMobileSidebar()
}, 100)

// ── Lifecycle ────────────────────────────────────────────────────────────
onMounted(() => {
  restoreTheme()

  const savedCollapsed = localStorage.getItem('sidebar-collapsed')
  if (savedCollapsed === 'true') sidebarCollapsed.value = true

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
    }, 200)
  }

  window.addEventListener('resize', onResize, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  document.body.style.overflow = ''
})
</script>

<style>
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
  --border-subtle: #e0e0e0;
  --border-medium: #d0d0d0;
  --surface-hover: rgba(0, 0, 0, 0.05);
  --surface-active: rgba(0, 0, 0, 0.1);
}

* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

#app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.navbar-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 950;
}

/* Mobile Header */
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
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 6px;
  color: white;
}
.mobile-brand .brand-icon svg { width: 16px; height: 16px; }
.mobile-brand .brand-text {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 998;
}

/* Main chat area */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: 64px;
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
