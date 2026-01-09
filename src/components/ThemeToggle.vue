<template>
  <button class="theme-toggle" @click="toggleTheme">
    {{ isDark ? '🌙 Dark' : '☀️ Light' }}
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(true)

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.setAttribute(
    'data-theme',
    isDark.value ? 'dark' : 'light'
  )
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', 'dark')
})
</script>

<style scoped>
.theme-toggle {
  width: 100%;
  padding: 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
}
</style>
