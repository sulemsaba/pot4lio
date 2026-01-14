<template>
  <!-- External "See Me" button that controls panel visibility -->
  <button
    v-if="!externalIsOpen"
    class="see-me-button"
    @click="openPanel"
    :aria-label="isOpen ? 'Hide portfolio details' : 'Show portfolio details'"
    :aria-expanded="isOpen"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
    <span>See Me</span>
  </button>

  <!-- Side panel with controlled visibility -->
  <aside
    v-show="isOpen"
    ref="panelRef"
    class="sidecar-panel"
    :class="{ 
      'sidecar-open': isOpen, 
      'sidecar-collapsed': isCollapsed,
      [`persona-${currentPersona}`]: currentPersona 
    }"
    :style="{ 
      width: isCollapsed ? '60px' : panelWidth + 'px',
      transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
    }"
    role="complementary"
    aria-label="Additional portfolio information"
  >
    <!-- Resize handle -->
    <div
      v-if="!isCollapsed"
      class="resize-handle"
      role="separator"
      aria-label="Resize panel"
      tabindex="0"
      @mousedown="startResize"
      @touchstart.passive="startResize"
      @keydown.enter="toggleResize"
      @keydown.space.prevent="toggleResize"
      :aria-valuenow="panelWidth"
      aria-valuemin="320"
      aria-valuemax="600"
      ref="resizeHandle"
    >
      <div class="handle-line"></div>
      <div class="handle-line"></div>
      <div class="handle-line"></div>
    </div>

    <!-- Panel Toggle Button (when collapsed) -->
    <button
      v-if="isCollapsed"
      class="panel-toggle"
      @click="togglePanel"
      :aria-label="isOpen ? 'Close side panel' : 'Open side panel'"
      :aria-expanded="isOpen"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path v-if="isOpen" d="M6 18L18 6M6 6l12 12"/>
        <path v-else d="M9 18l6-6-6-6"/>
      </svg>
    </button>

    <!-- Panel Content -->
    <div v-if="!isCollapsed" class="sidecar-content">
      <!-- Panel Header with Tabs -->
      <div class="panel-header">
        <h2 class="panel-title">Portfolio Details</h2>
        <button 
          class="close-panel" 
          @click="closePanel"
          aria-label="Close side panel"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Tabs Navigation -->
      <div class="tabs-container" role="tablist" aria-label="Portfolio sections">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :id="`${tab.id}-tab`"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
          @keydown="handleTabKeydown"
          :aria-selected="activeTab === tab.id"
          :aria-controls="`tab-${tab.id}`"
          role="tab"
          tabindex="0"
        >
          <component :is="tab.icon" class="tab-icon" aria-hidden="true" />
          <span class="tab-label">{{ tab.label }}</span>
          <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tabs-content">
        <!-- Projects Tab -->
        <section
          v-show="activeTab === 'projects'"
          id="tab-projects"
          class="tab-panel"
          role="tabpanel"
          :aria-labelledby="'projects-tab'"
          tabindex="0"
        >
          <div class="section-header">
            <h3>Featured Projects</h3>
            <p class="section-subtitle">Hand-picked showcase of my best work</p>
          </div>
          
          <div class="projects-grid">
            <ProjectCard
              v-for="project in projects"
              :key="project.id"
              :project="project"
              @view-project="viewProject"
            />
          </div>
        </section>

        <!-- Skills Tab -->
        <section
          v-show="activeTab === 'skills'"
          id="tab-skills"
          class="tab-panel"
          role="tabpanel"
          :aria-labelledby="'skills-tab'"
          tabindex="0"
        >
          <div class="section-header">
            <h3>Skills & Technologies</h3>
            <p class="section-subtitle">Tools and technologies I work with</p>
          </div>
          
          <div class="skills-container">
            <div 
              v-for="category in skillCategories" 
              :key="category.name"
              class="skill-category"
            >
              <h4 class="category-title">{{ category.name }}</h4>
              <div class="skills-grid">
                <div
                  v-for="skill in category.skills"
                  :key="skill.name"
                  class="skill-item"
                  :style="{ '--skill-level': skill.level }"
                >
                  <div class="skill-header">
                    <span class="skill-name">{{ skill.name }}</span>
                    <span class="skill-level">{{ skill.level }}%</span>
                  </div>
                  <div class="skill-bar">
                    <div 
                      class="skill-fill"
                      :style="{ width: skill.level + '%' }"
                      role="progressbar"
                      :aria-valuenow="skill.level"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <div class="skill-tags">
                    <span 
                      v-for="tag in skill.tags" 
                      :key="tag"
                      class="skill-tag"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Timeline Tab -->
        <section
          v-show="activeTab === 'timeline'"
          id="tab-timeline"
          class="tab-panel"
          role="tabpanel"
          :aria-labelledby="'timeline-tab'"
          tabindex="0"
        >
          <div class="section-header">
            <h3>Career Timeline</h3>
            <p class="section-subtitle">My professional journey</p>
          </div>
          
          <div class="timeline">
            <div
              v-for="(event, index) in timeline"
              :key="event.id"
              class="timeline-event"
            >
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="event-header">
                  <time class="event-date" :datetime="event.date">{{ formatDate(event.date) }}</time>
                  <span class="event-badge" :style="{ backgroundColor: event.color }">
                    {{ event.type }}
                  </span>
                </div>
                <h4 class="event-title">{{ event.title }}</h4>
                <p class="event-description">{{ event.description }}</p>
                <div v-if="event.tags" class="event-tags">
                  <span 
                    v-for="tag in event.tags" 
                    :key="tag"
                    class="event-tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Contact Tab -->
        <section
          v-show="activeTab === 'contact'"
          id="tab-contact"
          class="tab-panel"
          role="tabpanel"
          :aria-labelledby="'contact-tab'"
          tabindex="0"
        >
          <div class="section-header">
            <h3>Get In Touch</h3>
            <p class="section-subtitle">Let's work together</p>
          </div>
          
          <form @submit.prevent="sendContact" class="contact-form">
            <div class="form-row">
              <div class="form-group">
                <label for="contact-name">
                  <span class="label-text">Name</span>
                  <input
                    id="contact-name"
                    v-model="contact.name"
                    type="text"
                    required
                    placeholder="Your name"
                    aria-required="true"
                  />
                </label>
              </div>
              
              <div class="form-group">
                <label for="contact-email">
                  <span class="label-text">Email</span>
                  <input
                    id="contact-email"
                    v-model="contact.email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    aria-required="true"
                  />
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label for="contact-subject">
                <span class="label-text">Subject</span>
                <input
                  id="contact-subject"
                  v-model="contact.subject"
                  type="text"
                  placeholder="Project inquiry"
                  aria-required="true"
                />
              </label>
            </div>
            
            <div class="form-group">
              <label for="contact-message">
                <span class="label-text">Message</span>
                <textarea
                  id="contact-message"
                  v-model="contact.message"
                  rows="4"
                  required
                  placeholder="Tell me about your project..."
                  aria-required="true"
                ></textarea>
              </label>
            </div>
            
            <div class="form-footer">
              <div class="form-hint">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                I typically respond within 24 hours
              </div>
              
              <button
                type="submit"
                class="submit-button"
                :disabled="!isFormValid || isSubmitting"
                :aria-busy="isSubmitting"
              >
                <span v-if="!isSubmitting">Send Message</span>
                <span v-else class="loading">
                  <span class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </span>
              </button>
            </div>
          </form>
          
          <div v-if="showSuccessMessage" class="success-message">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <div>
              <strong>Message sent successfully!</strong>
              <p>I'll get back to you soon.</p>
            </div>
          </div>
          
          <div class="contact-info">
            <h4>Other Ways to Connect</h4>
            <div class="contact-links">
              <a 
                v-for="link in contactLinks" 
                :key="link.id"
                :href="link.url" 
                target="_blank" 
                rel="noopener noreferrer"
                class="contact-link"
              >
                <component :is="link.icon" class="contact-icon" aria-hidden="true" />
                <span class="contact-label">{{ link.label }}</span>
              </a>
            </div>
          </div>
        </section>

        <!-- CV Tab -->
        <section
          v-show="activeTab === 'cv'"
          id="tab-cv"
          class="tab-panel"
          role="tabpanel"
          :aria-labelledby="'cv-tab'"
          tabindex="0"
        >
          <div class="section-header">
            <h3>Resume & CV</h3>
            <p class="section-subtitle">Download or view my professional profile</p>
          </div>
          
          <div class="cv-preview">
            <div class="cv-card">
              <div class="cv-header">
                <h4>Suleiman Msaba</h4>
                <p>Full Stack Developer</p>
              </div>
              
              <div class="cv-stats">
                <div class="stat">
                  <span class="stat-number">{{ cvStats.experience }}+</span>
                  <span class="stat-label">Years</span>
                </div>
                <div class="stat">
                  <span class="stat-number">{{ cvStats.projects }}+</span>
                  <span class="stat-label">Projects</span>
                </div>
                <div class="stat">
                  <span class="stat-number">{{ cvStats.clients }}+</span>
                  <span class="stat-label">Clients</span>
                </div>
              </div>
              
              <div class="cv-actions">
                <a 
                  :href="cvLink" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="cv-button primary"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download CV (PDF)
                </a>
                <button 
                  class="cv-button secondary"
                  @click="printCV"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 6 2 18 2 18 9"/>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                    <rect x="6" y="14" width="12" height="8"/>
                  </svg>
                  Print
                </button>
              </div>
            </div>
            
            <div class="cv-sections">
              <div class="cv-section">
                <h5>Education</h5>
                <ul>
                  <li v-for="edu in education" :key="edu.id">
                    <strong>{{ edu.degree }}</strong> at {{ edu.institution }}
                    <br>
                    <small>{{ edu.period }}</small>
                  </li>
                </ul>
              </div>
              
              <div class="cv-section">
                <h5>Certifications</h5>
                <ul>
                  <li v-for="cert in certifications" :key="cert.id">
                    {{ cert.name }} ({{ cert.issuer }})
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { 
  Briefcase, 
  Code, 
  Clock, 
  Mail, 
  FileText,
  Github,
  Linkedin,
  Twitter,
  Globe
} from 'lucide-vue-next'
import ProjectCard from './ProjectCard.vue' // Extracted component

