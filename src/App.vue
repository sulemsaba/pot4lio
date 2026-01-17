<template>
  <div
    id="app-shell"
    :class="{ 'chat-started': chatStarted, 'sidecar-open': sidecarOpen }"
    :data-theme="theme"
    :style="appShellStyle"
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
      <button class="mobile-menu-btn" @click="toggleMobileSidebar" aria-label="Toggle menu">
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

      <div class="mobile-title">
        <span class="logo">Portfolio</span>
      </div>

      <ThemeToggle :theme="theme" @toggle-theme="toggleTheme" class="mobile-theme-btn" />
    </header>

    <!-- ===================== MOBILE SIDEBAR ===================== -->
    <ChatSidebar
      v-if="isMobile"
      :is-open="mobileSidebarOpen"
      @close="closeMobileSidebar"
      @nav-select="handleNavSelect"
      :theme="theme"
    />

    <!-- Mobile overlay -->
    <div v-if="isMobile && mobileSidebarOpen" class="mobile-overlay" @click="closeMobileSidebar"></div>

    <!-- ===================== MAIN CHAT AREA ===================== -->
    <main class="main-content" role="main">
      <ChatContainer
        ref="chatContainer"
        :messages="messages"
        :is-typing="isTyping"
        @send-message="handleSendMessage"
      />
    </main>

    <!-- ===================== SIDECAR PANEL ===================== -->
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
import { ref, computed, onMounted, onUnmounted } from 'vue'

import NavigationBar from './components/NavigationBar.vue'
import ChatSidebar from './components/ChatSidebar.vue'
import ChatContainer from './components/ChatContainer.vue'
import SidecarPanel from './components/SidecarPanel.vue'
import ThemeToggle from './components/ThemeToggle.vue'

import portfolioData, {
  projects,
  skills,
  timeline,
  contactInfo,
  bio,
  achievements,
  faq,
  cvLink
} from './data/portfolio-data.js'

/**
 * Layout & UI state
 */
const theme = ref('dark')
const currentPersona = ref('default')

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const isMobile = computed(() => windowWidth.value <= 768)

const mobileSidebarOpen = ref(false)
const sidecarOpen = ref(false)
const sidecarWidth = ref(0)

/**
 * Chat state
 */
const chatContainer = ref(null)
const messages = ref([])
const isTyping = ref(false)

const chatStarted = computed(() => messages.value.length > 0)

const appShellStyle = computed(() => ({
  '--sidecar-width': sidecarOpen.value ? `${sidecarWidth.value}px` : '0px'
}))

/**
 * Theme
 */
function loadTheme() {
  const saved = localStorage.getItem('theme')
  if (saved === 'light' || saved === 'dark') theme.value = saved
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', theme.value)
}

/**
 * Navigation / Sidebars
 */
function toggleMobileSidebar() {
  mobileSidebarOpen.value = !mobileSidebarOpen.value
}

function closeMobileSidebar() {
  mobileSidebarOpen.value = false
}

function handleNavSelect(key) {
  // Keep this extensible: you can map nav items to actions later.
  closeMobileSidebar()

  if (key === 'projects' || key === 'skills' || key === 'timeline' || key === 'contact' || key === 'cv') {
    sidecarOpen.value = true
  }
}

function handleResearchClick() {
  // “Research” in your navbar can map to an “About/Skills/Projects” help response.
  messages.value.push(
    createMessage({
      isUser: false,
      text: buildHelpResponse()
    })
  )
}

function toggleSidecar() {
  sidecarOpen.value = !sidecarOpen.value
  if (sidecarOpen.value) {
    // Default width (or last saved by SidecarPanel)
    const savedWidth = Number(localStorage.getItem('sidecar-width'))
    sidecarWidth.value = Number.isFinite(savedWidth) && savedWidth > 0 ? savedWidth : 420
  } else {
    sidecarWidth.value = 0
  }
}

function closeSidecar() {
  sidecarOpen.value = false
  sidecarWidth.value = 0
}

function handleSidecarWidthChange(newWidth) {
  if (typeof newWidth === 'number' && Number.isFinite(newWidth)) {
    sidecarWidth.value = newWidth
  }
}

