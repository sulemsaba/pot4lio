<template>
  <header class="navbar" :class="{ 'navbar-scrolled': isScrolled }">
    <div class="navbar-container">
      <!-- Logo -->
      <div class="navbar-brand">
        <a href="#" class="brand-link">
          <span class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
          </span>
          <span class="brand-text">Suleiman Msaba</span>
        </a>
      </div>

      <!-- Desktop Navigation -->
      <nav class="navbar-nav" :class="{ 'nav-open': mobileMenuOpen }">
        <div class="nav-links">
          <button class="nav-item" @click="handleResearchClick">
            <span class="nav-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <span class="nav-item-text">Research</span>
          </button>

          <button class="nav-item" @click="handleProductClick">
            <span class="nav-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </span>
            <span class="nav-item-text">Projects</span>
          </button>

          <!-- Features Dropdown -->
          <div class="nav-dropdown" :class="{ 'dropdown-open': dropdownOpen }">
            <button class="nav-item dropdown-trigger" @click.stop="toggleDropdown">
              <span class="nav-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
              </span>
              <span class="nav-item-text">Features</span>
              <svg class="dropdown-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            <div class="dropdown-menu">
              <div class="dropdown-content">
                <a href="#" class="dropdown-item">
                  <span class="dropdown-item-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 8V4H8"/>
                      <rect width="16" height="12" x="4" y="8" rx="2"/>
                      <path d="M2 14h2"/>
                      <path d="M20 14h2"/>
                      <path d="M15 13v2"/>
                      <path d="M9 13v2"/>
                    </svg>
                  </span>
                  <div class="dropdown-item-content">
                    <span class="dropdown-item-title">AI Agents</span>
                    <span class="dropdown-item-desc">Intelligent automation</span>
                  </div>
                </a>

                <a href="#" class="dropdown-item">
                  <span class="dropdown-item-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" x2="12" y1="19" y2="22"/>
                    </svg>
                  </span>
                  <div class="dropdown-item-content">
                    <span class="dropdown-item-title">Voice</span>
                    <span class="dropdown-item-desc">Speech recognition</span>
                  </div>
                </a>

                <a href="#" class="dropdown-item">
                  <span class="dropdown-item-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                      <circle cx="9" cy="9" r="2"/>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>
                  </span>
                  <div class="dropdown-item-content">
                    <span class="dropdown-item-title">Image Generation</span>
                    <span class="dropdown-item-desc">AI-powered visuals</span>
                  </div>
                </a>

                <a href="#" class="dropdown-item">
                  <span class="dropdown-item-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                    </svg>
                  </span>
                  <div class="dropdown-item-content">
                    <span class="dropdown-item-title">Study Mode</span>
                    <span class="dropdown-item-desc">Learning assistant</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <a href="#" class="nav-item">
            <span class="nav-item-text">About</span>
          </a>

          <a href="#" class="nav-item">
            <span class="nav-item-text">Contact</span>
          </a>
        </div>
      </nav>

      <!-- Actions -->
      <div class="navbar-actions">
        <ThemeToggle :theme="theme" @toggle-theme="$emit('theme-toggle')" />
        
        <div class="action-buttons">
          <button class="btn btn-ghost">Log in</button>
          <button class="btn btn-primary">
            <span>Get Started</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-toggle" @click="toggleMobileMenu" :aria-expanded="mobileMenuOpen" aria-label="Toggle navigation menu">
          <span class="hamburger" :class="{ 'is-active': mobileMenuOpen }">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </span>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <transition name="fade">
      <div v-if="mobileMenuOpen" class="mobile-overlay" @click="closeMobileMenu"></div>
    </transition>

    <!-- Mobile Menu Panel -->
    <transition name="slide">
      <div v-if="mobileMenuOpen" class="mobile-menu">
        <div class="mobile-menu-content">
          <div class="mobile-nav-links">
            <button class="mobile-nav-item" @click="handleResearchClick">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <span>Research</span>
            </button>

            <button class="mobile-nav-item" @click="handleProductClick">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              <span>Projects</span>
            </button>

            <div class="mobile-nav-divider"></div>

            <a href="#" class="mobile-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 8V4H8"/>
                <rect width="16" height="12" x="4" y="8" rx="2"/>
              </svg>
              <span>AI Agents</span>
            </a>

            <a href="#" class="mobile-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              </svg>
              <span>Voice</span>
            </a>

            <a href="#" class="mobile-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
              <span>Image Generation</span>
            </a>

            <div class="mobile-nav-divider"></div>

            <a href="#" class="mobile-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
              <span>About</span>
            </a>

            <a href="#" class="mobile-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>Contact</span>
            </a>
          </div>

          <div class="mobile-actions">
            <button class="btn btn-ghost btn-full">Log in</button>
            <button class="btn btn-primary btn-full">
              <span>Get Started</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Research Panel -->
    <transition name="slide-down">
      <div v-if="showResearchPanel" class="research-panel">
        <SidebarDropdownMenu 
          title="Research Topics"
          :items="researchItems"
        />
        <button class="close-panel" @click="closeResearchPanel" aria-label="Close panel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SidebarDropdownMenu from './SidebarDropdownMenu.vue'
