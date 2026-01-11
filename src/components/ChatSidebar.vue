<template>
  <aside class="chat-sidebar">
    <!-- Top Brand / Persona Switcher -->
    <div class="sidebar-top">
      <h1 class="brand">Suleiman Msaba</h1>
      <select v-model="selectedPersona" class="persona-selector">
        <option v-for="p in personas" :key="p" :value="p">{{ p }}</option>
      </select>
    </div>

    <!-- Navigation Links -->
    <nav class="sidebar-nav">
      <button
        v-for="item in navItems"
        :key="item.label"
        :class="['nav-button', { active: activeItem === item.label }]"
        @click="selectItem(item.label)"
      >
        <item.icon class="icon" />
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <!-- Bottom Settings / Theme -->
    <div class="sidebar-bottom">
      <ThemeToggle />
    </div>
  </aside>
</template>

<script>
import { ref } from 'vue'
import { Home, FileText, Code, Mail } from 'lucide-vue-next'
import ThemeToggle from './ThemeToggle.vue'

export default {
  components: { ThemeToggle },
  setup() {
    const activeItem = ref('Chat')
    const selectedPersona = ref('Default')
    const personas = ['Default', 'Creative', 'Executive', 'Nerd']

    const navItems = [
      { label: 'Home', icon: Home },
      { label: 'Chat', icon: FileText },
      { label: 'Sidecar', icon: Code },
      { label: 'Contact', icon: Mail },
    ]

    const selectItem = (label) => {
      activeItem.value = label
    }

    return { activeItem, selectItem, navItems, personas, selectedPersona }
  },
}
</script>

<style scoped>
.chat-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(33, 33, 33, 0.8); /* glass effect */
  backdrop-filter: blur(12px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.sidebar-top {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.brand {
  font-family: 'Söhne', 'Inter', sans-serif;
  font-weight: 600;
  font-size: 1.25rem;
  color: #ffffff;
}

.persona-selector {
  padding: 6px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  font-family: 'Inter', sans-serif;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 16px;
  font-size: 0.95rem;
  color: #ccc;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-button:hover,
.nav-button.active {
  background: rgba(16, 163, 127, 0.2); /* OpenAI Green accent */
  color: #ffffff;
}

.icon {
  width: 18px;
  height: 18px;
}

.sidebar-bottom {
  margin-bottom: 16px;
}

/* Responsive for small screens */
@media (max-width: 768px) {
  .chat-sidebar {
    position: relative;
    width: 100%;
    height: auto;
    flex-direction: row;
    overflow-x: auto;
  }

  .sidebar-nav {
    flex-direction: row;
  }

  .nav-button {
    flex-direction: column;
    font-size: 0.8rem;
    padding: 6px 8px;
  }

  .sidebar-bottom {
    display: none;
  }
}
</style>
