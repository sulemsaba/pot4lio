<template>
  <header class="navbar-header">
    <div class="navbar-container">
      <div class="logo">Suleiman Msaba</div>

      <div class="burger" @click="toggleNav">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
      </div>

      <nav class="nav" :class="{ show: navOpen }">
        <button class="nav-link" @click="handleResearchClick">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          Research
        </button>
        <button class="nav-link" @click="handleProductClick">Product</button>

        <div class="dropdown" :class="{ open: dropdownOpen }" @click.stop>
          <button class="nav-link dropdown-trigger" @click="toggleDropdown">
            Features
            <svg class="dropdown-arrow" :class="{ rotated: dropdownOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          <div class="dropdown-menu">
            <a href="#" class="dropdown-item">
              <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 8V4H8"></path>
                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
              </svg>
              Agents
            </a>
            <a href="#" class="dropdown-item">
              <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" x2="12" y1="19" y2="22"></line>
              </svg>
              Voice
            </a>
            <a href="#" class="dropdown-item">
              <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
              </svg>
              Image generation
            </a>
            <a href="#" class="dropdown-item">
              <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
              </svg>
              Study mode
            </a>
          </div>
        </div>

        <a href="#" class="nav-link">Safety</a>
        <a href="#" class="nav-link">Company</a>
      </nav>

      <div class="actions">
        <button class="btn btn-login">Log in</button>
        <button class="btn btn-signup">Sign up</button>
      </div>
    </div>
    
    <!-- Research Panel (SidebarDropdownMenu) -->
    <transition name="slide-down">
      <div v-if="showResearchPanel" class="research-panel">
        <SidebarDropdownMenu 
          title="Research Topics"
          :items="researchItems"
        />
        <button class="close-panel" @click="closeResearchPanel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

const emit = defineEmits(['research-click', 'product-click'])

const navOpen = ref(false)
const dropdownOpen = ref(false)
const showResearchPanel = ref(false)

const researchItems = ref([
  { name: 'AI & Machine Learning', url: '#' },
  { name: 'Web Development', url: '#' },
  { name: 'Mobile Apps', url: '#' },
  { name: 'Cloud Computing', url: '#' },
  { name: 'Data Science', url: '#' }
])

const toggleNav = () => {
  navOpen.value = !navOpen.value
  if (navOpen.value) {
    dropdownOpen.value = false
  }
}

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const handleResearchClick = () => {
  showResearchPanel.value = !showResearchPanel.value
  emit('research-click')
}

const closeResearchPanel = () => {
  showResearchPanel.value = false
}

const handleProductClick = () => {
  emit('product-click')
}

const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.dropdown')
  if (dropdown && !dropdown.contains(event.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* CSS Variables for theming */
.navbar-header {
  --nav-bg: rgba(255, 255, 255, 0.85);
  --nav-border: #e5e7eb;
  --nav-text: #0f172a;
  --nav-muted: #6b7280;
  --nav-hover: #f3f4f6;
  --nav-button: #000;
  --nav-button-text: #fff;
}

/* Dark theme support */
[data-theme="dark"] .navbar-header {
  --nav-bg: rgba(33, 33, 33, 0.9);
  --nav-border: rgba(255, 255, 255, 0.1);
  --nav-text: #ffffff;
  --nav-muted: #9ca3af;
  --nav-hover: rgba(255, 255, 255, 0.1);
  --nav-button: #fff;
  --nav-button-text: #000;
}

/* Header */
.navbar-header {
  position: sticky;
  top: 0;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: var(--nav-bg);
  border-bottom: 1px solid var(--nav-border);
  z-index: 1000;
}

/* Container */
.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.logo {
  font-weight: 600;
  font-size: 18px;
  color: var(--nav-text);
  letter-spacing: -0.02em;
}

/* Navigation */
.nav {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: var(--nav-text);
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 10px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: var(--nav-hover);
}

.nav-icon {
  width: 16px;
  height: 16px;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Dropdown */
.dropdown {
  position: relative;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dropdown-arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--nav-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--nav-border);
  border-radius: 14px;
  min-width: 220px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
  padding: 8px;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-50%) translateY(-10px);
  transition: all 0.2s ease;
}

.dropdown.open .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--nav-text);
  text-decoration: none;
  font-size: 14px;
  transition: background 0.15s ease;
}

.dropdown-item:hover {
  background: var(--nav-hover);
}

.dropdown-icon {
  width: 18px;
  height: 18px;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex-shrink: 0;
}

/* Actions */
.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn {
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-login {
  background: transparent;
  color: var(--nav-text);
}

.btn-login:hover {
  background: var(--nav-hover);
}

.btn-signup {
  background: var(--nav-button);
  color: var(--nav-button-text);
}

.btn-signup:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Burger Menu */
.burger {
  display: none;
  padding: 8px;
  cursor: pointer;
  color: var(--nav-text);
  border-radius: 8px;
  transition: background 0.2s ease;
}

.burger:hover {
  background: var(--nav-hover);
}

.burger svg {
  display: block;
}

/* Research Panel */
.research-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--nav-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--nav-border);
  padding: 16px 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.close-panel {
  position: absolute;
  top: 12px;
  right: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--nav-hover);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: var(--nav-text);
  transition: all 0.2s ease;
}

.close-panel:hover {
  background: var(--nav-border);
}

.close-panel svg {
  width: 18px;
  height: 18px;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Slide down animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive - Mobile */
@media (max-width: 768px) {
  .navbar-container {
    padding: 10px 16px;
  }

  .nav {
    position: fixed;
    top: 56px;
    left: 0;
    right: 0;
    bottom: 0;
    flex-direction: column;
    align-items: stretch;
    background: var(--nav-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 20px;
    gap: 4px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-20px);
    transition: all 0.3s ease;
    overflow-y: auto;
  }

  .nav.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .nav-link {
    padding: 12px 16px;
    font-size: 16px;
    border-radius: 12px;
  }

  .dropdown-menu {
    position: static;
    transform: none;
    box-shadow: none;
    border: none;
    background: var(--nav-hover);
    margin-top: 8px;
    opacity: 1;
    visibility: visible;
  }

  .dropdown.open .dropdown-menu {
    transform: none;
  }

  .burger {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .actions {
    display: none;
  }

  .nav.show ~ .actions {
    display: flex;
    flex-direction: column;
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    gap: 8px;
  }

  .nav.show ~ .actions .btn {
    width: 100%;
    padding: 14px;
    font-size: 16px;
  }

  .research-panel {
    padding: 12px 16px;
  }
}

/* Desktop - show actions */
@media (min-width: 769px) {
  .actions {
    display: flex;
  }
}
</style>
