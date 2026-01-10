<template>
  <button class="sidebar-section" @click="$emit('click')">
    <component :is="icon" class="section-icon" />
    <span v-if="expanded" class="section-label">{{ label }}</span>
  </button>
</template>

<script setup>
const props = defineProps({
  icon: Object,
  label: String,
  expanded: Boolean
});
</script>

<style scoped>
.sidebar-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-primary);
  padding: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  border-radius: 0.5rem;
}

.sidebar-section:hover {
  background-color: var(--bg-tertiary);
}

.section-icon {
  width: 20px;
  height: 20px;
}
</style>
