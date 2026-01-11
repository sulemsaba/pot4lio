<template>
  <button class="theme-toggle" @click="toggleTheme" :aria-label="'Toggle theme'">
    <LucideMoon v-if="isDark" class="icon"/>
    <LucideSun v-else class="icon"/>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Moon as LucideMoon, Sun as LucideSun } from 'lucide-vue-next'

const isDark = ref(true)

onMounted(() => {
  const storedTheme = localStorage.getItem('theme')
  if (storedTheme) {
    isDark.value = storedTheme === 'dark'
    document.documentElement.classList.toggle('dark', isDark.value)
  } else {
    document.documentElement.classList.add('dark')
  }
})

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
</script>

<style scoped>
.theme-toggle {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 6px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.theme-toggle:hover {
  background: rgba(16, 163, 127, 0.2);
}

.theme-toggle:focus {
  outline: 2px solid #10A37F;
  outline-offset: 2px;
}

.icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}
</style>
