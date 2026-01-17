<template>
  <aside
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
      @touchstart="startResize"
      @keydown.enter="toggleResize"
      @keydown.space.prevent="toggleResize"
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
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
          @keydown.enter="activeTab = tab.id"
          @keydown.space.prevent="activeTab = tab.id"
          :aria-selected="activeTab === tab.id"
          :aria-controls="`tab-${tab.id}`"
          role="tab"
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
          v-if="activeTab === 'projects'"
          id="tab-projects"
          class="tab-panel"
          role="tabpanel"
          aria-labelledby="projects-tab"
        >
          <div class="section-header">
            <h3>Featured Projects</h3>
            <p class="section-subtitle">Hand-picked showcase of my best work</p>
          </div>
          
          <div class="projects-grid">
            <div
              v-for="project in projects"
              :key="project.id"
              class="project-card"
              :style="{ '--project-color': project.color }"
            >
              <div class="project-image" v-if="project.image">
                <img 
                  :src="project.image" 
                  :alt="project.name" 
                  loading="lazy"
                />
                <div class="project-overlay">
                  <button 
                    class="project-action"
                    @click="viewProject(project)"
                    aria-label="View project details"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="project-info">
                <h4 class="project-title">{{ project.name }}</h4>
                <p class="project-description">{{ project.description }}</p>
                <div class="project-tags">
                  <span 
                    v-for="tag in project.tags" 
                    :key="tag"
                    class="project-tag"
                  >
                    {{ tag }}
                  </span>
                </div>
                <div class="project-links">
                  <a 
                    v-if="project.demo"
                    :href="project.demo" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="project-link"
                  >
                    Live Demo
                  </a>
                  <a 
                    v-if="project.github"
                    :href="project.github" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="project-link secondary"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Skills Tab -->
        <section
          v-if="activeTab === 'skills'"
          id="tab-skills"
          class="tab-panel"
          role="tabpanel"
          aria-labelledby="skills-tab"
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
          v-if="activeTab === 'timeline'"
          id="tab-timeline"
          class="tab-panel"
          role="tabpanel"
          aria-labelledby="timeline-tab"
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
              :class="{ 'left': index % 2 === 0, 'right': index % 2 !== 0 }"
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
          v-if="activeTab === 'contact'"
          id="tab-contact"
          class="tab-panel"
          role="tabpanel"
          aria-labelledby="contact-tab"
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
                :disabled="!isFormValid"
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
          v-if="activeTab === 'cv'"
          id="tab-cv"
          class="tab-panel"
          role="tabpanel"
          aria-labelledby="cv-tab"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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

const emit = defineEmits(['close', 'project-view', 'contact-sent', 'width-change'])

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  },
  currentPersona: {
    type: String,
    default: 'default'
  }
})

// State
const panelWidth = ref(420)
const isResizing = ref(false)
const isCollapsed = ref(false)
const activeTab = ref('projects')
const isSubmitting = ref(false)

// Contact form
const contact = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

// Tabs configuration
const tabs = [
  { id: 'projects', label: 'Projects', icon: Briefcase, badge: '4' },
  { id: 'skills', label: 'Skills', icon: Code },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'contact', label: 'Contact', icon: Mail },
  { id: 'cv', label: 'CV', icon: FileText }
]

// Projects data
const projects = ref([
  {
    id: 1,
    name: 'E-Commerce Platform',
    description: 'Full-featured online store with admin dashboard and payment integration',
    tags: ['Vue.js', 'Node.js', 'MongoDB', 'Stripe'],
    demo: 'https://demo.example.com',
    github: 'https://github.com/yourusername/ecommerce',
    image: '/project1.jpg',
    color: '#10a37f'
  },
  {
    id: 2,
    name: 'Task Management App',
    description: 'Collaborative task management with real-time updates and drag & drop',
    tags: ['React', 'Firebase', 'Tailwind'],
    demo: 'https://tasks.example.com',
    github: 'https://github.com/yourusername/taskapp',
    image: '/project2.jpg',
    color: '#3b82f6'
  },
  {
    id: 3,
    name: 'Weather Dashboard',
    description: 'Beautiful weather app with interactive charts and PWA support',
    tags: ['Vue.js', 'Chart.js', 'PWA'],
    demo: 'https://weather.example.com',
    github: 'https://github.com/yourusername/weather',
    image: '/project3.jpg',
    color: '#8b5cf6'
  },
  {
    id: 4,
    name: 'Portfolio Website',
    description: 'Interactive portfolio with AI assistant and real-time features',
    tags: ['Vue.js', 'WebSockets', 'AI'],
    demo: 'https://suleiman.example.com',
    github: 'https://github.com/yourusername/portfolio',
    image: '/project4.jpg',
    color: '#f59e0b'
  }
])

