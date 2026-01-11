<template>
  <aside 
    class="chat-sidebar" 
    :class="[`persona-${selectedPersona.toLowerCase()}`, { 'sidebar-collapsed': isCollapsed }]"
    role="complementary"
    aria-label="Portfolio navigation and controls"
  >
    <!-- Top Brand / Persona Switcher -->
    <div class="sidebar-top">
      <div class="brand-section">
        <button 
          class="collapse-toggle" 
          @click="toggleCollapse" 
          :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          :aria-expanded="!isCollapsed"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path v-if="!isCollapsed" d="M15 18l-6-6 6-6"/>
            <path v-else d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        
        <div v-if="!isCollapsed" class="brand-content">
          <div class="profile-header">
            <img 
              :src="profilePhoto" 
              alt="Suleiman Msaba, Full Stack Developer in Dar es Salaam" 
              class="profile-pic" 
              loading="lazy"
            />
            <div>
              <h1 class="brand">Suleiman Msaba</h1>
              <p class="title">Full Stack Developer</p>
              <p class="location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Dar es Salaam, TZ
              </p>
            </div>
          </div>
          
          <div class="status-container" role="status" aria-live="polite">
            <div class="status-orb" :class="`status-${reasoningLevel}`" :title="`Reasoning level: ${reasoningLevel}`">
              <span class="sr-only">{{ reasoningStatusText }}</span>
            </div>
            <div class="memory-meter">
              <div 
                class="meter-fill" 
                :style="{ 
                  width: `${memoryUsage}%`,
                  transition: prefersReducedMotion ? 'none' : 'width 0.6s ease'
                }"
                :aria-valuenow="memoryUsage"
                :aria-valuemin="0"
                :aria-valuemax="100"
                role="progressbar"
              ></div>
              <span class="meter-label">Memory: {{ memoryUsage }}%</span>
            </div>
          </div>
          
          <div class="persona-selector-container">
            <label for="persona-selector" class="sr-only">Select AI persona</label>
            <select 
              id="persona-selector"
              v-model="selectedPersona" 
              class="persona-selector"
              @change="onPersonaChange"
              aria-describedby="persona-description"
            >
              <option v-for="p in personas" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>
            <p id="persona-description" class="sr-only">
              Changes the assistant's personality and visual theme
            </p>
          </div>
        </div>
        <div v-else class="brand-collapsed">
          <img 
            :src="profilePhoto" 
            alt="SM" 
            class="profile-pic-small" 
            loading="lazy"
          />
        </div>
      </div>
    </div>

    <!-- Navigation Links -->
    <nav 
      class="sidebar-nav" 
      v-if="!isCollapsed"
      role="navigation"
      aria-label="Main portfolio sections"
    >
      <button
        v-for="item in navItems"
        :key="item.id"
        :class="['nav-button', { active: activeItem === item.id }]"
        @click="selectItem(item)"
        @keydown.enter="selectItem(item)"
        @keydown.space.prevent="selectItem(item)"
        :aria-label="item.label"
        :aria-current="activeItem === item.id ? 'page' : null"
      >
        <component :is="item.icon" class="icon" aria-hidden="true" />
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="item.badge" class="nav-badge" aria-label="Notification">{{ item.badge }}</span>
      </button>
    </nav>
    <nav 
      class="sidebar-nav-collapsed" 
      v-else
      role="navigation"
      aria-label="Main portfolio sections"
    >
      <button
        v-for="item in navItems"
        :key="item.id"
        :class="['nav-button-collapsed', { active: activeItem === item.id }]"
        @click="selectItem(item)"
        @keydown.enter="selectItem(item)"
        @keydown.space.prevent="selectItem(item)"
        :aria-label="item.label"
      >
        <component :is="item.icon" class="icon" aria-hidden="true" />
      </button>
    </nav>

    <!-- Context-Aware Quick Actions -->
    <div 
      class="quick-actions" 
      v-if="!isCollapsed && showQuickActions"
      role="region"
      aria-label="Quick actions"
    >
      <h3 class="quick-actions-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v8M8 12h8"/>
        </svg>
        Quick Actions
      </h3>
      <div class="quick-buttons">
        <button 
          v-for="action in quickActions" 
          :key="action.id"
          class="quick-btn"
          @click="handleQuickAction(action)"
          @keydown.enter="handleQuickAction(action)"
          @keydown.space.prevent="handleQuickAction(action)"
        >
          {{ action.label }}
        </button>
      </div>
    </div>

    <!-- Local Events Section -->
    <div 
      class="local-events" 
      v-if="!isCollapsed && selectedPersona === 'local' && localEvents.length"
      role="region"
      aria-label="Local events in Dar es Salaam"
    >
      <h3 class="events-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        Dar es Salaam Events
      </h3>
      <div class="events-list">
        <div 
          v-for="event in localEvents.slice(0, 3)" 
          :key="event.id" 
          class="event-item"
          role="listitem"
        >
          <time class="event-date" :datetime="event.date">{{ formatDate(event.date) }}</time>
          <span class="event-title">{{ event.title }}</span>
          <button 
            class="event-action" 
            @click="viewEvent(event)"
            @keydown.enter="viewEvent(event)"
            @keydown.space.prevent="viewEvent(event)"
            :aria-label="`View details for ${event.title}`"
          >
            View
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Profile & Persona Menu -->
    <div class="mobile-profile-menu" v-if="isMobile && isCollapsed">
      <button 
        class="mobile-menu-toggle"
        @click="toggleMobileMenu"
        :aria-label="showMobileMenu ? 'Close mobile menu' : 'Open mobile menu'"
        :aria-expanded="showMobileMenu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path v-if="!showMobileMenu" d="M4 6h16M4 12h16M4 18h16"/>
          <path v-else d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      
      <transition name="mobile-menu">
        <div 
          v-if="showMobileMenu" 
          class="mobile-menu-dropdown"
          role="menu"
          @keydown.esc="closeMobileMenu"
        >
          <div class="mobile-persona-selector">
            <label for="mobile-persona-selector" class="mobile-menu-label">Persona:</label>
            <select 
              id="mobile-persona-selector"
              v-model="selectedPersona"
              class="persona-selector mobile"
              @change="onPersonaChange"
            >
              <option v-for="p in personas" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>
          </div>
          <div class="mobile-time-display">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {{ currentTime }}
          </div>
          <div class="mobile-status">
            <div class="status-orb" :class="`status-${reasoningLevel}`"></div>
            <span class="mobile-status-text">{{ reasoningStatusText }}</span>
          </div>
        </div>
      </transition>
    </div>

    <!-- Bottom Settings / Theme -->
    <div class="sidebar-bottom">
      <div class="time-display" v-if="!isCollapsed">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <time :datetime="currentTimeISO">{{ currentTime }}</time>
      </div>
      <ThemeToggle :theme="theme" @toggle-theme="$emit('toggle-theme')" />
      <button 
        v-if="!isCollapsed" 
        class="settings-btn" 
        @click="openSettings"
        @keydown.enter="openSettings"
        @keydown.space.prevent="openSettings"
        aria-label="Settings"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, onBeforeUnmount } from 'vue'
