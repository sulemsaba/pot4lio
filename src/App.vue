<!-- src/App.vue -->
<template>
  <div id="app" :data-theme="theme">
    <!-- Sidebar -->
    <ChatSidebar
      :theme="theme"
      @toggle-theme="toggleTheme"
      @select-section="handleSectionSelect"
    />

    <!-- Main chat area -->
    <div class="main-content">
      <ChatContainer
        :messages="messages"
        :is-typing="isTyping"
        ref="chatContainer"
      >
        <!-- Input Area slot -->
        <InputArea @send-message="sendMessage" />
      </ChatContainer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import ChatSidebar from './components/ChatSidebar.vue';
import ChatContainer from './components/ChatContainer.vue';
import InputArea from './components/InputArea.vue';
import { portfolioData, getBotResponse } from './data/portfolio-data.js';

const theme = ref('dark');
const messages = ref([]);
const isTyping = ref(false);

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  localStorage.setItem('portfolio-theme', theme.value);
};

// Handle sidebar section selection
const handleSectionSelect = (sectionId) => {
  const section = portfolioData.sections.find(s => s.id === sectionId);
  if (!section) return;

  addUserMessage(`Tell me about ${section.title.toLowerCase()}`);
  simulateBotResponse(section.content);
};

// Add user message
const addUserMessage = (text) => {
  messages.value.push({
    id: Date.now(),
    sender: 'user',
    text,
    timestamp: new Date(),
  });
  scrollToBottom();
};

// Simulate bot response
const simulateBotResponse = (text) => {
  isTyping.value = true;
  setTimeout(() => {
    messages.value.push({
      id: Date.now() + 1,
      sender: 'bot',
      text,
      timestamp: new Date(),
    });
    isTyping.value = false;
    scrollToBottom();
    saveMessages();
  }, 800 + Math.random() * 800); // random delay
};

// Handle input area sending message
const sendMessage = (text) => {
  if (!text.trim()) return;
  addUserMessage(text);

  // Bot thinking
  isTyping.value = true;
  setTimeout(() => {
    const botText = getBotResponse(text);
    simulateBotResponse(botText);
  }, 600 + Math.random() * 600);
};

// Scroll helper
const chatContainer = ref(null);
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value?.$refs?.messagesContainer) {
      const el = chatContainer.value.$refs.messagesContainer;
      el.scrollTop = el.scrollHeight;
    }
  });
};

// Persist messages & theme
const saveMessages = () => {
  localStorage.setItem('portfolio-chat-history', JSON.stringify(messages.value.slice(-50)));
};

const loadMessages = () => {
  const saved = localStorage.getItem('portfolio-chat-history');
  if (saved) messages.value = JSON.parse(saved);

  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme) theme.value = savedTheme;

  // Initial greeting if no messages
  if (messages.value.length === 0) {
    simulateBotResponse(portfolioData.greetings[0]);
  }
};

onMounted(() => {
  loadMessages();
});
</script>

<style scoped>
#app {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-secondary);
}

@media (max-width: 768px) {
  #app {
    flex-direction: column;
  }
  
  .main-content {
    height: calc(100vh - 60px); /* adjust if sidebar height changes */
  }
}
</style>
