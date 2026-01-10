<template>
  <button 
    @click="$emit('toggle-theme')" 
    class="theme-toggle"
    :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
    :title="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
  >
    <!-- Sun Icon (Light Mode) -->
    <svg 
      v-if="theme === 'dark'" 
      class="theme-icon sun-icon"
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2"
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
    
    <!-- Moon Icon (Dark Mode) -->
    <svg 
      v-else
      class="theme-icon moon-icon"
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2"
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  </button>
</template>

<script setup>
defineProps({
  theme: {
    type: String,
    default: 'dark'
  }
});

defineEmits(['toggle-theme']);
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #8e8ea0;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.15s ease;
  width: 40px;
  height: 40px;
  position: relative;
}

.theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #ececf1;
}

.theme-toggle:active {
  transform: scale(0.95);
}

.theme-icon {
  width: 20px;
  height: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Sun icon animation on hover */
.theme-toggle:hover .sun-icon {
  transform: rotate(45deg);
}

/* Moon icon animation on hover */
.theme-toggle:hover .moon-icon {
  transform: rotate(-15deg);
}

/* Light theme styles */
@media (prefers-color-scheme: light) {
  .theme-toggle {
    color: #6e6e80;
  }
  
  .theme-toggle:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: #2f2f2f;
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .theme-toggle {
    width: 36px;
    height: 36px;
    padding: 6px;
  }
  
  .theme-icon {
    width: 18px;
    height: 18px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .theme-toggle,
  .theme-icon {
    transition: none !important;
  }
  
  .theme-toggle:hover .sun-icon,
  .theme-toggle:hover .moon-icon {
    transform: none !important;
  }
}

/* Focus styles for accessibility */
.theme-toggle:focus-visible {
  outline: 2px solid rgba(217, 217, 227, 0.3);
  outline-offset: 2px;
}
</style>