<template>
  <div class="app">
    <ChatSidebar />
    <ChatContainer />
  </div>
</template>

<script setup>
import ChatSidebar from './components/ChatSidebar.vue'
import ChatContainer from './components/ChatContainer.vue'
</script>

<style>
/* Root layout only (global handled in styles.css) */
.app {
  display: flex;
  height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
</style>
