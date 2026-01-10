<template>
  <div class="dropdown-menu" ref="dropdownRef">
    <button 
      class="menu-btn" 
      @click="toggleMenu"
      :aria-expanded="isOpen"
      :title="expanded ? 'More options' : 'Menu'"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="2"/>
        <circle cx="12" cy="12" r="2"/>
        <circle cx="12" cy="19" r="2"/>
      </svg>
      <span v-if="expanded" class="menu-text">Menu</span>
    </button>

    <Transition name="menu-fade">
      <div v-if="isOpen" class="menu-list" @click.stop>
        <button class="menu-item" @click="handleSelect('settings')">
          <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m-6 6l-4.2 4.2m16.4 0l-4.2-4.2m-6-6l-4.2-4.2"/>
          </svg>
          <span class="menu-label">Settings</span>
        </button>

        <div class="menu-separator"></div>

        <button class="menu-item" @click="handleSelect('share')">
          <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span class="menu-label">Share chat</span>
        </button>

        <button class="menu-item" @click="handleSelect('rename')">
          <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <span class="menu-label">Rename</span>
        </button>

        <button class="menu-item" @click="handleSelect('archive')">
          <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="21 8 21 21 3 21 3 8"/>
            <rect x="1" y="3" width="22" height="5"/>
            <line x1="10" y1="12" x2="14" y2="12"/>
          </svg>
          <span class="menu-label">Archive</span>
        </button>

        <div class="menu-separator"></div>

        <button class="menu-item danger" @click="handleSelect('delete')">
          <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
          <span class="menu-label">Delete chat</span>
        </button>
      </div>
    </Transition>

    <!-- Backdrop to close menu when clicking outside -->
    <div v-if="isOpen" class="menu-backdrop" @click="closeMenu"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  expanded: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['select']);

const isOpen = ref(false);
const dropdownRef = ref(null);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};

const handleSelect = (action) => {
  emit('select', action);
  closeMenu();
};

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeMenu();
  }
};

// Close menu on Escape key
const handleEscape = (event) => {
  if (event.key === 'Escape') {
    closeMenu();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
.dropdown-menu {
  position: relative;
  margin-top: auto;
}

.menu-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  color: #ececf1;
  cursor: pointer;
  padding: 10px 12px;
  border-radius: 8px;
  transition: all 0.15s ease;
  width: 100%;
  text-align: left;
}

.menu-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.menu-text {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Menu List */
.menu-list {
  position: absolute;
  bottom: 100%;
  left: 8px;
  margin-bottom: 8px;
  background: #2f2f2f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 6px;
  min-width: 240px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 1000;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: none;
  border: none;
  color: #ececf1;
  cursor: pointer;
  padding: 10px 12px;
  border-radius: 8px;
  transition: all 0.15s ease;
  text-align: left;
  font-size: 14px;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item.danger {
  color: #ef4444;
}

.menu-item.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.menu-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.menu-label {
  flex: 1;
  white-space: nowrap;
}

.menu-separator {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 6px 8px;
}

/* Backdrop */
.menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}

/* Transitions */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

/* Light Theme Support */
@media (prefers-color-scheme: light) {
  .menu-btn {
    color: #2f2f2f;
  }

  .menu-btn:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .menu-list {
    background: #ffffff;
    border-color: rgba(0, 0, 0, 0.1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .menu-item {
    color: #2f2f2f;
  }

  .menu-item:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .menu-item.danger {
    color: #dc2626;
  }

  .menu-item.danger:hover {
    background: rgba(220, 38, 38, 0.1);
  }

  .menu-separator {
    background: rgba(0, 0, 0, 0.1);
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .menu-btn,
  .menu-item,
  .menu-fade-enter-active,
  .menu-fade-leave-active {
    transition: none !important;
  }
}
</style>