const emit = defineEmits(['close', 'project-view', 'contact-sent', 'update:isOpen'])

const props = defineProps({
  externalIsOpen: { // Renamed prop to avoid conflict
    type: Boolean,
    default: false
  },
  currentPersona: {
    type: String,
    default: 'default'
  }
})

// Internal state (no longer controlled by prop)
const isOpen = ref(props.externalIsOpen)
const panelWidth = ref(420)
const isResizing = ref(false)
const isCollapsed = ref(false)
const activeTab = ref('projects')
const isSubmitting = ref(false)
const showSuccessMessage = ref(false)

// Contact form with safe reset
const contact = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

// Tabs configuration with proper IDs
const tabs = [
  { id: 'projects', label: 'Projects', icon: Briefcase, badge: '4' },
  { id: 'skills', label: 'Skills', icon: Code },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'contact', label: 'Contact', icon: Mail },
  { id: 'cv', label: 'CV', icon: FileText }
]

// Data structures (in production, these would come from API/store)
const projects = ref([...])
const skillCategories = ref([...])
const timeline = ref([...])
const contactLinks = ref([...])
const cvStats = ref({...})
const education = ref([...])
const certifications = ref([...])

// Computed
const isFormValid = computed(() => {
  return contact.value.name?.trim() && 
         contact.value.email?.trim() && 
         contact.value.message?.trim() &&
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.value.email)
})

