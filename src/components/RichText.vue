<template>
  <template v-for="(part, index) in parts" :key="index"
    ><strong v-if="part.strong">{{ part.text }}</strong
    ><template v-else>{{ part.text }}</template></template
  >
</template>

<script setup>
import { computed } from 'vue'

// Shows text from content.js where **words like this** are a little stronger.
const props = defineProps({ text: { type: String, required: true } })

const parts = computed(() =>
  props.text
    .split(/\*\*(.+?)\*\*/g)
    .map((text, index) => ({ text, strong: index % 2 === 1 }))
    .filter((part) => part.text),
)
</script>