import { 
  Home, MessageSquare, Briefcase, Code, User, FileText, Mail, Calendar 
} from 'lucide-vue-next'
import ThemeToggle from './ThemeToggle.vue'

const props = defineProps({
  theme: {
    type: String,
    default: 'dark'
  }
})

const emit = defineEmits(['nav-select', 'toggle-theme', 'persona-change', 'quick-action'])

// State
const activeItem = ref('chat')
const isCollapsed = ref(false)
const selectedPersona = ref('default')
const reasoningLevel = ref('active')
const memoryUsage = ref(45)
const currentTime = ref('')
const currentTimeISO = ref('')
const localEvents = ref([])
const showMobileMenu = ref(false)
const prefersReducedMotion = ref(false)

// Media queries
const isMobile = ref(false)

// Profile photo
const profilePhoto = '/profile.jpg'

// Personas
const personas = [
  { id: 'default', name: 'Default', color: '#10a37f', greeting: 'Hello! How can I help?' },
  { id: 'creative', name: 'Creative', color: '#a855f7', greeting: 'Let\'s create something amazing!' },
  { id: 'executive', name: 'Executive', color: '#3b82f6', greeting: 'How can I assist with your goals?' },
  { id: 'nerd', name: 'Nerd', color: '#22c55e', greeting: 'Ready to dive deep into code!' },
  { id: 'local', name: 'Local', color: '#06b6d4', greeting: 'Habari! Ready to explore local opportunities?' }
]

