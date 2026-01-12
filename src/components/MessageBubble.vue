<template>
  <div :class="['message-row', fromUser ? 'user-row' : 'ai-row']">
    <div class="avatar-wrapper">
      <div v-if="!fromUser" class="ai-avatar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
        </svg>
      </div>
      <div v-else class="user-avatar">U</div>
    </div>

    <div class="content-wrapper">
      <div v-if="!fromUser" class="sender-name">ChatGPT</div>
      <div :class="['message-body', fromUser ? 'user-pill' : 'ai-frameless']">
        <slot>
          <p>{{ text }}</p>
        </slot>
      </div>

      <div v-if="!fromUser" class="utility-toolbar">
        <button class="tool-btn" title="Copy"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 4v8H4V4h4zm12 12v8h-4v-8h4zm-6-6h4v8h-4v-8zm0-6h4v4h-4V4z" stroke-width="2"/></svg></button>
        <button class="tool-btn">👍</button>
        <button class="tool-btn">👎</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: String,
  fromUser: Boolean
})
</script>

<style scoped>
/* GPT-5 Layout Spacing */
.message-row {
  display: flex;
  gap: 16px;
  padding: 24px 0;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.user-row {
  flex-direction: row-reverse;
}

/* Avatar Styles */
.avatar-wrapper {
  flex-shrink: 0;
  width: 36px;
}

.ai-avatar {
  width: 32px;
  height: 32px;
  background: #10a37f;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #6741d9;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

/* Content Area */
.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sender-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
}

/* AI Frameless Style (The "Gradient UI" Secret) */
.ai-frameless {
  font-size: 16px;
  line-height: 1.6;
  color: #ececec;
  background: transparent; /* No bubble */
  padding: 0;
}

/* User Pill Style */
.user-pill {
  align-self: flex-end;
  background-color: #2f2f2f; /* Deep Zinc */
  color: #fff;
  padding: 12px 20px;
  border-radius: 24px;
  font-size: 15px;
  max-width: 90%;
}

/* Hover Utilities */
.utility-toolbar {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
  margin-top: 8px;
}

.message-row:hover .utility-toolbar {
  opacity: 1;
}

.tool-btn {
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.tool-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

/* Mobile Adjustments */
@media (max-width: 768px) {
  .message-row {
    padding: 16px 20px;
    gap: 12px;
  }
}
</style>