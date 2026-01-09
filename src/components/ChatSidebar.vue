<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1 class="logo">My Portfolio</h1>
    </div>

    <nav class="sidebar-nav">
      <button class="nav-item">About Me</button>
      <button class="nav-item">Projects</button>
      <button class="nav-item">Skills</button>
      <button class="nav-item">Contact</button>
    </nav>

    <div class="sidebar-footer">
      <ThemeToggle />
    </div>
  </aside>
</template>

<script setup>
import ThemeToggle from './ThemeToggle.vue'
</script>

<style scoped>
.sidebar {
  width: 260px;
  background-color: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  border-right: 1px solid var(--border-color);
}

.sidebar-header {
  margin-bottom: 1rem;
}

.logo {
  font-size: 1.1rem;
  font-weight: 600;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  background: transparent;
  border: none;
  color: var(--text-primary);
  padding: 0.6rem 0.8rem;
  border-radius: 6px;
  text-align: left;
  cursor: pointer;
}

.nav-item:hover {
  background-color: var(--bg-hover);
}

.sidebar-footer {
  margin-top: auto;
}
</style>