// Computed properties
const navItems = computed(() => {
  const baseItems = [
    { id: 'home', label: 'Home', icon: Home, section: 'hero' },
    { id: 'chat', label: 'Chat', icon: MessageSquare, section: 'chat' },
    { id: 'projects', label: 'Projects', icon: Briefcase, section: 'projects', badge: '3' },
    { id: 'skills', label: 'Skills', icon: Code, section: 'skills' },
    { id: 'about', label: 'About', icon: User, section: 'about' },
    { id: 'resume', label: 'Resume', icon: FileText, section: 'resume' },
    { id: 'contact', label: 'Contact', icon: Mail, section: 'contact' }
  ]
  
  if (selectedPersona.value === 'local') {
    return [...baseItems, { id: 'events', label: 'Local Events', icon: Calendar, section: 'events', badge: '!' }]
  }
  
  return baseItems
})

const quickActions = computed(() => {
  const hour = new Date().getHours()
  const isNight = hour >= 22 || hour < 6
  
  const actions = [
    { id: 'view-projects', label: 'View Projects' },
    { id: 'download-resume', label: 'Download CV' },
    { id: 'schedule-call', label: 'Schedule Call' }
  ]
  
  if (selectedPersona.value === 'local') {
    actions.push({ id: 'local-jobs', label: 'Local Jobs' })
  }
  
  if (isNight && selectedPersona.value === 'nerd') {
    actions.push({ id: 'night-mode', label: 'Night Coding' })
  }
  
  return actions
})

const showQuickActions = computed(() => {
  return !isCollapsed.value && activeItem.value !== 'home'
})

const reasoningStatusText = computed(() => {
  const statusMap = {
    inactive: 'Assistant is inactive',
    active: 'Assistant is active and ready',
    thinking: 'Assistant is processing'
  }
  return statusMap[reasoningLevel.value] || 'Assistant status unknown'
})

// Time formatting
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-TZ', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  }) + ' EAT'
  currentTimeISO.value = now.toISOString()
  
  // Night mode detection
  const hour = now.getHours()
  if (hour >= 22 || hour < 6) {
    reasoningLevel.value = 'thinking'
  }
}

// Methods
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar-collapsed', isCollapsed.value)
}

const selectItem = (item) => {
  activeItem.value = item.id
  emit('nav-select', { id: item.id, section: item.section })
  
  // Update reasoning level
  reasoningLevel.value = 'thinking'
  setTimeout(() => {
    reasoningLevel.value = 'active'
  }, 1500)
}

