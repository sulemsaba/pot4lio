<template>
  <div class="sidebar-section">
    <h2 class="section-title">{{ title }}</h2>
    <ul class="section-items">
      <li v-for="(item, index) in items" :key="index" class="section-item">
        <a :href="item.url" target="_blank" rel="noopener" class="item-link">
          {{ item.name }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  items: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #10A37F;
  margin-bottom: 4px;
}

.section-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-item a {
  text-decoration: none;
  color: #fff;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.section-item a:hover {
  color: #10A37F;
}

/* Responsive: horizontal on small screens */
@media (max-width: 768px) {
  .sidebar-section {
    display: flex;
    flex-direction: row;
    gap: 12px;
    align-items: center;
  }

  .section-items {
    flex-direction: row;
    gap: 12px;
  }
}
</style>
