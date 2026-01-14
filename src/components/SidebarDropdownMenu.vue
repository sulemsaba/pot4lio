<template>
  <div class="research-dropdown" :class="{ 'is-navbar': isNavbar }">
    <button v-if="showTitle" class="dropdown-button" @click="toggle">
      <span class="dropdown-title">{{ title }}</span>
      <svg 
        class="dropdown-arrow" 
        :class="{ rotated: isOpen }" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2"
      >
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </button>
    
    <transition name="expand">
      <ul v-if="isOpen || !showTitle" class="dropdown-items">
        <li v-for="(item, index) in items" :key="index" class="dropdown-item">
          <a :href="item.url" target="_blank" rel="noopener" class="item-link">
            <svg v-if="item.icon" class="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path :d="item.icon"/>
            </svg>
            <span class="item-name">{{ item.name }}</span>
            <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Research'
  },
  items: {
    type: Array,
    default: () => []
  },
  showTitle: {
    type: Boolean,
    default: true
  },
  isNavbar: {
    type: Boolean,
    default: false
  },
  defaultOpen: {
    type: Boolean,
    default: false
  }
})

const isOpen = ref(props.defaultOpen)

function toggle() {
  isOpen.value = !isOpen.value
}

// Expose toggle method for parent components
defineExpose({ toggle, isOpen })
</script>

<style scoped>
/* CSS Variables for theming */
.research-dropdown {
  --dropdown-bg: rgba(255, 255, 255, 0.05);
  --dropdown-hover: rgba(255, 255, 255, 0.1);
  --dropdown-text: #ffffff;
  --dropdown-muted: #9ca3af;
  --dropdown-accent: #10A37F;
  --dropdown-border: rgba(255, 255, 255, 0.1);
}

/* Light theme support */
[data-theme="light"] .research-dropdown {
  --dropdown-bg: rgba(0, 0, 0, 0.03);
  --dropdown-hover: rgba(0, 0, 0, 0.06);
  --dropdown-text: #0f172a;
  --dropdown-muted: #6b7280;
  --dropdown-accent: #10A37F;
  --dropdown-border: rgba(0, 0, 0, 0.1);
}

/* Navbar variant */
.research-dropdown.is-navbar {
  --dropdown-bg: transparent;
  --dropdown-hover: rgba(0, 0, 0, 0.05);
  --dropdown-text: #0f172a;
}

[data-theme="dark"] .research-dropdown.is-navbar {
  --dropdown-hover: rgba(255, 255, 255, 0.08);
  --dropdown-text: #ffffff;
}

/* Container */
.research-dropdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

/* Dropdown Button */
.dropdown-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: var(--dropdown-bg);
  color: var(--dropdown-text);
  border: none;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
}

.dropdown-button:hover {
  background: var(--dropdown-hover);
}

.dropdown-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-arrow {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

/* Dropdown Items */
.dropdown-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dropdown-item {
  margin: 0;
}

.item-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  color: var(--dropdown-text);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
  background: transparent;
}

.item-link:hover {
  background: var(--dropdown-hover);
  color: var(--dropdown-accent);
}

.item-link:hover .external-icon {
  opacity: 1;
  transform: translateX(0);
}

.item-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.item-name {
  flex: 1;
}

.external-icon {
  width: 14px;
  height: 14px;
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.2s ease;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Expand Animation */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}

/* Navbar variant styles */
.research-dropdown.is-navbar .dropdown-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
  max-width: 800px;
}

.research-dropdown.is-navbar .item-link {
  background: var(--dropdown-bg);
  border: 1px solid var(--dropdown-border);
}

.research-dropdown.is-navbar .item-link:hover {
  border-color: var(--dropdown-accent);
  background: var(--dropdown-hover);
}

/* Responsive */
@media (max-width: 768px) {
  .dropdown-button {
    padding: 8px 12px;
  }

  .item-link {
    padding: 8px 12px;
    font-size: 13px;
  }

  .research-dropdown.is-navbar .dropdown-items {
    grid-template-columns: 1fr;
  }
}

/* Small screens */
@media (max-width: 480px) {
  .dropdown-button {
    padding: 6px 10px;
    font-size: 13px;
  }

  .item-link {
    padding: 6px 10px;
  }

  .item-icon {
    width: 16px;
    height: 16px;
  }
}
</style>