const onPersonaChange = () => {
  const persona = personas.find(p => p.id === selectedPersona.value)
  if (persona) {
    // Update CSS custom properties on :root
    const root = document.documentElement
    root.style.setProperty('--persona-color', persona.color)
    
    // Convert hex to RGB for rgba usage
    const rgb = hexToRgb(persona.color)
    if (rgb) {
      root.style.setProperty('--persona-color-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`)
    }
  }
  
  localStorage.setItem('selected-persona', selectedPersona.value)
  emit('persona-change', selectedPersona.value)
  
  // Persona-specific greeting
  if (selectedPersona.value === 'local') {
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Habari za asubuhi!' : 
                    hour < 18 ? 'Habari za mchana!' : 
                    'Habari za jioni!'
    emit('quick-action', { type: 'greeting', message: greeting })
  }
}

const handleQuickAction = (action) => {
  emit('quick-action', action)
  
  reasoningLevel.value = 'thinking'
  setTimeout(() => {
    reasoningLevel.value = 'active'
    memoryUsage.value = Math.min(100, memoryUsage.value + 5)
  }, 1000)
}

const openSettings = () => {
  emit('nav-select', { id: 'settings', section: 'settings' })
}

const viewEvent = (event) => {
  emit('quick-action', { 
    id: 'view-event', 
    label: 'View Event',
    data: event 
  })
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-TZ', { 
    month: 'short', 
    day: 'numeric' 
  })
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const checkReducedMotion = () => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Simulate local events
const fetchLocalEvents = async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  localEvents.value = [
    { id: 1, title: 'Tech Meetup Dar', date: '2024-01-25', location: 'Dar Innovation Hub' },
    { id: 2, title: 'Vue.js Workshop', date: '2024-02-10', location: 'Buni Hub' },
    { id: 3, title: 'Startup Pitch Night', date: '2024-02-15', location: 'DTB Innovation Center' }
  ]
}

// Lifecycle
onMounted(() => {
  updateTime()
  const timeInterval = setInterval(updateTime, 60000)
  
  // Check mobile
  isMobile.value = window.matchMedia('(max-width: 768px)').matches
  
  // Check reduced motion preference
  checkReducedMotion()
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', checkReducedMotion)
  
  // Load saved state
  const savedPersona = localStorage.getItem('selected-persona')
  if (savedPersona) selectedPersona.value = savedPersona
  
  const savedCollapsed = localStorage.getItem('sidebar-collapsed')
  if (savedCollapsed) isCollapsed.value = JSON.parse(savedCollapsed)
  
  // Apply initial persona
  onPersonaChange()
  
  // Fetch events if local persona
  if (selectedPersona.value === 'local') {
    fetchLocalEvents()
  }
  
  // Listen for escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape' && showMobileMenu.value) {
      closeMobileMenu()
    }
  }
  document.addEventListener('keydown', handleEscape)
  
  // Cleanup
  onBeforeUnmount(() => {
    clearInterval(timeInterval)
    document.removeEventListener('keydown', handleEscape)
    window.matchMedia('(prefers-reduced-motion: reduce)').removeEventListener('change', checkReducedMotion)
  })
})

// Watch for persona changes
watch(selectedPersona, (newPersona) => {
  if (newPersona === 'local') {
    fetchLocalEvents()
  } else {
    localEvents.value = []
  }
})

// Watch for mobile menu changes
watch(showMobileMenu, (newValue) => {
  if (newValue) {
    // Focus first interactive element in mobile menu
    nextTick(() => {
      const firstElement = document.querySelector('#mobile-persona-selector')
      if (firstElement) firstElement.focus()
    })
  }
})
</script>