// Refs for DOM elements
const panelRef = ref(null)
const resizeHandle = ref(null)

// Methods
const openPanel = () => {
  isOpen.value = true
  emit('update:isOpen', true)
  nextTick(() => {
    // Focus first focusable element
    const firstFocusable = panelRef.value?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    firstFocusable?.focus()
  })
}

const closePanel = () => {
  isOpen.value = false
  isCollapsed.value = false
  emit('update:isOpen', false)
  emit('close')
}

const togglePanel = () => {
  isCollapsed.value = !isCollapsed.value
  if (isCollapsed.value) {
    emit('update:isOpen', false)
  } else {
    emit('update:isOpen', true)
  }
}

// Fixed resize handlers with proper cleanup
const startResize = () => {
  isResizing.value = true
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'ew-resize'
  
  // Add listeners only when resizing
  window.addEventListener('mousemove', resizePanel)
  window.addEventListener('mouseup', stopResize)
  window.addEventListener('touchmove', resizePanel, { passive: true })
  window.addEventListener('touchend', stopResize)
}

const stopResize = () => {
  isResizing.value = false
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
  
  // Remove listeners
  window.removeEventListener('mousemove', resizePanel)
  window.removeEventListener('mouseup', stopResize)
  window.removeEventListener('touchmove', resizePanel)
  window.removeEventListener('touchend', stopResize)
}

