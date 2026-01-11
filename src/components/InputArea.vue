<template>
  <form class="input-area" @submit.prevent="sendMessage">
    <input
      type="text"
      v-model="message"
      placeholder="Type a message..."
      @keydown.enter="sendMessage"
      class="chat-input"
    />
    <button type="submit" class="send-btn">Send</button>
  </form>
</template>

<script setup>
import { ref, defineEmits } from 'vue'

const message = ref('')
const emit = defineEmits(['send'])

const sendMessage = () => {
  if (!message.value.trim()) return
  emit('send', message.value.trim())
  message.value = ''
}
</script>

<style scoped>
.input-area {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  position: sticky;
  bottom: 0;
  width: 100%;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  align-items: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  font-size: 15px;
  border: none;
  outline: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  caret-color: #10a37f;
}

.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.send-btn {
  padding: 10px 16px;
  font-size: 15px;
  font-weight: 500;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #10a37f, #0d8c6c);
  transition: transform 0.2s, filter 0.2s;
}

.send-btn:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

/* Responsive for mobile */
@media (max-width: 768px) {
  .input-area {
    padding: 8px 12px;
  }
  .chat-input {
    font-size: 14px;
    padding: 10px 12px;
  }
  .send-btn {
    font-size: 14px;
    padding: 8px 12px;
  }
}
</style>
