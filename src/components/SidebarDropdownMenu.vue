<template>
  <div class="dropdown">
    <button class="dropdown-button" @click="toggle">
      {{ title }}
      <span :class="['arrow', { open: isOpen }]">▾</span>
    </button>
    <ul v-if="isOpen" class="dropdown-items">
      <li v-for="(item, index) in items" :key="index">
        <a :href="item.url" target="_blank" rel="noopener">{{ item.name }}</a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: String,
  items: {
    type: Array,
    default: () => []
  }
})

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
.dropdown {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dropdown-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s ease;
}

.dropdown-button:hover {
  background: rgba(16, 163, 127, 0.2);
}

.arrow {
  transition: transform 0.3s ease;
}

.arrow.open {
  transform: rotate(180deg);
}

.dropdown-items {
  list-style: none;
  padding-left: 12px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dropdown-items li a {
  color: #fff;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.dropdown-items li a:hover {
  color: #10A37F;
}

/* Responsive: collapse spacing on small screens */
@media (max-width: 768px) {
  .dropdown-items {
    padding-left: 0;
    gap: 4px;
  }

  .dropdown-button {
    padding: 4px 8px;
  }
}
</style>
