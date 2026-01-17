<template>
  <div
    id="app-shell"
    :class="{ 
      'chat-started': chatStarted, 
      'sidecar-open': sidecarOpen,
      'is-mobile': isMobile,
      'sidebar-collapsed': sidebarCollapsed
    }"
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

      <div class="mobile-title">
        <span class="logo">PortfolioGPT</span>
      </div>

      <button
        class="mobile-theme-btn"
        @click="toggleTheme"
        aria-label="Toggle theme"
      >
        <ThemeToggle :theme="theme" />
      </button>
    </header>

    <!-- ===================== LEFT SIDEBAR ===================== -->
    <ChatSidebar
      :theme="theme"
      :class="{ 'mobile-open': isMobile && mobileSidebarOpen }"
      @nav-select="handleNavSelect"
      @toggle-theme="toggleTheme"
      @toggle-collapse="handleSidebarCollapse"
    />

    <!-- ===================== MAIN CHAT AREA ===================== -->
    <main class="main-content">
      <ChatContainer
        ref="chatContainer"
        :messages="messages"
        :is-typing="isTyping"
        :is-centered="!chatStarted"
        @send-message="handleSendMessage"
      />
    </main>

    <!-- ===================== SIDE PANEL (SIDE CAR) ===================== -->
    <SidecarPanel
      v-if="sidecarOpen"
      :is-open="sidecarOpen"
      :current-persona="currentPersona"
      @close="closeSidecar"
      @project-view="handleProjectView"
      @contact-sent="handleContactSent"
      @width-change="handleSidecarWidthChange"
    />

    <!-- ===================== MOBILE OVERLAY ===================== -->
    <div
      v-if="isMobile && mobileSidebarOpen"
      class="mobile-overlay"
      @click="closeMobileSidebar"
    ></div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

import ChatContainer from './components/ChatContainer.vue'
import ChatSidebar from './components/ChatSidebar.vue'
import NavigationBar from './components/NavigationBar.vue'
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
 * Layout state
 */
const theme = ref('dark')
const sidecarOpen = ref(false)
const mobileSidebarOpen = ref(false)
const currentPersona = ref('default')

// Left sidebar (ChatGPT-style)
const sidebarCollapsed = ref(false)
const SIDEBAR_WIDTH = 200
const SIDEBAR_COLLAPSED_WIDTH = 56
const DESKTOP_NAVBAR_HEIGHT = 64

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const isMobile = computed(() => windowWidth.value < 768)

// Sidecar sizing: keep main content aligned with sidecar width (including resize)
const sidecarWidth = ref(0)
const DEFAULT_SIDECAR_WIDTH = 420

const appShellStyle = computed(() => {
  const widthPx = sidecarOpen.value ? `${Math.max(0, sidecarWidth.value)}px` : '0px'
  const sidebarPx = isMobile.value
    ? '0px'
    : `${sidebarCollapsed.value ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH}px`
  const desktopTopOffsetPx = isMobile.value ? '0px' : `${DESKTOP_NAVBAR_HEIGHT}px`
  return {
    '--sidecar-width': widthPx,
    '--sidebar-width': sidebarPx,
    '--desktop-top-offset': desktopTopOffsetPx
  }
})

/**
 * Chat state
 */
const messages = ref([])
const isTyping = ref(false)
const chatStarted = computed(() => messages.value.length > 0)

const chatContainer = ref(null)

function createMessage({ isUser, text }) {
  return {
    id: crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    isUser,
    text
  }
}

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
 * Mobile sidebar
 */
function toggleMobileSidebar() {
  mobileSidebarOpen.value = !mobileSidebarOpen.value
}

function closeMobileSidebar() {
  mobileSidebarOpen.value = false
}

function handleSidebarCollapse(collapsed) {
  sidebarCollapsed.value = Boolean(collapsed)
}

