<template>
  <div id="app" :data-theme="theme">
    <ChatSidebar 
      :theme="theme" 
      @toggle-theme="toggleTheme"
      @select-section="handleSectionSelect"
    />
    <div class="main-content">
      <ChatContainer 
        :messages="messages"
        :is-typing="isTyping"
        @send-message="sendMessage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ChatSidebar from './components/ChatSidebar.vue';
import ChatContainer from './components/ChatContainer.vue';
import { portfolioData, getBotResponse } from './data/portfolio-data.js';

const theme = ref('dark');
const messages = ref([]);
const isTyping = ref(false);

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  localStorage.setItem('portfolio-theme', theme.value);
};

const handleSectionSelect = (sectionId) => {
  const section = portfolioData.sections.find(s => s.id === sectionId);
  if (section) {
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: `Tell me about ${section.title.toLowerCase()}`,
      sender: 'user',
      timestamp: new Date()
    };
    messages.value.push(userMessage);
    
    // Add bot response after delay
    setTimeout(() => {
      addBotResponse(section.content);
    }, 300);
  }
};

const sendMessage = (messageText) => {
  if (!messageText.trim()) return;
  
  // Add user message
  const userMessage = {
    id: Date.now(),
    text: messageText,
    sender: 'user',
    timestamp: new Date()
  };
  messages.value.push(userMessage);
  
  // Show typing indicator
  isTyping.value = true;
  
  // Simulate bot thinking delay
  setTimeout(() => {
    const botResponse = getBotResponse(messageText);
    addBotResponse(botResponse);
    isTyping.value = false;
  }, 800 + Math.random() * 800); // Random delay for realism
};

const addBotResponse = (text) => {
  const botMessage = {
    id: Date.now() + 1,
    text: text,
    sender: 'bot',
    timestamp: new Date()
  };
  messages.value.push(botMessage);
  
  // Save to localStorage
  saveMessages();
};

const saveMessages = () => {
  if (messages.value.length > 0) {
    const messagesToSave = messages.value.slice(-50); // Save last 50 messages
    localStorage.setItem('portfolio-chat-history', JSON.stringify(messagesToSave));
  }
};

const loadMessages = () => {
  const saved = localStorage.getItem('portfolio-chat-history');
  if (saved) {
    messages.value = JSON.parse(saved);
  } else {
    // Initial greeting
    setTimeout(() => {
      addBotResponse(portfolioData.greetings[0]);
    }, 500);
  }
  
  // Load theme preference
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme) {
    theme.value = savedTheme;
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
  background-color: var(--bg-secondary);
  overflow: hidden;
}

@media (max-width: 768px) {
  #app {
    flex-direction: column;
  }
  
  .main-content {
    height: calc(100vh - 60px); /* Leave space for mobile sidebar */
  }
}
</style>