<template>
  <button 
    @click="$emit('toggle-theme')" 
    class="theme-toggle"
    :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
  >
    <div class="toggle-track" :class="{ 'light': theme === 'light' }">
      <div class="toggle-thumb">
        <span class="sun-icon" v-if="theme === 'dark'">☀️</span>
        <span class="moon-icon" v-else>🌙</span>
      </div>
    </div>
    <span class="toggle-label">
      {{ theme === 'dark' ? 'Light Mode' : 'Dark Mode' }}
    </span>
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
  gap: 0.75rem;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.theme-toggle:hover {
  background-color: var(--bg-tertiary);
}

.toggle-track {
  width: 50px;
  height: 26px;
  background-color: var(--bg-tertiary);
  border-radius: 13px;
  position: relative;
  transition: background-color 0.3s;
  border: 1px solid var(--border-color);
}

.toggle-track.light {
  background-color: var(--accent-color);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
  font-size: 12px;
}

.toggle-track.light .toggle-thumb {
  transform: translateX(24px);
}

.sun-icon, .moon-icon {
  line-height: 1;
}

.toggle-label {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .toggle-label {
    display: none;
  }
  
  .theme-toggle {
    padding: 0.25rem;
  }
}
</style>