function handleNavSelect(item) {
  // Supports multiple shapes:
  // - ChatSidebar emits: { id, section }
  // - Legacy objects: { label, query, persona }
  // - Strings (label)

  const id = item && typeof item === 'object' ? item.id : null
  const label = typeof item === 'string' ? item : item?.label
  const query = typeof item === 'string' ? null : item?.query

  if (item?.persona) currentPersona.value = item.persona

  if (isMobile.value) closeMobileSidebar()

  // ChatSidebar path
  if (id) {
    const mappedById = {
      projects: 'Tell me about your projects',
      skills: 'What technologies do you use?',
      about: 'Tell me about yourself',
      contact: 'How can I contact you?',
      resume: 'Where can I download your CV?'
    }
    const text = mappedById[id]
    if (text) handleSendMessage({ text })
    return
  }

  // Legacy path
  if (query) {
    handleSendMessage({ text: query })
    return
  }

  if (!label) return

  const mapped = {
    Projects: 'Tell me about your projects',
    Skills: 'What technologies do you use?',
    Experience: 'Tell me about your experience',
    About: 'Tell me about yourself',
    Contact: 'How can I contact you?',
    CV: 'Where can I download your CV?'
  }

  handleSendMessage({ text: mapped[label] || `Tell me about ${label}` })
}

/**
 * Sidecar
 */
function handleResearchClick() {
  // In this UI, “Research” functions as a context panel toggle.
  toggleSidecar()
}

function toggleSidecar() {
  sidecarOpen.value = !sidecarOpen.value

  if (sidecarOpen.value) {
    const savedWidth = parseInt(localStorage.getItem('sidecar-width') || '', 10)
    sidecarWidth.value = Number.isFinite(savedWidth) ? savedWidth : DEFAULT_SIDECAR_WIDTH
  } else {
    sidecarWidth.value = 0
  }
}

function closeSidecar() {
  sidecarOpen.value = false
  sidecarWidth.value = 0
}

function handleSidecarWidthChange(newWidth) {
  const width = Number(newWidth)
  if (!Number.isFinite(width)) return
  sidecarWidth.value = Math.max(0, Math.min(800, width))
}

function handleProjectView(project) {
  if (!project?.name) return
  const text = formatProjectDetails(project)
  messages.value.push(createMessage({ isUser: false, text }))
}

function handleContactSent(payload) {
  const name = payload?.name ? `, ${payload.name}` : ''
  messages.value.push(
    createMessage({
      isUser: false,
      text: `Thanks${name}. Your message has been received. If you prefer email, reach me at **${contactInfo.email}**.`
    })
  )
}

/**
 * Chat send
 */
async function handleSendMessage(payload) {
  const text = (payload?.text || '').trim()
  if (!text) return

  messages.value.push(createMessage({ isUser: true, text }))
  isTyping.value = true

  try {
    const response = await generateResponse(text)
    messages.value.push(createMessage({ isUser: false, text: response }))
  } catch (err) {
    console.error(err)
    messages.value.push(
      createMessage({
        isUser: false,
        text: "Sorry — something went wrong while generating a response. Please try again."
      })
    )
  } finally {
    isTyping.value = false
  }
}

/**
 * Portfolio-aware response generator
 */
async function generateResponse(query) {
  const q = String(query || '').toLowerCase()

  if (q.includes('project') || q.includes('portfolio') || q.includes('work')) return formatProjectsSummary(projects)
  if (q.includes('skill') || q.includes('technology') || q.includes('stack') || q.includes('tech')) return formatSkillsSummary(skills)
  if (q.includes('experience') || q.includes('timeline') || q.includes('career') || q.includes('work history')) return formatTimelineSummary(timeline)
  if (q.includes('about') || q.includes('who are you') || q.includes('yourself') || q.includes('bio')) return formatBio(bio)
  if (q.includes('cert') || q.includes('achievement') || q.includes('award')) return formatAchievements(achievements)
  if (q.includes('cv') || q.includes('resume')) return `You can download my CV here: **${cvLink}**.`
  if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('reach')) return formatContact(contactInfo)
  if (q.includes('faq') || q.includes('freelance') || q.includes('available') || q.includes('process')) return formatFAQ(faq)

  return (
    "I can help you with:\n\n" +
    "• **Projects** — portfolio work and case studies\n" +
    "• **Skills** — technologies and proficiency\n" +
    "• **Experience** — timeline and highlights\n" +
    "• **About** — background and focus\n" +
    "• **Contact** — how to reach me\n\n" +
    "Try: *Tell me about your projects* or *What technologies do you use?*"
  )
}

