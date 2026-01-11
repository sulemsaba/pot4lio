<!-- src/App.vue -->
<template>
  <div id="app" :data-theme="theme">
    <!-- Sidebar -->
    <ChatSidebar
      :theme="theme"
      @toggle-theme="toggleTheme"
      @select-section="handleSectionSelect"
    />

    <!-- Main content -->
    <div class="main-content">
      <div class="portfolio-header" v-if="!isChatActive">
        <div class="hero-section">
          <img src="" alt="Your Photo" class="profile-photo" />
          <h1 class="name">Suleiman</h1>
          <h2 class="title">Full Stack Developer</h2>
          <p class="tagline">Building amazing digital experiences</p>
          
          <div class="hero-buttons">
            <button @click="activateChat" class="chat-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="currentColor" stroke-width="2"/>
              </svg>
              Chat with me
            </button>
            <button @click="scrollToProjects" class="projects-button">
              View Projects
            </button>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="quick-stats">
          <div class="stat">
            <span class="number">3+</span>
            <span class="label">Years Experience</span>
          </div>
          <div class="stat">
            <span class="number">20+</span>
            <span class="label">Projects</span>
          </div>
          <div class="stat">
            <span class="number">15+</span>
            <span class="label">Happy Clients</span>
          </div>
        </div>
      </div>

      <!-- Chat Container (only shown when active) -->
      <div v-if="isChatActive" class="chat-wrapper">
        <ChatContainer
          :messages="messages"
          :is-typing="isTyping"
          ref="chatContainer"
          @send="handleChatSend"
          @back-to-portfolio="deactivateChat"
        >
          <!-- Input Area slot -->
          <template #input>
            <InputArea @send-message="sendMessage" />
          </template>
        </ChatContainer>
      </div>
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
const isChatActive = ref(false);
const chatContainer = ref(null);

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  localStorage.setItem('portfolio-theme', theme.value);
};

// Activate chat interface
const activateChat = () => {
  isChatActive.value = true;
  // Show initial greeting if no messages
  if (messages.value.length === 0) {
    simulateBotResponse("Hi! I'm Suleiman. Feel free to ask me about my skills, projects, or experience. How can I help you today?");
  }
};

// Deactivate chat (back to portfolio)
const deactivateChat = () => {
  isChatActive.value = false;
};

// Handle sidebar section selection
const handleSectionSelect = (sectionId) => {
  activateChat();
  const section = portfolioData.sections.find(s => s.id === sectionId);
  if (!section) return;

  addUserMessage(`Tell me about your ${section.title.toLowerCase()}`);
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
  }, 800 + Math.random() * 800);
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

// Handle chat container send
const handleChatSend = (text) => {
  sendMessage(text);
};

// Scroll helper
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value?.$refs?.messagesContainer) {
      const el = chatContainer.value.$refs.messagesContainer;
      el.scrollTop = el.scrollHeight;
    }
  });
};

// Scroll to projects
const scrollToProjects = () => {
  activateChat();
  handleSectionSelect('projects');
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

/* Portfolio Header Styles */
.portfolio-header {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.hero-section {
  text-align: center;
  padding: 3rem 1rem;
}

.profile-photo {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1.5rem;
  border: 4px solid var(--accent-color);
}

.name {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--accent-color), #2563eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title {
  font-size: 1.5rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.tagline {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: var(--text-primary);
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.chat-button, .projects-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.chat-button {
  background-color: var(--accent-color);
  color: white;
}

.chat-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 163, 127, 0.3);
}

.projects-button {
  background-color: transparent;
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.projects-button:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--accent-color);
}

/* Quick Stats */
.quick-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 2rem;
  padding: 2rem;
  background: var(--bg-tertiary);
  border-radius: 16px;
  max-width: 600px;
  margin: 2rem auto;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--accent-color);
}

.label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

/* Chat Wrapper */
.chat-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 768px) {
  #app {
    flex-direction: column;
  }
  
  .main-content {
    height: calc(100vh - 60px);
  }
  
  .portfolio-header {
    padding: 1rem;
  }
  
  .name {
    font-size: 2rem;
  }
  
  .title {
    font-size: 1.25rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .chat-button, .projects-button {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
  
  .quick-stats {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
  }
}
</style>