<style scoped>
/* CSS Variables for global theming - now properly scoped to component */
.chat-sidebar {
  --persona-color: #10a37f;
  --persona-color-rgb: 16, 163, 127;
  --sidebar-width: 320px;
  --bg-glass-rgb: 33, 33, 33;
  --border-glass-rgb: 255, 255, 255;
  --text-primary: #ffffff;
  --text-secondary: #8e8ea0;
  --text-tertiary: #6e6e80;
  
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(
    180deg,
    rgba(var(--bg-glass-rgb), 0.95) 0%,
    rgba(var(--bg-glass-rgb), 0.85) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-right: 1px solid rgba(var(--border-glass-rgb), 0.08);
  padding: 24px 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  transition: 
    transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  overflow-x: hidden;
  /* Performance optimization */
  will-change: transform, width;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.chat-sidebar.sidebar-collapsed {
  width: 80px;
  padding: 24px 8px;
  align-items: center;
}

/* Brand Section */
.brand-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.collapse-toggle {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
}

.collapse-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.profile-pic {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  border: 3px solid var(--persona-color);
  object-fit: cover;
  box-shadow: 0 8px 32px rgba(var(--persona-color-rgb), 0.2);
  /* Optimize for GPU */
  transform: translateZ(0);
}

.brand {
  font-family: 'Söhne', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  background: linear-gradient(135deg, var(--persona-color), #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}

.title {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-weight: 500;
}

.location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

/* Status Container */
.status-container {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.status-orb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: relative;
  /* Performance optimization */
  will-change: transform, box-shadow;
}

.status-orb::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.3;
  filter: blur(4px);
}

.status-inactive {
  background: #ef4444;
  animation: status-pulse 2s infinite;
}

.status-active {
  background: #22c55e;
  animation: status-glow 2s infinite;
}

.status-thinking {
  background: #3b82f6;
  animation: status-thinking 1.5s infinite;
}

.memory-meter {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  height: 8px;
  overflow: hidden;
  position: relative;
}

.meter-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--persona-color), #60a5fa);
  border-radius: 20px;
}

.meter-label {
  position: absolute;
  top: -20px;
  right: 0;
  font-size: 0.7rem;
  color: var(--text-tertiary);
}

/* Persona Selector */
.persona-selector-container {
  width: 100%;
}

.persona-selector {
  width: 100%;
  padding: 12px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238e8ea0' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
}

.persona-selector:hover {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: var(--persona-color);
}

.persona-selector:focus {
  outline: none;
  border-color: var(--persona-color);
  box-shadow: 0 0 0 2px rgba(var(--persona-color-rgb), 0.2);
}

/* Navigation */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 24px 0;
  flex: 1;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 0.95rem;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  position: relative;
  overflow: hidden;
  /* Performance */
  will-change: transform, background-color, border-color;
}

.nav-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(var(--persona-color-rgb), 0.1) 0%,
    rgba(var(--persona-color-rgb), 0.05) 100%
  );
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 16px;
}

.nav-button:hover::before {
  opacity: 1;
}

