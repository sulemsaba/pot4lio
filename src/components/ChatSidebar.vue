<template>
  <aside 
    class="chat-sidebar" 
    :class="{ 'sidebar-collapsed': isCollapsed }"
    role="complementary"
    aria-label="Portfolio navigation"
  >
    <!-- Collapse Toggle -->
    <button 
      class="collapse-toggle" 
      @click="toggleCollapse" 
      :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      :aria-expanded="!isCollapsed"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path v-if="!isCollapsed" d="M15 18l-6-6 6-6"/>
        <path v-else d="M9 18l6-6-6-6"/>
      </svg>
    </button>

    <!-- Brand Section -->
    <div class="brand-section" v-if="!isCollapsed">
      <div class="brand-name">Suleiman Msaba</div>
      <div class="brand-title">Software engineer</div>
    </div>
    <div class="brand-collapsed" v-else>
      <span class="brand-initials">SM</span>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav" role="navigation" aria-label="Main navigation">
      <button
        v-for="item in navItems"
        :key="item.id"
        :class="['nav-item', { active: activeItem === item.id }]"
        @click="selectItem(item)"
        :aria-label="item.label"
        :aria-current="activeItem === item.id ? 'page' : null"
        :title="isCollapsed ? item.label : ''"
      >
        <component :is="item.icon" class="nav-icon" aria-hidden="true" />
        <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
      </button>
    </nav>

    <!-- Bottom Section -->
    <div class="sidebar-bottom">
      <ThemeToggle :theme="theme" @toggle-theme="$emit('toggle-theme')" />
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  Home, MessageSquare, Briefcase, Code, User, FileText, Mail 
} from 'lucide-vue-next'
import ThemeToggle from './ThemeToggle.vue'

const props = defineProps({
  theme: {
    type: String,
    default: 'dark'
  }
})

const emit = defineEmits(['nav-select', 'toggle-theme', 'toggle-collapse'])

// State
const activeItem = ref('chat')
const isCollapsed = ref(false)

// Navigation items
const navItems = computed(() => [
  { id: 'home', label: 'Home', icon: Home, section: 'hero' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, section: 'chat' },
  { id: 'projects', label: 'Projects', icon: Briefcase, section: 'projects' },
  { id: 'skills', label: 'Skills', icon: Code, section: 'skills' },
  { id: 'about', label: 'About', icon: User, section: 'about' },
  { id: 'resume', label: 'Resume', icon: FileText, section: 'resume' },
  { id: 'contact', label: 'Contact', icon: Mail, section: 'contact' }
])

// Methods
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar-collapsed', isCollapsed.value)
  emit('toggle-collapse', isCollapsed.value)
}

const selectItem = (item) => {
  activeItem.value = item.id
  emit('nav-select', { id: item.id, section: item.section })
}

// Lifecycle
onMounted(() => {
  const savedCollapsed = localStorage.getItem('sidebar-collapsed')
  if (savedCollapsed) isCollapsed.value = JSON.parse(savedCollapsed)
})
</script>

<style scoped>
.chat-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 200px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-subtle);
  padding: 12px 8px;
  z-index: 1000;
  transition: width 0.2s ease;
}

.chat-sidebar.sidebar-collapsed {
  width: 56px;
  padding: 12px 4px;
}

/* Collapse Toggle */
.collapse-toggle {
  align-self: flex-end;
  background: transparent;
  border: none;
  border-radius: 6px;
  padding: 6px;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: 12px;
}

.collapse-toggle:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

/* Brand Section */
.brand-section {
  padding: 0 8px 16px;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 12px;
}

.brand-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.brand-title {
  font-size: 11px;
  color: var(--text-tertiary);
}

.brand-collapsed {
  display: flex;
  justify-content: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 12px;
}

.brand-initials {
  width: 32px;
  height: 32px;
  background: var(--brand-primary);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: white;
}

/* Navigation */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  width: 100%;
}

.sidebar-collapsed .nav-item {
  justify-content: center;
  padding: 8px;
}

.nav-item:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--surface);
  color: var(--brand-primary);
}

.nav-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.nav-label {
  font-weight: 500;
}

/* Bottom Section */
.sidebar-bottom {
  padding-top: 12px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-sidebar {
    transform: translateX(-100%);
    width: 200px;
  }
  
  .chat-sidebar.mobile-open {
    transform: translateX(0);
  }
}

/* Focus styles */
.nav-item:focus-visible,
.collapse-toggle:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}
</style>
