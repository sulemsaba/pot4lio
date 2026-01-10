<template>
  <aside class="sidebar" :class="{ expanded: isExpanded }">
    <!-- Profile / Logo -->
    <div class="sidebar-top">
      <img src="" alt="Profile" class="profile-pic" />
      <h1 v-if="isExpanded" class="sidebar-title">Portfolio GPT</h1>
      <button class="expand-btn" @click="isExpanded = !isExpanded">
        <MoreHorizontal />
      </button>
    </div>

    <!-- Sections -->
    <div class="sidebar-sections">
      <SidebarSection
        v-for="section in sections"
        :key="section.id"
        :icon="section.icon"
        :label="section.label"
        :expanded="isExpanded"
        @click="section.action"
      />
    </div>

    <!-- Top actions -->
    <div class="sidebar-actions">
      <SidebarSection
        v-for="action in actions"
        :key="action.id"
        :icon="action.icon"
        :label="action.label"
        :expanded="isExpanded"
        @click="action.action"
      />
    </div>

    <!-- Dropdown Menu -->
    <SidebarDropdownMenu
      :expanded="isExpanded"
      @select="handleMenuAction"
    />
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import SidebarSection from './SidebarSection.vue';
import SidebarDropdownMenu from './SidebarDropdownMenu.vue';
import { Home, Search, FileText, Image, Users, Share2, MoreHorizontal } from 'lucide-vue-next';

// Collapsible sidebar
const isExpanded = ref(false);

// Sections for main navigation
const sections = [
  { id: 'chat', label: 'Chat', icon: Home, action: () => console.log('Chat clicked') },
  { id: 'new-chat', label: 'New Chat', icon: FileText, action: () => console.log('New Chat') },
  { id: 'search', label: 'Search', icon: Search, action: () => console.log('Search') },
  { id: 'create-image', label: 'Create Image', icon: Image, action: () => console.log('Create Image') }
];

// Top action buttons
const actions = [
  { id: 'share', label: 'Share', icon: Share2, action: () => console.log('Share clicked') },
  { id: 'team', label: 'Team', icon: Users, action: () => console.log('Add People clicked') }
];

// Dropdown menu handler
const handleMenuAction = (action) => {
  console.log('Menu Action:', action);
};
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 60px;
  background-color: var(--bg-primary);
  height: 100vh;
  padding: 0.5rem;
  transition: width 0.3s;
}

.sidebar.expanded {
  width: 200px;
}

.sidebar-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  position: relative;
}

.profile-pic {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.sidebar-title {
  font-size: 0.875rem;
  font-weight: bold;
}

.expand-btn {
  position: absolute;
  right: 0;
  top: 0;
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
}

.sidebar-sections,
.sidebar-actions {
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
  gap: 0.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    flex-direction: row;
    overflow-x: auto;
  }

  .sidebar.expanded {
    width: 100%;
  }

  .sidebar-top,
  .sidebar-sections,
  .sidebar-actions {
    flex-direction: row;
    gap: 0.5rem;
  }
}
</style>
