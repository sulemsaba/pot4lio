<template>
  <div class="dropdown-menu">
    <button class="menu-btn" @click="isOpen = !isOpen">
      <MoreHorizontal />
      <span v-if="expanded">Menu</span>
    </button>
    <ul v-if="isOpen" class="menu-list">
      <li @click="$emit('select', 'move')">Move to Project</li>
      <li @click="$emit('select', 'pin')">Pin Chat</li>
      <li @click="$emit('select', 'archive')">Archive Report</li>
      <li @click="$emit('select', 'delete')">Delete</li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { MoreHorizontal } from 'lucide-vue-next';

const props = defineProps({
  expanded: Boolean
});

const isOpen = ref(false);
</script>

<style scoped>
.dropdown-menu {
  margin-top: auto;
  position: relative;
}

.menu-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0.5rem;
  width: 100%;
}

.menu-btn:hover {
  background-color: var(--bg-tertiary);
}

.menu-list {
  position: absolute;
  bottom: 50px;
  left: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.5rem 0;
  list-style: none;
  min-width: 150px;
  z-index: 100;
}

.menu-list li {
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.menu-list li:hover {
  background-color: var(--bg-tertiary);
}
</style>