/**
 * Formatting helpers (Markdown)
 */
function formatProjectsSummary(list) {
  if (!Array.isArray(list) || list.length === 0) return 'Projects are not available yet.'

  const lines = list.map((p, idx) => {
    const stack = Array.isArray(p.techStack) ? p.techStack.join(', ') : '—'
    const status = p.status ? p.status.toUpperCase() : '—'
    const year = p.year ? `${p.year}` : ''

    return (
      `${idx + 1}. **${p.name}** ${year ? `(${year})` : ''}\n` +
      `   - Status: **${status}**\n` +
      `   - Stack: ${stack}\n` +
      `   - ${p.description || ''}`
    )
  })

  return `Here are a few of my key projects:\n\n${lines.join('\n\n')}\n\nIf you want, tell me which project to open and I will summarize the features and technical decisions.`
}

function formatProjectDetails(p) {
  const stack = Array.isArray(p.techStack) ? p.techStack.join(', ') : '—'
  const features = Array.isArray(p.features) ? p.features.map(f => `- ${f}`).join('\n') : ''
  const link = p.link && p.link !== '#' ? `\n\nLink: ${p.link}` : ''

  return (
    `**${p.name}**\n\n` +
    `${p.description || ''}\n\n` +
    `**Tech stack:** ${stack}\n` +
    (features ? `\n**Key features:**\n${features}` : '') +
    link
  )
}

function formatSkillsSummary(categories) {
  if (!Array.isArray(categories) || categories.length === 0) return 'Skills are not available yet.'

  const lines = categories
    .map(cat => {
      const items = Array.isArray(cat.items) ? cat.items : []
      const skillsLine = items.map(i => `${i.name} (${i.level})`).join(', ')
      return `**${cat.category}:** ${skillsLine || '—'}`
    })
    .filter(Boolean)

  return `Here is my skills overview:\n\n${lines.join('\n')}\n\nIf you are hiring for a specific role, share the job description and I will map my skills to it.`
}

function formatTimelineSummary(items) {
  if (!Array.isArray(items) || items.length === 0) return 'Experience information is not available yet.'

  const lines = items.map((e) => {
    const year = e.year ? `**${e.year}**` : ''
    const role = e.role ? ` — ${e.role}` : ''
    const company = e.company ? ` @ ${e.company}` : ''
    const duration = e.duration ? ` (${e.duration})` : ''
    const highlights = Array.isArray(e.highlights) ? e.highlights.map(h => `   - ${h}`).join('\n') : ''

    return (
      `${year}${role}${company}${duration}\n` +
      `${e.description || ''}` +
      (highlights ? `\n${highlights}` : '')
    )
  })

  return `Here is my timeline:\n\n${lines.join('\n\n')}`
}

function formatBio(b) {
  if (!b) return 'Bio is not available yet.'
  const tagline = b.tagline ? `\n\n_${b.tagline}_` : ''
  return `${b.long || b.short || ''}${tagline}`
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

  if (typeof window !== 'undefined') {
    handleWindowResize()
  }

  try {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed')
    if (savedCollapsed !== null) sidebarCollapsed.value = JSON.parse(savedCollapsed)
  } catch {
    // Ignore malformed localStorage
  }

  sidecarWidth.value = 0

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

.main-content {
  flex: 1;
  min-height: 0;
  transition: margin-right 0.3s ease, margin-left 0.2s ease, padding-top 0.2s ease;
}

/* Desktop: reserve space for the fixed left sidebar and top navbar */
#app-shell:not(.is-mobile) .main-content {
  margin-left: var(--sidebar-width, 200px);
  padding-top: var(--desktop-top-offset, 64px);
}

/* Desktop: push the sidebar below the fixed navbar */
#app-shell:not(.is-mobile) :deep(.chat-sidebar) {
  top: var(--desktop-top-offset, 64px) !important;
  height: calc(100vh - var(--desktop-top-offset, 64px)) !important;
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