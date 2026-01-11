<template>
  <div
    :class="['message-bubble', fromUser ? 'user' : 'ai']"
  >
    <p>{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  text: String,
  fromUser: Boolean
})
</script>

<style scoped>
.message-bubble {
  max-width: 75%;
  padding: 12px 16px;
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
  border-radius: 16px;
  transition: background 0.3s, transform 0.2s;
}

/* AI Bubble */
.message-bubble.ai {
  background: linear-gradient(135deg, #0d0d0d, #212121);
  color: #fff;
  align-self: flex-start;
  border-top-left-radius: 4px;
  border-top-right-radius: 16px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

/* User Bubble */
.message-bubble.user {
  background: rgba(16, 163, 127, 0.1);
  color: #10a37f;
  align-self: flex-end;
  border-top-left-radius: 16px;
  border-top-right-radius: 4px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

/* Bubble hover effect */
.message-bubble:hover {
  transform: scale(1.02);
}

/* Responsive for mobile */
@media (max-width: 768px) {
  .message-bubble {
    max-width: 90%;
    font-size: 14px;
    padding: 10px 14px;
  }
}
</style>