import ThemeToggle from './ThemeToggle.vue'

const props = defineProps({
  theme: {
    type: String,
    default: 'dark'
  }
})

const emit = defineEmits(['research-click', 'product-click', 'theme-toggle'])

const mobileMenuOpen = ref(false)
const dropdownOpen = ref(false)
const showResearchPanel = ref(false)
const isScrolled = ref(false)

const researchItems = ref([
  { name: 'AI & Machine Learning', url: '#' },
  { name: 'Web Development', url: '#' },
  { name: 'Mobile Apps', url: '#' },
  { name: 'Cloud Computing', url: '#' },
  { name: 'Data Science', url: '#' }
])

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  document.body.style.overflow = mobileMenuOpen.value ? 'hidden' : ''
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
  document.body.style.overflow = ''
}

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const handleResearchClick = () => {
  showResearchPanel.value = !showResearchPanel.value
  closeMobileMenu()
  emit('research-click')
}

const closeResearchPanel = () => {
  showResearchPanel.value = false
}

const handleProductClick = () => {
  closeMobileMenu()
  emit('product-click')
}

const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.nav-dropdown')
  if (dropdown && !dropdown.contains(event.target)) {
    dropdownOpen.value = false
  }
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* ================================
   CSS Variables
   ================================ */
.navbar {
  --navbar-height: 64px;
  --navbar-bg: rgba(255, 255, 255, 0.8);
  --navbar-border: rgba(0, 0, 0, 0.06);
  --navbar-text: #1a1a2e;
  --navbar-text-muted: #64748b;
  --navbar-hover: rgba(0, 0, 0, 0.04);
  --navbar-active: rgba(0, 0, 0, 0.08);
  --dropdown-bg: rgba(255, 255, 255, 0.98);
  --dropdown-shadow: 0 20px 40px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08);
  --btn-primary-bg: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  --btn-primary-hover: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  --brand-gradient: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
}

/* Dark Theme */
[data-theme="dark"] .navbar {
  --navbar-bg: rgba(17, 17, 17, 0.85);
  --navbar-border: rgba(255, 255, 255, 0.06);
  --navbar-text: #f8fafc;
  --navbar-text-muted: #94a3b8;
  --navbar-hover: rgba(255, 255, 255, 0.06);
  --navbar-active: rgba(255, 255, 255, 0.1);
  --dropdown-bg: rgba(30, 30, 30, 0.98);
  --dropdown-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.3);
}

/* ================================
   Base Navbar Styles
   ================================ */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--navbar-height);
  background: var(--navbar-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--navbar-border);
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar-scrolled {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .navbar-scrolled {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.navbar-container {
  max-width: 1280px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

/* ================================
   Brand / Logo
   ================================ */
.navbar-brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--navbar-text);
  font-weight: 600;
  font-size: 18px;
  letter-spacing: -0.02em;
  transition: opacity 0.2s ease;
}

.brand-link:hover {
  opacity: 0.8;
}

.brand-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--brand-gradient);
  border-radius: 8px;
  color: white;
}

.brand-icon svg {
  width: 18px;
  height: 18px;
}

.brand-text {
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ================================
   Navigation Links
   ================================ */
.navbar-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
  color: var(--navbar-text-muted);
  text-decoration: none;
  border-radius: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-item:hover {
  color: var(--navbar-text);
  background: var(--navbar-hover);
}

.nav-item-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}

.nav-item-icon svg {
  width: 16px;
  height: 16px;
}

.nav-item:hover .nav-item-icon {
  opacity: 1;
}

/* ================================
   Dropdown Menu
   ================================ */