// Skills data
const skillCategories = ref([
  {
    name: 'Frontend',
    skills: [
      { name: 'Vue.js', level: 95, tags: ['Composition API', 'Vuex', 'Vue Router'] },
      { name: 'React', level: 85, tags: ['Hooks', 'Context', 'Next.js'] },
      { name: 'JavaScript/TypeScript', level: 90, tags: ['ES6+', 'TS Config'] },
      { name: 'CSS/SCSS', level: 88, tags: ['Flexbox', 'Grid', 'Animations'] }
    ]
  },
  {
    name: 'Backend',
    skills: [
      { name: 'Node.js', level: 88, tags: ['Express', 'REST APIs'] },
      { name: 'Python', level: 75, tags: ['FastAPI', 'Django'] },
      { name: 'Databases', level: 82, tags: ['MongoDB', 'PostgreSQL'] }
    ]
  },
  {
    name: 'Tools & Others',
    skills: [
      { name: 'Git', level: 92, tags: ['GitHub', 'GitLab'] },
      { name: 'Docker', level: 78, tags: ['Containers', 'Docker Compose'] },
      { name: 'AWS', level: 72, tags: ['EC2', 'S3', 'Lambda'] },
      { name: 'UI/UX Design', level: 80, tags: ['Figma', 'Prototyping'] }
    ]
  }
])

// Timeline data
const timeline = ref([
  {
    id: 1,
    date: '2023-01',
    title: 'Senior Full Stack Developer',
    description: 'Led development of customer-facing applications and mentored junior developers',
    type: 'Work',
    color: '#10a37f',
    tags: ['Vue.js', 'Team Lead', 'Microservices']
  },
  {
    id: 2,
    date: '2022-06',
    title: 'Vue.js Workshop Instructor',
    description: 'Conducted workshops on Vue.js best practices and modern web development',
    type: 'Education',
    color: '#3b82f6',
    tags: ['Teaching', 'Vue 3', 'Workshops']
  },
  {
    id: 3,
    date: '2021-03',
    title: 'Open Source Contributor',
    description: 'Contributed to various open source projects and libraries',
    type: 'Open Source',
    color: '#8b5cf6',
    tags: ['GitHub', 'Community', 'Libraries']
  },
  {
    id: 4,
    date: '2020-09',
    title: 'Freelance Developer',
    description: 'Built custom solutions for clients across various industries',
    type: 'Freelance',
    color: '#f59e0b',
    tags: ['Client Work', 'Consulting', 'Web Apps']
  }
])

// CV data
const cvLink = ref('/cv/suleiman-msaba-cv.pdf')
const cvStats = ref({
  experience: 3,
  projects: 20,
  clients: 15
})
const education = ref([
  { id: 1, degree: 'BSc Computer Science', institution: 'University of Dar es Salaam', period: '2017-2021' },
  { id: 2, degree: 'Full Stack Web Development', institution: 'Online Bootcamp', period: '2020' }
])
const certifications = ref([
  { id: 1, name: 'AWS Certified Developer', issuer: 'Amazon' },
  { id: 2, name: 'Vue.js Mastery', issuer: 'Vue School' },
  { id: 3, name: 'JavaScript Algorithms', issuer: 'FreeCodeCamp' }
])

// Contact links
const contactLinks = ref([
  { id: 'email', label: 'suleiman@example.com', url: 'mailto:suleiman@example.com', icon: Mail },
  { id: 'github', label: 'github.com/suleiman', url: 'https://github.com/suleiman', icon: Github },
  { id: 'linkedin', label: 'linkedin.com/in/suleiman', url: 'https://linkedin.com/in/suleiman', icon: Linkedin },
  { id: 'twitter', label: '@suleiman_dev', url: 'https://twitter.com/suleiman_dev', icon: Twitter },
  { id: 'website', label: 'suleiman.dev', url: 'https://suleiman.dev', icon: Globe }
])

// Computed
const isFormValid = computed(() => {
  return contact.value.name && 
         contact.value.email && 
         contact.value.message &&
         contact.value.email.includes('@')
})

// Effective width used by parent to reserve space
const effectiveWidth = computed(() => (isCollapsed.value ? 60 : panelWidth.value))

// Methods
const startResize = (e) => {
  isResizing.value = true
  e.preventDefault()
  
  // Prevent text selection during resize
  document.body.style.userSelect = 'none'
}

const stopResize = () => {
  isResizing.value = false
  document.body.style.userSelect = ''
}