const resizePanel = (e) => {
  if (!isResizing.value) return
  
  const clientX = e.clientX || e.touches?.[0]?.clientX
  if (!clientX) return

  const newWidth = window.innerWidth - clientX
  panelWidth.value = Math.max(320, Math.min(600, newWidth))
  
  // Update ARIA value
  if (resizeHandle.value) {
    resizeHandle.value.setAttribute('aria-valuenow', panelWidth.value)
  }
}

const toggleResize = () => {
  // Only toggle between min/max if needed
  panelWidth.value = panelWidth.value <= 400 ? 600 : 320
  if (resizeHandle.value) {
    resizeHandle.value.setAttribute('aria-valuenow', panelWidth.value)
  }
}

// Fixed keyboard navigation for tabs
const handleTabKeydown = (event) => {
  const currentIndex = tabs.findIndex(tab => tab.id === activeTab.value)
  let nextIndex = currentIndex

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
      break
    case 'ArrowRight':
      event.preventDefault()
      nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
      break
    case 'Home':
      event.preventDefault()
      nextIndex = 0
      break
    case 'End':
      event.preventDefault()
      nextIndex = tabs.length - 1
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      activeTab.value = tabs[currentIndex].id
      return
    default:
      return
  }

  activeTab.value = tabs[nextIndex].id
  
  // Focus the new tab
  nextTick(() => {
    document.getElementById(`${tabs[nextIndex].id}-tab`)?.focus()
  })
}

const viewProject = (project) => {
  emit('project-view', project)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  })
}

const sendContact = async () => {
  if (!isFormValid.value || isSubmitting.value) return
  
  isSubmitting.value = true
  showSuccessMessage.value = false

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    emit('contact-sent', { ...contact.value })
    
    // Safe form reset (preserves reactivity)
    Object.assign(contact.value, {
      name: '',
      email: '',
      subject: '',
      message: ''
    })
    
    showSuccessMessage.value = true
    
    // Auto-hide success message
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 5000)
  } catch (error) {
    console.error('Failed to send message:', error)
    // In production, show error toast
  } finally {
    isSubmitting.value = false
  }
}

const printCV = () => {
  if (typeof window !== 'undefined') {
    window.print()
  }
}

// Lifecycle
onMounted(() => {
  // Safely load saved width
  if (typeof window !== 'undefined') {
    const savedWidth = localStorage.getItem('sidecar-width')
    if (savedWidth) {
      const width = parseInt(savedWidth, 10)
      if (!isNaN(width) && width >= 320 && width <= 600) {
        panelWidth.value = width
      }
    }
    
    // Initialize ARIA values
    if (resizeHandle.value) {
      resizeHandle.value.setAttribute('aria-valuenow', panelWidth.value)
    }
  }
})

