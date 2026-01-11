<!-- Add this to the template section of ChatContainer.vue -->
<template>
  <section class="chat-container" :class="{ 'light-theme': isLightTheme }">
    <!-- Header with back button -->
    <div class="chat-header">
      <button @click="$emit('back-to-portfolio')" class="back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back to Portfolio
      </button>
      <h2 class="chat-title">Chat with Suleiman</h2>
    </div>
    
    <!-- Rest of your existing ChatContainer template -->
    ...
  </section>
</template>

<script setup>
// Add this to your defineEmits
defineEmits(['send', 'back-to-portfolio']);
// Rest of your script remains the same
</script>

<style scoped>
/* Add these styles */
.chat-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--bg-tertiary);
}

.back-button {
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.chat-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}
</style>