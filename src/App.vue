<template>
  <div id="app" class="app-container">
    <!-- Chat Area -->
    <ChatContainer class="chat-area" />

    <!-- Sidecar Panel -->
    <SidecarPanel class="sidecar-area" />
  </div>
</template>

<script setup>
import ChatContainer from './components/ChatContainer.vue'
import SidecarPanel from './components/SidecarPanel.vue'
</script>

<style>
/* App Container: Chat + Sidecar Layout */
.app-container {
  display: flex;
  height: 100vh;
  background: #050505; /* Dark Mode Background */
  color: #fff;
  overflow: hidden;
}

/* Chat Area grows to fill available space */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Sidecar is fixed width */
.sidecar-area {
  width: 320px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

/* Mobile Responsive: stack chat + sidecar */
@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }

  .sidecar-area {
    width: 100%;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    min-height: 300px;
  }
}
</style>
