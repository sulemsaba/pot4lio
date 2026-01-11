<template>
  <main class="chat-container">
    <!-- Chat Header -->
    <header class="chat-header">
      <div class="chat-title">Chat</div>
      <div class="status-orb" :class="reasoningLevel"></div>
    </header>

    <!-- Chat Messages -->
    <section class="chat-messages">
      <MessageBubble
        v-for="(msg, index) in messages"
        :key="index"
        :message="msg"
        :is-user="msg.isUser"
      />
      <div ref="scrollAnchor"></div>
    </section>

    <!-- Input Area -->
    <InputArea
      v-model="currentMessage"
      @send="sendMessage"
      placeholder="Type your message..."
    />

    <!-- Thinking Tray (optional, collapsible) -->
    <transition name="fade">
      <div v-if="isThinking" class="thinking-tray">
        <p>Thinking...</p>
        <div class="progress-bar">
          <div class="progress" :style="{ width: reasoningProgress + '%' }"></div>
        </div>
      </div>
    </transition>
  </main>
</template>

<script>
import { ref, reactive, nextTick } from 'vue'
import MessageBubble from './MessageBubble.vue'
import InputArea from './InputArea.vue'

export default {
  components: { MessageBubble, InputArea },
  setup() {
    const messages = reactive([
      { isUser: false, text: 'Hello! I am your portfolio assistant.' },
    ])
    const currentMessage = ref('')
    const isThinking = ref(false)
    const reasoningLevel = ref('low') // none, low, medium, high, xhigh
    const reasoningProgress = ref(0)
    const scrollAnchor = ref(null)

    const scrollToBottom = () => {
      nextTick(() => {
        scrollAnchor.value?.scrollIntoView({ behavior: 'smooth' })
      })
    }

    const sendMessage = () => {
      if (!currentMessage.value.trim()) return
      messages.push({ isUser: true, text: currentMessage.value })
      currentMessage.value = ''
      scrollToBottom()

      // Simulate AI response
      isThinking.value = true
      reasoningLevel.value = 'medium'
      reasoningProgress.value = 0
      let progressInterval = setInterval(() => {
        reasoningProgress.value += 5
        if (reasoningProgress.value >= 100) {
          clearInterval(progressInterval)
          messages.push({
            isUser: false,
            text: 'Here is the AI response to your message!',
          })
          isThinking.value = false
          reasoningLevel.value = 'none'
          scrollToBottom()
        }
      }, 50)
    }

    return {
      messages,
      currentMessage,
      sendMessage,
      isThinking,
      reasoningLevel,
      reasoningProgress,
      scrollAnchor,
    }
  },
}
</script>

<style scoped>
.chat-container {
  margin-left: 280px; /* Sidebar width */
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #050505; /* Dark mode background */
  color: #fff;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  backdrop-filter: blur(12px);
  background: rgba(33, 33, 33, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-title {
  font-weight: 600;
  font-size: 1rem;
}

.status-orb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: green;
  animation: pulse 2s infinite;
}

.status-orb.none { background: gray; }
.status-orb.low { background: #10a37f; }
.status-orb.medium { background: #10a37f; animation: pulse 2s infinite; }
.status-orb.high { background: #0f7a5f; animation: pulse 1.5s infinite; }
.status-orb.xhigh { background: #0c5a3f; animation: pulse 1s infinite; }

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.4); opacity: 1; }
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: thin;
}

.thinking-tray {
  position: absolute;
  bottom: 72px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  border-radius: 16px;
  text-align: center;
  font-size: 0.9rem;
  z-index: 500;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  margin-top: 6px;
}

.progress {
  height: 100%;
  background: #10a37f;
  border-radius: 6px;
  transition: width 0.1s linear;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-container {
    margin-left: 0;
  }

  .thinking-tray {
    width: 95%;
    bottom: 100px;
  }
}
</style>
