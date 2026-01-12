<template>
  <button 
    class="theme-toggle" 
    @click="$emit('toggle-theme')" 
    :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="theme === 'dark' ? 'Light mode' : 'Dark mode'"
  >
    <LucideMoon v-if="theme === 'dark'" class="icon"/>
    <LucideSun v-else class="icon"/>
  </button>
</template>

<script setup>
import { Moon as LucideMoon, Sun as LucideSun } from 'lucide-vue-next'

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
  background: var(--surface);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.theme-toggle:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
  border-color: var(--brand-primary);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}

.icon {
  width: 16px;
  height: 16px;
}
</style>