.nav-dropdown {
  position: relative;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dropdown-chevron {
  width: 14px;
  height: 14px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.5;
}

.dropdown-open .dropdown-chevron {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  min-width: 280px;
  background: var(--dropdown-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--navbar-border);
  border-radius: 16px;
  box-shadow: var(--dropdown-shadow);
  padding: 8px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.dropdown-open .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
  pointer-events: auto;
}

.dropdown-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--navbar-text);
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: var(--navbar-hover);
}

.dropdown-item-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--navbar-hover);
  border-radius: 10px;
  color: var(--navbar-text-muted);
  flex-shrink: 0;
}

.dropdown-item-icon svg {
  width: 20px;
  height: 20px;
}

.dropdown-item:hover .dropdown-item-icon {
  background: var(--brand-gradient);
  color: white;
}

.dropdown-item-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--navbar-text);
}

.dropdown-item-desc {
  font-size: 12px;
  color: var(--navbar-text-muted);
}

/* ================================
   Action Buttons
   ================================ */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn svg {
  width: 16px;
  height: 16px;
}

.btn-ghost {
  background: transparent;
  color: var(--navbar-text);
}

.btn-ghost:hover {
  background: var(--navbar-hover);
}

.btn-primary {
  background: var(--btn-primary-bg);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  background: var(--btn-primary-hover);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-full {
  width: 100%;
}

/* ================================
   Mobile Toggle (Hamburger)
   ================================ */
.mobile-toggle {
  display: none;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.mobile-toggle:hover {
  background: var(--navbar-hover);
}

.hamburger {
  width: 20px;
  height: 14px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hamburger-line {
  width: 100%;
  height: 2px;
  background: var(--navbar-text);
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

.hamburger.is-active .hamburger-line:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.hamburger.is-active .hamburger-line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.hamburger.is-active .hamburger-line:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

/* ================================
   Mobile Menu
   ================================ */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 998;
}

.mobile-menu {
  position: fixed;
  top: var(--navbar-height);
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 320px;
  background: var(--dropdown-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-left: 1px solid var(--navbar-border);
  z-index: 999;
  overflow-y: auto;
}

.mobile-menu-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  font-size: 15px;
  font-weight: 500;
  color: var(--navbar-text);
  text-decoration: none;
  border-radius: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
}

.mobile-nav-item:hover {
  background: var(--navbar-hover);
}

.mobile-nav-item svg {
  width: 20px;
  height: 20px;
  color: var(--navbar-text-muted);
  flex-shrink: 0;
}

.mobile-nav-divider {
  height: 1px;
  background: var(--navbar-border);
  margin: 12px 0;
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--navbar-border);
  margin-top: auto;
}

/* ================================
   Research Panel
   ================================ */
.research-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--dropdown-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--navbar-border);
  padding: 20px 24px;
  box-shadow: var(--dropdown-shadow);
}

.close-panel {
  position: absolute;
  top: 16px;
  right: 24px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--navbar-hover);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: var(--navbar-text);
  transition: all 0.2s ease;
}

.close-panel:hover {
  background: var(--navbar-active);
}

.close-panel svg {
  width: 18px;
  height: 18px;
}

/* ================================
   Animations
   ================================ */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ================================
   Responsive Styles
   ================================ */
@media (max-width: 1024px) {
  .navbar-container {
    padding: 0 20px;
    gap: 20px;
  }

  .nav-links {
    gap: 2px;
  }

  .nav-item {
    padding: 8px 10px;
    font-size: 13px;
  }

  .action-buttons {
    gap: 6px;
  }

  .btn {
    padding: 8px 14px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .navbar {
    --navbar-height: 60px;
  }

  .navbar-container {
    padding: 0 16px;
  }

  .navbar-nav {
    display: none;
  }

  .action-buttons {
    display: none;
  }

  .mobile-toggle {
    display: flex;
  }

  .brand-text {
    font-size: 16px;
  }

  .brand-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
  }

  .brand-icon svg {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .mobile-menu {
    max-width: 100%;
  }

  .research-panel {
    padding: 16px;
  }

  .close-panel {
    right: 16px;
  }
}

/* ================================
   Reduced Motion
   ================================ */
@media (prefers-reduced-motion: reduce) {
  .navbar,
  .dropdown-menu,
  .hamburger-line,
  .btn,
  .nav-item,
  .dropdown-item,
  .mobile-nav-item {
    transition: none;
  }

  .fade-enter-active,
  .fade-leave-active,
  .slide-enter-active,
  .slide-leave-active,
  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: none;
  }
}
</style>
