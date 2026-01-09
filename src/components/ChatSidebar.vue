<template>
  <aside class="sidebar" :class="{ 'sidebar-mobile': isMobile }">
    <div class="sidebar-header">
      <div class="user-info">
        <div class="avatar">[Y]</div>
        <div>
          <h2>{{ portfolioData.name }}</h2>
          <p class="user-title">{{ portfolioData.title }}</p>
        </div>
      </div>
      <ThemeToggle :theme="theme" @toggle-theme="$emit('toggle-theme')" />
    </div>
    
    <div class="sidebar-content">
      <p class="sidebar-bio">{{ portfolioData.bio }}</p>
      
      <div class="section-nav">
        <h3 class="section-title">Quick Links</h3>
        <ul class="nav-list">
          <li 
            v-for="section in portfolioData.sections" 
            :key="section.id"
            @click="$emit('select-section', section.id)"
            class="nav-item"
            :aria-label="`Navigate to ${section.title}`"
          >
            <span class="nav-icon">›</span>
            {{ section.title }}
          </li>
        </ul>
      </div>
      
      <div class="contact-info">
        <h3 class="section-title">Contact Info</h3>
        <p>[your.email@example.com]</p>
        <div class="social-links">
          <a href="#" class="social-link" aria-label="GitHub">GitHub</a>
          <a href="#" class="social-link" aria-label="LinkedIn">LinkedIn</a>
          <a href="#" class="social-link" aria-label="Twitter">Twitter</a>
        </div>
      </div>
      
      <div class="chat-info">
        <p class="chat-tip">
          <strong>Tip:</strong> Try asking about my skills, projects, or experience.
        </p>
        <button 
          class="clear-chat-btn" 
          @click="$emit('clear-chat')"
          aria-label="Clear chat history"
        >
          Clear Chat
        </button>
      </div>
    </div>
    
    <div class="sidebar-footer">
      <p>© {{ new Date().getFullYear() }} {{ portfolioData.name }}</p>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { portfolioData } from '../data/portfolio-data.js';
import ThemeToggle from './ThemeToggle.vue';

defineProps({
  theme: {
    type: String,
    default: 'dark'
  }
});

defineEmits(['toggle-theme', 'select-section', 'clear-chat']);

const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  background-color: var(--bg-primary);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
  transition: all 0.3s ease;
  overflow-y: auto;
  height: 100vh;
  position: relative;
  z-index: 10;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.avatar {
  width: 40px;
  height: 40px;
  background-color: var(--accent-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
}

.user-info h2 {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.2;
}

.user-title {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.sidebar-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.sidebar-bio {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.nav-list {
  list-style: none;
  margin-bottom: 2rem;
}

.nav-item {
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.nav-item:hover {
  background-color: var(--bg-tertiary);
}

.nav-icon {
  margin-right: 0.75rem;
  color: var(--accent-color);
}

.contact-info {
  margin-bottom: 2rem;
}

.contact-info p {
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  color: var(--accent-color);
  text-decoration: none;
  font-size: 0.875rem;
  transition: opacity 0.2s;
}

.social-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.chat-info {
  padding: 1rem;
  background-color: var(--bg-tertiary);
  border-radius: 0.5rem;
  margin-top: auto;
}

.chat-tip {
  font-size: 0.875rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.clear-chat-btn {
  width: 100%;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.clear-chat-btn:hover {
  background-color: var(--bg-secondary);
}

.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: 60px;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    overflow: visible;
  }
  
  .sidebar-header {
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: none;
  }
  
  .user-info {
    margin-bottom: 0;
  }
  
  .avatar {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }
  
  .user-info h2 {
    font-size: 1rem;
  }
  
  .user-title {
    display: none;
  }
  
  .sidebar-content,
  .sidebar-footer {
    display: none;
  }
  
  .sidebar-mobile .sidebar-content {
    display: block;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background-color: var(--bg-primary);
    height: calc(100vh - 60px);
    z-index: 100;
    padding: 1.5rem;
    overflow-y: auto;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  
  .sidebar-mobile .sidebar-footer {
    display: block;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--bg-primary);
  }
}
</style>