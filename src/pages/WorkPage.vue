<template>
  <div class="work">
    <h1 class="headline swap" :class="{ reveal: !focus }" :style="{ '--i': 1 }" tabindex="-1" data-page-title>
      <RichText :text="t.workTitle" />
    </h1>
    <WorkGallery :class="{ reveal: !focus }" :style="{ '--i': 2 }" :projects="projects" :lang="lang" :t="t" :focus="focus" />
    <p class="note swap">{{ t.privateWork }}</p>
    <NeedsPicker class="closing" :lang="lang" :t="t" id="work-needs" />
  </div>
</template>

<script setup>
import { projects } from '../content.js'
import NeedsPicker from '../components/NeedsPicker.vue'
import RichText from '../components/RichText.vue'
import WorkGallery from '../components/WorkGallery.vue'

defineProps({
  lang: { type: String, required: true },
  t: { type: Object, required: true },
  focus: { type: String, default: '' },
})
</script>

<style scoped>
.work {
  max-width: 68rem;
  margin: 0 auto;
}

.headline {
  margin-bottom: clamp(1.75rem, 4vw, 2.75rem);
}

.closing {
  margin-top: clamp(4.5rem, 9vw, 7rem);
}

.note {
  max-width: 36rem;
  margin: clamp(3rem, 7vw, 4.5rem) 0 0;
  color: var(--muted);
  font-size: 0.875rem;
}
</style>