onUnmounted(() => {
  // Cleanup any remaining listeners
  stopResize()
})

// Watch for width changes to save
watch(panelWidth, (newWidth) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sidecar-width', newWidth.toString())
  }
})

// Sync with external prop
watch(() => props.externalIsOpen, (newVal) => {
  isOpen.value = newVal
})
</script>

<style scoped>
/* "See Me" button */
.see-me-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, var(--persona-color, #10a37f), #8b5cf6);
  color: white;
  border: none;
  border-radius: 24px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 9999;
}

.see-me-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
}

.see-me-button:active {
  transform: translateY(0);
}

.see-me-button svg {
  width: 20px;
  height: 20px;
}

/* Base panel styles */
.sidecar-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  background: linear-gradient(
    180deg,
    rgba(var(--bg-glass-rgb, 33, 33, 33), 0.98) 0%,
    rgba(var(--bg-glass-rgb, 33, 33, 33), 0.92) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-left: 1px solid rgba(var(--border-glass-rgb, 255, 255, 255), 0.12);
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
  transition: 
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(100%);
  will-change: transform, width;
}

.sidecar-open {
  transform: translateX(0);
}

/* Resize Handle */
.resize-handle {
  position: absolute;
  left: -8px;
  width: 16px;
  height: 100%;
  cursor: ew-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transition: background-color 0.2s;
  z-index: 10;
}

.resize-handle:hover {
  background: rgba(var(--persona-color-rgb, 16, 163, 127), 0.15);
}

.resize-handle:focus-visible {
  outline: 2px solid var(--persona-color, #10a37f);
  outline-offset: -2px;
  background: rgba(var(--persona-color-rgb, 16, 163, 127), 0.2);
}

.handle-line {
  width: 3px;
  height: 24px;
  background: rgba(255, 255, 255, 0.25);
  margin: 3px 0;
  border-radius: 1.5px;
  transition: background-color 0.2s;
}

.resize-handle:hover .handle-line {
  background: rgba(255, 255, 255, 0.4);
}

/* Panel Toggle (Collapsed State) */
.panel-toggle {
  width: 100%;
  height: 60px;
  background: rgba(255, 255, 255, 0.07);
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.panel-toggle:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--text-primary);
}

/* Success message */
.success-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  margin-bottom: 20px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 12px;
  animation: slideIn 0.3s ease;
}

.success-message svg {
  flex-shrink: 0;
  color: #22c55e;
  margin-top: 2px;
}

.success-message strong {
  display: block;
  color: #22c55e;
  font-weight: 600;
  margin-bottom: 4px;
}

.success-message p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Panel Header */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
  font-size: 1.375rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--persona-color, #10a37f), #ffffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.01em;
}