/**
 * Chat message helpers
 */
function createMessage({ isUser, text }) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    isUser: !!isUser,
    text: String(text || '')
  }
}

/**
 * Chat send
 */
async function handleSendMessage(payload) {
  const userText = (payload?.text || '').trim()
  if (!userText) return

  messages.value.push(createMessage({ isUser: true, text: userText }))

  isTyping.value = true

  try {
    const response = await generateResponse(userText)
    messages.value.push(createMessage({ isUser: false, text: response }))
  } finally {
    isTyping.value = false
    // ChatContainer already scrolls internally; this is a safe no-op if not exposed.
    chatContainer.value?.scrollToBottom?.()
  }
}

/**
 * Events from SidecarPanel
 */
function handleProjectView(project) {
  // Optional: when user clicks a project in SidecarPanel, mirror to chat
  if (!project?.name) return
  messages.value.push(
    createMessage({
      isUser: false,
      text: formatSingleProject(project)
    })
  )
}

function handleContactSent(contactPayload) {
  // Optional: reflect contact submission to chat (useful for demo)
  messages.value.push(
    createMessage({
      isUser: false,
      text: 'Thanks — your message has been captured. I will respond as soon as possible.'
    })
  )
}

/**
 * Chat “AI” response generator (uses your portfolio-data.js shape)
 */
async function generateResponse(query) {
  const q = query.toLowerCase()

  // Quick intent routing
  if (q.includes('project')) return formatProjects(projects)
  if (q.includes('skill') || q.includes('technology') || q.includes('stack') || q.includes('tech')) return formatSkills(skills)
  if (q.includes('experience') || q.includes('timeline') || q.includes('work') || q.includes('career')) return formatTimeline(timeline)
  if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('reach')) return formatContact(contactInfo)
  if (q.includes('about') || q.includes('bio') || q.includes('who are you') || q.includes('who are u')) return formatBio(bio)
  if (q.includes('cv') || q.includes('resume')) return `You can download my CV here: ${cvLink}`
  if (q.includes('cert') || q.includes('achievement')) return formatAchievements(achievements)
  if (q.includes('faq')) return formatFAQ(faq)
  if (q.includes('help')) return buildHelpResponse()

  // Default: helpful overview
  return buildHelpResponse()
}

function buildHelpResponse() {
  return (
    "Here’s what I can share:\n\n" +
    "• **Projects** — what I built and the tech stack\n" +
    "• **Skills** — technologies and proficiency\n" +
    "• **Experience** — timeline of roles and highlights\n" +
    "• **Contact** — email, location, availability\n" +
    "• **CV** — download link\n\n" +
    "Try: *Tell me about your projects* or *What technologies do you use?*"
  )
}

function formatProjects(list) {
  if (!Array.isArray(list) || list.length === 0) return 'No projects are listed yet.'

  const lines = list.map((p) => {
    const stack = Array.isArray(p.techStack) ? p.techStack.join(', ') : ''
    const feats = Array.isArray(p.features) && p.features.length
      ? `\n  - Key features: ${p.features.slice(0, 4).join('; ')}${p.features.length > 4 ? '; …' : ''}`
      : ''
    const meta = [p.year ? `(${p.year})` : null, p.status ? `— ${p.status}` : null].filter(Boolean).join(' ')
    return `- **${p.name}** ${meta}\n  - ${p.description}\n  - Tech: ${stack}${feats}`
  })

  return `Here are my projects:\n\n${lines.join('\n')}\n\nIf you want, say: *Tell me more about project-2* (or the project name).`
}

function formatSingleProject(p) {
  const stack = Array.isArray(p.techStack) ? p.techStack.join(', ') : ''
  const feats = Array.isArray(p.features) ? p.features.map((f) => `- ${f}`).join('\n') : ''
  const link = p.link && p.link !== '#' ? `\n\nLink: ${p.link}` : ''
  return `**${p.name}**\n\n${p.description}\n\nTech stack: ${stack}\n\nFeatures:\n${feats}${link}`
}