.nav-button:hover,
.nav-button.active {
  color: var(--text-primary);
  border-color: rgba(var(--persona-color-rgb), 0.3);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-button.active::before {
  opacity: 1;
}

.nav-label {
  flex: 1;
  font-weight: 500;
}

.nav-badge {
  background: var(--persona-color);
  color: white;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}

/* Collapsed Navigation */
.sidebar-nav-collapsed {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 32px 0;
  flex: 1;
}

.nav-button-collapsed {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-button-collapsed:hover,
.nav-button-collapsed.active {
  background: rgba(var(--persona-color-rgb), 0.1);
  color: var(--persona-color);
  border-color: rgba(var(--persona-color-rgb), 0.3);
}

/* Quick Actions */
.quick-actions {
  margin-top: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.quick-actions-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
  font-weight: 600;
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-btn {
  padding: 8px 12px;
  background: rgba(var(--persona-color-rgb), 0.1);
  border: 1px solid rgba(var(--persona-color-rgb), 0.2);
  color: var(--persona-color);
  border-radius: 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 80px;
}

.quick-btn:hover {
  background: rgba(var(--persona-color-rgb), 0.2);
  transform: translateY(-1px);
}

/* Local Events */
.local-events {
  margin-top: 16px;
  padding: 16px;
  background: rgba(var(--persona-color-rgb, 6, 182, 212), 0.05);
  border-radius: 20px;
  border: 1px solid rgba(var(--persona-color-rgb, 6, 182, 212), 0.1);
}

.events-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--persona-color, #06b6d4);
  margin-bottom: 12px;
  font-weight: 600;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  font-size: 0.8rem;
}

.event-date {
  background: var(--persona-color, #06b6d4);
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 600;
  min-width: 40px;
  text-align: center;
}

.event-title {
  flex: 1;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-action {
  background: transparent;
  border: 1px solid rgba(var(--persona-color-rgb, 6, 182, 212), 0.3);
  color: var(--persona-color, #06b6d4);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
}

.event-action:hover {
  background: rgba(var(--persona-color-rgb, 6, 182, 212), 0.1);
}

/* Mobile Profile Menu */
.mobile-profile-menu {
  position: relative;
  margin-top: auto;
  margin-bottom: 16px;
}

.mobile-menu-toggle {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.mobile-menu-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.mobile-menu-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 8px;
  background: rgba(var(--bg-glass-rgb), 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.mobile-persona-selector {
  margin-bottom: 16px;
}

.mobile-menu-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.persona-selector.mobile {
  width: 100%;
}

.mobile-time-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.mobile-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-status-text {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

/* Mobile Menu Transitions */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Bottom Section */
.sidebar-bottom {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.time-display {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.settings-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.settings-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

/* Collapsed States */
.brand-collapsed {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.profile-pic-small {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  border: 2px solid var(--persona-color);
  object-fit: cover;
}

/* Animations */
@keyframes status-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes status-glow {
  0%, 100% { 
    box-shadow: 0 0 5px #22c55e;
  }
  50% { 
    box-shadow: 0 0 20px #22c55e;
  }
}

@keyframes status-thinking {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Persona-specific overrides */
.chat-sidebar.persona-creative {
  --persona-color: #a855f7;
  --persona-color-rgb: 168, 85, 247;
}

.chat-sidebar.persona-executive {
  --persona-color: #3b82f6;
  --persona-color-rgb: 59, 130, 246;
}

.chat-sidebar.persona-nerd {
  --persona-color: #22c55e;
  --persona-color-rgb: 34, 197, 94;
}

.chat-sidebar.persona-local {
  --persona-color: #06b6d4;
  --persona-color-rgb: 6, 182, 212;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-sidebar {
    position: fixed;
    bottom: 0;
    top: auto;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    max-height: 80vh;
    border-right: none;
    border-top: 1px solid rgba(var(--border-glass-rgb), 0.08);
    transform: translateY(100%);
    padding: 16px;
  }
  
  .chat-sidebar:not(.sidebar-collapsed) {
    transform: translateY(0);
  }
  
  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding: 8px 0;
    margin: 16px 0;
    flex: 0;
  }
  
  .nav-button {
    flex-direction: column;
    min-width: 80px;
    text-align: center;
    padding: 12px 8px;
    gap: 8px;
  }
  
  .nav-label {
    font-size: 0.75rem;
    margin-top: 4px;
  }
  
  .quick-buttons {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 8px;
  }
  
  .quick-btn {
    min-width: 120px;
  }
  
  /* Hide sidebar-top content on mobile when not collapsed */
  .sidebar-top:not(.sidebar-collapsed) {
    display: block;
  }
  
  .sidebar-bottom {
    justify-content: space-between;
  }
  
  .time-display {
    display: none;
  }
  
  /* Mobile specific adjustments */
  .mobile-profile-menu {
    display: block;
  }
}

/* Focus styles for accessibility */
.nav-button:focus-visible,
.persona-selector:focus-visible,
.quick-btn:focus-visible,
.settings-btn:focus-visible,
.mobile-menu-toggle:focus-visible,
.event-action:focus-visible {
  outline: 2px solid var(--persona-color);
  outline-offset: 2px;
}

/* Scrollbar */
.chat-sidebar::-webkit-scrollbar {
  width: 6px;
}

.chat-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.chat-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.chat-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Reduce motion - override all animations */
@media (prefers-reduced-motion: reduce) {
  .chat-sidebar,
  .nav-button,
  .quick-btn,
  .settings-btn,
  .collapse-toggle,
  .mobile-menu-toggle,
  .event-action,
  .mobile-menu-enter-active,
  .mobile-menu-leave-active {
    transition: none !important;
  }
  
  .status-inactive,
  .status-active,
  .status-thinking,
  .nav-button:hover,
  .nav-button.active,
  .quick-btn:hover,
  .settings-btn:hover,
  .event-action:hover {
    animation: none !important;
    transform: none !important;
  }
  
  .meter-fill {
    transition: none !important;
  }
  
  /* Ensure no parallax or movement effects */
  .chat-sidebar {
    transform: none !important;
  }
}

/* Screen reader only utility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>