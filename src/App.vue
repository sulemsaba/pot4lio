<template>
  <div id="app-shell">
    <!-- Left Sidebar -->
    <ChatSidebar />

    <!-- Center Chat Area -->
    <ChatContainer />

    <!-- Right Sidecar Panel -->
    <SidecarPanel />
  </div>
</template>

<script setup>
import ChatSidebar from './components/ChatSidebar.vue'
import ChatContainer from './components/ChatContainer.vue'
import SidecarPanel from './components/SidecarPanel.vue'
</script>

<style>
/* Root app shell */
#app-shell {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #050505;
  overflow: hidden;
}

/* Ensure children behave correctly */
#app-shell > * {
  flex-shrink: 0;
}
</style>
