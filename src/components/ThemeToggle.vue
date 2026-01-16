<template>
  <button 
    class="theme-toggle" 
    @click="$emit('toggle-theme')" 
    :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="theme === 'dark' ? 'Light mode' : 'Dark mode'"
    :class="{ 'is-dark': theme === 'dark', 'is-light': theme !== 'dark' }"
  >
    <span class="toggle-track">
      <span class="toggle-thumb">
        <span class="icon-wrapper">
          <!-- Sun Icon -->
          <svg 
            class="icon sun-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2"/>
            <path d="M12 20v2"/>
            <path d="m4.93 4.93 1.41 1.41"/>
            <path d="m17.66 17.66 1.41 1.41"/>
            <path d="M2 12h2"/>
            <path d="M20 12h2"/>
            <path d="m6.34 17.66-1.41 1.41"/>
            <path d="m19.07 4.93-1.41 1.41"/>
          </svg>
          <!-- Moon Icon -->
          <svg 
            class="icon moon-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
          </svg>
        </span>
      </span>
    </span>
  </button>
</template>

<script setup>
defineProps({
  theme: {
    type: String,
    default: 'dark'
  }
})

defineEmits(['toggle-theme'])
</script>

<style scoped>
.theme-toggle {
  --toggle-width: 52px;
  --toggle-height: 28px;
  --thumb-size: 22px;
  --thumb-offset: 3px;
  
  position: relative;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.toggle-track {
  position: relative;
  width: var(--toggle-width);
  height: var(--toggle-height);
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  border-radius: var(--toggle-height);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 1px 2px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

/* Light mode track */
.is-light .toggle-track {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.1);
}

.toggle-thumb {
  position: absolute;
  top: var(--thumb-offset);
  left: var(--thumb-offset);
  width: var(--thumb-size);
  height: var(--thumb-size);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 50%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.25),
    0 1px 2px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Light mode thumb position */
.is-light .toggle-thumb {
  left: calc(var(--toggle-width) - var(--thumb-size) - var(--thumb-offset));
  background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
  box-shadow: 
    0 2px 8px rgba(251, 191, 36, 0.4),
    0 1px 2px rgba(0, 0, 0, 0.1);
}

.icon-wrapper {
  position: relative;
  width: 14px;
  height: 14px;
}

.icon {
  position: absolute;
  top: 0;
  left: 0;
  width: 14px;
  height: 14px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark mode: show moon, hide sun */
.is-dark .moon-icon {
  opacity: 1;
  transform: rotate(0deg) scale(1);
  color: #6366f1;
}

.is-dark .sun-icon {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
  color: #f59e0b;
}

/* Light mode: show sun, hide moon */
.is-light .sun-icon {
  opacity: 1;
  transform: rotate(0deg) scale(1);
  color: #f59e0b;
}

.is-light .moon-icon {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
  color: #6366f1;
}

/* Hover effects */
.theme-toggle:hover .toggle-track {
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.3);
}

.is-light.theme-toggle:hover .toggle-track {
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    0 2px 12px rgba(59, 130, 246, 0.4);
}

.theme-toggle:hover .toggle-thumb {
  transform: scale(1.05);
}

.is-light.theme-toggle:hover .toggle-thumb {
  box-shadow: 
    0 2px 12px rgba(251, 191, 36, 0.6),
    0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Focus styles */
.theme-toggle:focus-visible .toggle-track {
  outline: 2px solid var(--brand-primary, #3b82f6);
  outline-offset: 2px;
}

/* Active/pressed state */
.theme-toggle:active .toggle-thumb {
  transform: scale(0.95);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .toggle-track,
  .toggle-thumb,
  .icon {
    transition: none;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .theme-toggle {
    --toggle-width: 48px;
    --toggle-height: 26px;
    --thumb-size: 20px;
  }
  
  .icon-wrapper,
  .icon {
    width: 12px;
    height: 12px;
  }
}
</style>