const resizePanel = (e) => {
  if (!isResizing.value) return
  
  const clientX = e.clientX || e.touches?.[0]?.clientX
  if (!clientX) return

  const newWidth = window.innerWidth - clientX
  panelWidth.value = Math.max(320, Math.min(600, newWidth))
}

const toggleResize = () => {
  // Toggle between minimum and maximum width
  panelWidth.value = panelWidth.value === 320 ? 600 : 320
}

const togglePanel = () => {
  isCollapsed.value = !isCollapsed.value
  emit('width-change', effectiveWidth.value)
}

const closePanel = () => {
  emit('close')
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
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    emit('contact-sent', contact.value)
    
    // Reset form
    contact.value = {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
    
    // Show success message
    alert('Message sent successfully! I\'ll get back to you soon.')
  } catch (error) {
    console.error('Failed to send message:', error)
    alert('Failed to send message. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const printCV = () => {
  window.print()
}

// Lifecycle
onMounted(() => {
  window.addEventListener('mousemove', resizePanel)
  window.addEventListener('mouseup', stopResize)
  window.addEventListener('touchmove', resizePanel)
  window.addEventListener('touchend', stopResize)
  
  // Load saved width
  const savedWidth = localStorage.getItem('sidecar-width')
  if (savedWidth) {
    panelWidth.value = parseInt(savedWidth, 10)
  }


  // Tell parent the initial width
  emit('width-change', effectiveWidth.value)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', resizePanel)
  window.removeEventListener('mouseup', stopResize)
  window.removeEventListener('touchmove', resizePanel)
  window.removeEventListener('touchend', stopResize)
})

// Watch for width changes to save
watch(panelWidth, (newWidth) => {
  localStorage.setItem('sidecar-width', newWidth.toString())
  if (!isCollapsed.value) emit('width-change', newWidth)
})

watch(isCollapsed, () => {
  emit('width-change', effectiveWidth.value)
})
</script>

<style scoped>
/* Base Styles */
.sidecar-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  background: linear-gradient(
    180deg,
    rgba(var(--bg-glass-rgb, 33, 33, 33), 0.95) 0%,
    rgba(var(--bg-glass-rgb, 33, 33, 33), 0.85) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-left: 1px solid rgba(var(--border-glass-rgb, 255, 255, 255), 0.08);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  z-index: 40;
  transition: 
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(100%);
}

.sidecar-open {
  transform: translateX(0);
}

/* Resize Handle */
.resize-handle {
  position: absolute;
  left: -12px;
  width: 24px;
  height: 100%;
  cursor: ew-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transition: background-color 0.2s;
  z-index: 1;
}

.resize-handle:hover,
.resize-handle:focus {
  background: rgba(var(--persona-color-rgb, 16, 163, 127), 0.1);
}

.resize-handle:focus-visible {
  outline: 2px solid var(--persona-color, #10a37f);
  outline-offset: -2px;
}

.handle-line {
  width: 2px;
  height: 20px;
  background: rgba(255, 255, 255, 0.3);
  margin: 2px 0;
  border-radius: 1px;
}

/* Panel Toggle (Collapsed State) */
.panel-toggle {
  width: 100%;
  height: 60px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.panel-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

/* Panel Header */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.panel-title {
  font-size: 1.25rem;
  font-weight: 600;
  background: linear-gradient(135deg, var(--persona-color, #10a37f), #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-panel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.close-panel:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

/* Tabs */
.tabs-container {
  display: flex;
  gap: 4px;
  padding: 0 20px;
  margin: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  overflow-x: auto;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;
  position: relative;
}

.tab-button:hover {
  color: var(--text-primary);
}

.tab-button.active {
  color: var(--persona-color, #10a37f);
  border-bottom-color: var(--persona-color, #10a37f);
}

.tab-icon {
  width: 18px;
  height: 18px;
}

.tab-badge {
  background: var(--persona-color, #10a37f);
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

/* Tab Content */
.tabs-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.tab-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Section Headers */
.section-header {
  margin-bottom: 24px;
}

.section-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.section-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.project-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(var(--project-color, 16, 163, 127), 0.2);
}

.project-image {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.project-card:hover .project-overlay {
  opacity: 1;
}

.project-action {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.project-action:hover {
  background: white;
  transform: scale(1.1);
}

.project-info {
  padding: 16px;
}

.project-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.project-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
  line-height: 1.5;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.project-tag {
  padding: 4px 8px;
  background: rgba(var(--project-color, 16, 163, 127), 0.1);
  border: 1px solid rgba(var(--project-color, 16, 163, 127), 0.2);
  color: var(--project-color, #10a37f);
  border-radius: 12px;
  font-size: 0.75rem;
}

.project-links {
  display: flex;
  gap: 8px;
}

.project-link {
  flex: 1;
  padding: 8px 12px;
  background: var(--project-color, #10a37f);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s;
}

.project-link:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.project-link.secondary {
  background: transparent;
  border: 1px solid rgba(var(--project-color, 16, 163, 127), 0.3);
  color: var(--project-color, #10a37f);
}

/* Skills */
.skills-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.skills-grid {
  display: grid;
  gap: 16px;
}

.skill-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.skill-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.skill-level {
  font-size: 0.8rem;
  color: var(--persona-color, #10a37f);
  font-weight: 600;
}

.skill-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 12px;
}

.skill-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--persona-color, #10a37f),
    color-mix(in srgb, var(--persona-color, #10a37f), transparent 30%)
  );
  border-radius: 3px;
  transition: width 1s ease-out;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-tag {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  border-radius: 10px;
  font-size: 0.75rem;
}

/* Timeline */
.timeline {
  position: relative;
  padding-left: 24px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.1);
}

.timeline-event {
  position: relative;
  margin-bottom: 32px;
}

.timeline-dot {
  position: absolute;
  left: -30px;
  top: 0;
  width: 16px;
  height: 16px;
  background: var(--persona-color, #10a37f);
  border-radius: 50%;
  border: 3px solid var(--bg-primary, #202123);
}

.timeline-content {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.event-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.event-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
}

.event-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.event-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
  line-height: 1.5;
}

.event-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.event-tag {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  border-radius: 10px;
  font-size: 0.75rem;
}

/* Contact Form */
.contact-form {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.label-text {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
}

input,
textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: inherit;
  transition: all 0.2s;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--persona-color, #10a37f);
  box-shadow: 0 0 0 2px rgba(var(--persona-color-rgb, 16, 163, 127), 0.2);
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.submit-button {
  padding: 12px 24px;
  background: var(--persona-color, #10a37f);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
}

.submit-button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Contact Info */
.contact-info {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
}

.contact-info h4 {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.contact-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
}

.contact-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  transform: translateX(4px);
}

.contact-icon {
  width: 20px;
  height: 20px;
}

.contact-label {
  flex: 1;
  font-size: 0.9rem;
}

/* CV Preview */
.cv-preview {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cv-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}

.cv-header h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.cv-header p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.cv-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--persona-color, #10a37f);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 4px;
}

.cv-actions {
  display: flex;
  gap: 12px;
}

.cv-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.cv-button.primary {
  background: var(--persona-color, #10a37f);
  color: white;
}

.cv-button.secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
}

.cv-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.cv-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.cv-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
}

.cv-section h5 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.cv-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cv-section li {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
  line-height: 1.5;
}

.cv-section li strong {
  color: var(--text-primary);
}

.cv-section li small {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 1024px) {
  .sidecar-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 100% !important;
    max-width: 500px;
    box-shadow: -8px 0 32px rgba(0, 0, 0, 0.5);
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .cv-sections {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sidecar-panel {
    max-width: 100%;
    border-left: none;
    border-radius: 0;
  }
  
  .resize-handle {
    display: none;
  }
  
  .tabs-container {
    overflow-x: auto;
  }
  
  .tab-button {
    padding: 12px;
  }
  
  .tab-label {
    display: none;
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
  width: 6px;
}

.sidecar-panel::-webkit-scrollbar-track {
  background: transparent;
}

.sidecar-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.sidecar-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .sidecar-panel,
  .project-card,
  .tab-button,
  .contact-link,
  .cv-button,
  .submit-button {
    transition: none;
  }
  
  .project-card:hover,
  .contact-link:hover,
  .cv-button:hover,
  .submit-button:hover:not(:disabled) {
    transform: none;
  }
  
  .skill-fill {
    transition: none;
  }
  
  .loading-dots span {
    animation: none;
  }
}

/* Light theme */
[data-theme="light"] .sidecar-panel {
  background: linear-gradient(
    180deg,
    rgba(var(--bg-glass-rgb, 255, 255, 255), 0.95) 0%,
    rgba(var(--bg-glass-rgb, 255, 255, 255), 0.85) 100%
  );
  border-left-color: rgba(var(--border-glass-rgb, 0, 0, 0), 0.08);
}

[data-theme="light"] .project-card,
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
  background: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .timeline-dot {
  border-color: var(--bg-primary, #ffffff);
}

[data-theme="light"] input,
[data-theme="light"] textarea {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
  color: var(--text-primary);
}
</style>