.close-panel {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 10px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-panel:hover {
  background: rgba(255, 255, 255, 0.15);
  color: var(--text-primary);
  transform: rotate(90deg);
}

.close-panel:focus-visible {
  outline: 2px solid var(--persona-color, #10a37f);
  outline-offset: 2px;
}

/* Tabs */
.tabs-container {
  display: flex;
  gap: 2px;
  padding: 0 20px;
  margin: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
  scrollbar-width: none;
}

.tabs-container::-webkit-scrollbar {
  display: none;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;
  position: relative;
  flex-shrink: 0;
}

.tab-button:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.tab-button:focus-visible {
  outline: 2px solid var(--persona-color, #10a37f);
  outline-offset: -2px;
  border-radius: 8px 8px 0 0;
}

.tab-button.active {
  color: var(--persona-color, #10a37f);
  border-bottom-color: var(--persona-color, #10a37f);
  background: rgba(var(--persona-color-rgb, 16, 163, 127), 0.05);
}

.tab-icon {
  width: 20px;
  height: 20px;
}

.tab-badge {
  background: var(--persona-color, #10a37f);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

/* Tab Content */
.tabs-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 24px 24px;
}

.tab-panel {
  animation: fadeIn 0.25s ease-out;
  padding-top: 24px;
}

@keyframes fadeIn {
  from { 
    opacity: 0;
    transform: translateY(8px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Section Headers */
.section-header {
  margin-bottom: 32px;
}

.section-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.section-subtitle {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Skills (updated progress bars) */
.skills-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.category-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.skills-grid {
  display: grid;
  gap: 20px;
}

.skill-item {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 20px;
  transition: all 0.2s;
}

.skill-item:hover {
  border-color: rgba(var(--persona-color-rgb, 16, 163, 127), 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.skill-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.skill-level {
  font-size: 0.85rem;
  color: var(--persona-color, #10a37f);
  font-weight: 700;
  background: rgba(var(--persona-color-rgb, 16, 163, 127), 0.1);
  padding: 4px 10px;
  border-radius: 20px;
}

.skill-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
  position: relative;
}

.skill-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--persona-color, #10a37f),
    color-mix(in srgb, var(--persona-color, #10a37f) 70%, transparent)
  );
  border-radius: 4px;
  transition: width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.skill-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s;
}

.skill-tag:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  transform: translateY(-1px);
}

/* Timeline (removed left/right classes) */
.timeline {
  position: relative;
  padding-left: 28px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--persona-color, #10a37f),
    transparent
  );
  opacity: 0.5;
}

.timeline-event {
  position: relative;
  margin-bottom: 32px;
}

.timeline-dot {
  position: absolute;
  left: -30px;
  top: 4px;
  width: 18px;
  height: 18px;
  background: var(--persona-color, #10a37f);
  border-radius: 50%;
  border: 4px solid var(--bg-primary, #202123);
  box-shadow: 0 0 0 2px rgba(var(--persona-color-rgb, 16, 163, 127), 0.3);
  z-index: 1;
}

.timeline-content {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 20px;
  transition: all 0.3s;
}

.timeline-content:hover {
  border-color: rgba(var(--persona-color-rgb, 16, 163, 127), 0.3);
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.event-date {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--persona-color, #10a37f);
  background: rgba(var(--persona-color-rgb, 16, 163, 127), 0.1);
  padding: 4px 12px;
  border-radius: 20px;
}

.event-badge {
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.event-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--text-primary);
  line-height: 1.3;
}

.event-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
  line-height: 1.6;
}

.event-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.event-tag {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Contact Form */
.contact-form {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 24px;
  margin-bottom: 32px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 24px;
}

.label-text {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

input,
textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 14px 18px;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--persona-color, #10a37f);
  box-shadow: 
    0 0 0 1px var(--persona-color, #10a37f),
    0 0 0 4px rgba(var(--persona-color-rgb, 16, 163, 127), 0.1);
  background: rgba(255, 255, 255, 0.08);
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  flex: 1;
}

.form-hint svg {
  flex-shrink: 0;
  color: var(--persona-color, #10a37f);
}

.submit-button {
  padding: 14px 32px;
  background: linear-gradient(
    135deg,
    var(--persona-color, #10a37f),
    color-mix(in srgb, var(--persona-color, #10a37f) 70%, #8b5cf6)
  );
  border: none;
  border-radius: 14px;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 25px rgba(var(--persona-color-rgb, 16, 163, 127), 0.3),
    0 0 0 1px rgba(var(--persona-color-rgb, 16, 163, 127), 0.2);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.loading-dots {
  display: flex;
  gap: 6px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { 
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% { 
    transform: scale(1);
    opacity: 1;
  }
}

/* Contact Info */
.contact-info {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 24px;
}

.contact-info h4 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.contact-links {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.contact-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s;
}

.contact-link:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(var(--persona-color-rgb, 16, 163, 127), 0.3);
  color: var(--text-primary);
  transform: translateX(6px);
}

.contact-link:focus-visible {
  outline: 2px solid var(--persona-color, #10a37f);
  outline-offset: 2px;
}

.contact-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.contact-label {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 500;
}

/* CV Preview */
.cv-preview {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.cv-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.02) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 32px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cv-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--persona-color, #10a37f),
    color-mix(in srgb, var(--persona-color, #10a37f) 50%, transparent)
  );
}

.cv-header h4 {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 6px;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.cv-header p {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 28px;
  opacity: 0.9;
}

.cv-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 32px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--persona-color, #10a37f);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cv-actions {
  display: flex;
  gap: 16px;
}

.cv-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  border: none;
  border-radius: 14px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s;
}

.cv-button.primary {
  background: linear-gradient(
    135deg,
    var(--persona-color, #10a37f),
    color-mix(in srgb, var(--persona-color, #10a37f) 70%, #3b82f6)
  );
  color: white;
}

.cv-button.secondary {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
}

.cv-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.cv-button:active {
  transform: translateY(0);
}

.cv-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.cv-section {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 24px;
}

.cv-section h5 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 18px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
}

.cv-section h5::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.cv-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cv-section li {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
  line-height: 1.5;
  padding-left: 20px;
  position: relative;
}

.cv-section li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--persona-color, #10a37f);
  font-size: 1.2rem;
}

.cv-section li strong {
  color: var(--text-primary);
  font-weight: 600;
}

.cv-section li small {
  font-size: 0.8rem;
  opacity: 0.8;
  display: block;
  margin-top: 4px;
}

/* Responsive */
@media (max-width: 1024px) {
  .sidecar-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 100% !important;
    max-width: 500px;
    box-shadow: -12px 0 48px rgba(0, 0, 0, 0.5);
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .cv-sections {
    grid-template-columns: 1fr;
  }
  
  .cv-stats {
    gap: 30px;
  }
  
  .stat-number {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .see-me-button {
    bottom: 16px;
    right: 16px;
    padding: 10px 16px;
    font-size: 0.9rem;
  }
  
  .see-me-button span {
    display: none;
  }
  
  .see-me-button svg {
    width: 24px;
    height: 24px;
  }
  
  .sidecar-panel {
    max-width: 100%;
    border-left: none;
    border-radius: 0;
  }
  
  .resize-handle {
    display: none;
  }
  
  .tabs-container {
    padding: 0 16px;
    margin: 12px 0;
  }
  
  .tab-button {
    padding: 12px 16px;
    font-size: 0.9rem;
  }
  
  .tab-label {
    display: none;
  }
  
  .tab-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 0.7rem;
    padding: 1px 6px;
    min-width: 16px;
  }
  
  .panel-header {
    padding: 20px 20px 16px;
  }
  
  .tabs-content {
    padding: 0 20px 20px;
  }
  
  .contact-form,
  .contact-info,
  .cv-card,
  .cv-section {
    padding: 20px;
  }
  
  .cv-actions {
    flex-direction: column;
  }
  
  .form-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .submit-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .see-me-button {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    padding: 0;
    justify-content: center;
  }
  
  .panel-title {
    font-size: 1.125rem;
  }
  
  .tab-button {
    padding: 12px;
  }
  
  .section-header h3 {
    font-size: 1.125rem;
  }
  
  .cv-header h4 {
    font-size: 1.25rem;
  }
  
  .cv-stats {
    gap: 20px;
  }
  
  .stat-number {
    font-size: 1.75rem;
  }
}

/* Persona-specific styles */
.sidecar-panel.persona-creative {
  --persona-color: #a855f7;
  --persona-color-rgb: 168, 85, 247;
}

.sidecar-panel.persona-executive {
  --persona-color: #3b82f6;
  --persona-color-rgb: 59, 130, 246;
}

.sidecar-panel.persona-nerd {
  --persona-color: #22c55e;
  --persona-color-rgb: 34, 197, 94;
}

.sidecar-panel.persona-local {
  --persona-color: #06b6d4;
  --persona-color-rgb: 6, 182, 212;
}

/* Scrollbar */
.sidecar-panel::-webkit-scrollbar {
  width: 8px;
}

.sidecar-panel::-webkit-scrollbar-track {
  background: transparent;
}

.sidecar-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.sidecar-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
  border: 0;
}

.tabs-content::-webkit-scrollbar {
  width: 6px;
}

.tabs-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .sidecar-panel,
  .project-card,
  .skill-item,
  .timeline-content,
  .contact-link,
  .cv-button,
  .submit-button,
  .tab-button,
  .see-me-button,
  .close-panel {
    transition: none;
  }
  
  .see-me-button:hover,
  .project-card:hover,
  .contact-link:hover,
  .cv-button:hover,
  .submit-button:hover:not(:disabled),
  .skill-item:hover,
  .timeline-content:hover {
    transform: none;
  }
  
  .skill-fill {
    transition: none;
  }
  
  .loading-dots span,
  .skill-fill::after {
    animation: none;
  }
  
  .tab-panel {
    animation: none;
  }
  
  .success-message {
    animation: none;
  }
}

/* Light theme */
[data-theme="light"] .sidecar-panel {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(255, 255, 255, 0.95) 100%
  );
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.15);
}

[data-theme="light"] .see-me-button {
  background: linear-gradient(135deg, #10a37f, #3b82f6);
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

[data-theme="light"] .success-message {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.15);
}

[data-theme="light"] .skill-item,
[data-theme="light"] .timeline-content,
[data-theme="light"] .contact-form,
[data-theme="light"] .contact-info,
[data-theme="light"] .cv-card,
[data-theme="light"] .cv-section {
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.08);
}

[data-theme="light"] .skill-tag,
[data-theme="light"] .event-tag {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .timeline::before {
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(0, 0, 0, 0.1),
    transparent
  );
}

[data-theme="light"] .timeline-dot {
  border-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

[data-theme="light"] input,
[data-theme="light"] textarea {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.15);
  color: #1a1a1a;
}

[data-theme="light"] input:focus,
[data-theme="light"] textarea:focus {
  background: rgba(0, 0, 0, 0.06);
}

[data-theme="light"] .skill-bar {
  background: rgba(0, 0, 0, 0.08);
}

[data-theme="light"] .form-hint svg {
  color: #10a37f;
}

[data-theme="light"] .contact-link {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.1);
  color: #555;
}

[data-theme="light"] .contact-link:hover {
  background: rgba(0, 0, 0, 0.08);
  color: #1a1a1a;
}

[data-theme="light"] .resize-handle .handle-line {
  background: rgba(0, 0, 0, 0.3);
}

[data-theme="light"] .close-panel {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
  color: #555;
}

[data-theme="light"] .close-panel:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #1a1a1a;
}

[data-theme="light"] .tab-button {
  color: #666;
}

[data-theme="light"] .tab-button:hover {
  color: #1a1a1a;
  background: rgba(0, 0, 0, 0.05);
}

[data-theme="light"] .tab-button.active {
  background: rgba(var(--persona-color-rgb, 16, 163, 127), 0.08);
}

/* Print styles */
@media print {
  .see-me-button,
  .resize-handle,
  .panel-toggle,
  .close-panel,
  .tab-badge,
  .contact-form,
  .cv-button.secondary {
    display: none !important;
  }
  
  .sidecar-panel {
    position: static !important;
    width: 100% !important;
    height: auto !important;
    transform: none !important;
    background: white !important;
    color: black !important;
    border: 1px solid #ddd !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    margin: 0 !important;
    padding: 20px !important;
  }
  
  .tabs-container {
    border-bottom-color: #ddd;
  }
  
  .tab-button {
    color: #333 !important;
    border-bottom-color: #ddd !important;
  }
  
  .tab-button.active {
    color: var(--persona-color, #10a37f) !important;
    border-bottom-color: var(--persona-color, #10a37f) !important;
  }
  
  .skill-fill {
    background: var(--persona-color, #10a37f) !important;
  }
  
  a {
    color: var(--persona-color, #10a37f) !important;
    text-decoration: underline;
  }
  
  .contact-link {
    border: 1px solid #ddd !important;
    color: #333 !important;
  }
}
</style>