function formatSkills(list) {
  if (!Array.isArray(list) || list.length === 0) return 'Skills are not listed yet.'

  const lines = list.map((group) => {
    const items = Array.isArray(group.items) ? group.items : []
    const skillsLine = items.map((s) => `${s.name}${s.level ? ` (${s.level})` : ''}`).join(', ')
    return `- **${group.category}**: ${skillsLine}`
  })

  return `Here is my current skill set:\n\n${lines.join('\n')}`
}

function formatTimeline(list) {
  if (!Array.isArray(list) || list.length === 0) return 'Timeline entries are not listed yet.'

  const lines = list.map((e) => {
    const highlights = Array.isArray(e.highlights) && e.highlights.length
      ? `\n  - Highlights: ${e.highlights.slice(0, 3).join('; ')}`
      : ''
    return `- **${e.year}** — ${e.role} @ ${e.company} (${e.duration})\n  - ${e.description}${highlights}`
  })

  return `Here is my professional timeline:\n\n${lines.join('\n')}`
}

function formatBio(b) {
  if (!b) return 'Bio is not available yet.'
  const short = b.short ? `${b.short}\n\n` : ''
  const tagline = b.tagline ? `\n\nTagline: *${b.tagline}*` : ''
  return `${short}${b.long || ''}${tagline}`.trim()
}

function formatAchievements(list) {
  if (!Array.isArray(list) || list.length === 0) return 'No certifications/achievements are listed yet.'

  const lines = list.map((a) => {
    const year = a.year ? ` (${a.year})` : ''
    const issuer = a.issuer ? ` — ${a.issuer}` : ''
    return `- **${a.title}**${year}${issuer}\n  - ${a.description || ''}`
  })

  return `Here are a few certifications/achievements:\n\n${lines.join('\n')}`
}

function formatContact(c) {
  if (!c) return 'Contact details are not available yet.'

  const lines = [
    c.email ? `- Email: **${c.email}**` : null,
    c.phone ? `- Phone: **${c.phone}**` : null,
    c.location ? `- Location: ${c.location}` : null,
    c.availability ? `- Availability: ${c.availability}` : null,
    c.github ? `- GitHub: ${c.github}` : null,
    c.linkedin ? `- LinkedIn: ${c.linkedin}` : null
  ].filter(Boolean)

  return `You can reach me here:\n\n${lines.join('\n')}`
}

function formatFAQ(list) {
  if (!Array.isArray(list) || list.length === 0) return 'FAQ is not available yet.'

  const lines = list.map((item) => `**Q:** ${item.question}\n**A:** ${item.answer}`)
  return `Here are a few quick answers:\n\n${lines.join('\n\n')}`
}

/**
 * Lifecycle
 */
function handleWindowResize() {
  windowWidth.value = window.innerWidth
  if (!isMobile.value) mobileSidebarOpen.value = false
}

onMounted(() => {
  loadTheme()

  // Set sidecar width baseline
  sidecarWidth.value = 0

  // Greeting message
  messages.value.push(
    createMessage({
      isUser: false,
      text:
        "Hi — I’m a portfolio assistant. Ask about **projects**, **skills**, **experience**, or **contact**.\n\nTry: *Tell me about your projects*"
    })
  )

  window.addEventListener('resize', handleWindowResize, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize)
})
</script>

<style scoped>
#app-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* Desktop layout: main content shifts when sidecar opens */
.main-content {
  flex: 1;
  min-height: 0;
  transition: margin-right 0.3s ease;
}

#app-shell.sidecar-open .main-content {
  margin-right: var(--sidecar-width, 0px);
}

/* Mobile header */
.mobile-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-primary);
  position: sticky;
  top: 0;
  z-index: 50;
}

.mobile-menu-btn,
.mobile-theme-btn {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  color: var(--text-primary);
}

.mobile-menu-btn:hover,
.mobile-theme-btn:hover {
  background: var(--surface);
}

.mobile-title .logo {
  font-weight: 600;
  letter-spacing: 0.2px;
}

/* Mobile overlay */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 45;
}
</style>
