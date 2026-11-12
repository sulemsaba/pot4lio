<template>
  <div class="contact">
    <h1 class="headline swap reveal" :style="{ '--i': 1 }" tabindex="-1" data-page-title>
      <RichText :text="t.contactTitle" />
    </h1>

    <div class="grid">
      <ChatContact
        v-if="profile.links.whatsapp"
        class="reveal"
        :style="{ '--i': 2 }"
        :name="profile.name"
        :photo="profile.photo"
        :whatsapp="profile.links.whatsapp"
        :t="t"
      />
      <EmailCompose v-if="profile.links.email" class="reveal" :style="{ '--i': 3 }" :email="profile.links.email" :t="t" />
    </div>

    <ul class="extras reveal" :style="{ '--i': 4 }">
      <li v-if="profile.links.whatsapp">
        <span class="extra-label swap">{{ t.phoneLabel }}</span>
        <a :href="`tel:+${digits}`">{{ phone }}</a>
      </li>
      <li v-if="profile.links.github">
        <a :href="profile.links.github" target="_blank" rel="noopener noreferrer"
          >{{ t.github }}<span class="visually-hidden"> ({{ t.opensNewTab }})</span><ArrowIcon
        /></a>
      </li>
      <li v-if="profile.links.linkedin">
        <a :href="profile.links.linkedin" target="_blank" rel="noopener noreferrer"
          >{{ t.linkedin }}<span class="visually-hidden"> ({{ t.opensNewTab }})</span><ArrowIcon
        /></a>
      </li>
      <li><a href="#/cv" class="swap">{{ t.readCv }}</a></li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { profile } from '../content.js'
import ArrowIcon from '../components/ArrowIcon.vue'
import ChatContact from '../components/ChatContact.vue'
import EmailCompose from '../components/EmailCompose.vue'
import RichText from '../components/RichText.vue'

defineProps({
  lang: { type: String, required: true },
  t: { type: Object, required: true },
  focus: { type: String, default: '' },
})

// +255 768 944 291, from the digits in content.js.
const digits = computed(() => profile.links.whatsapp.replace(/\D/g, ''))
const phone = computed(() => {
  const d = digits.value
  return d.length === 12 ? `+${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}` : `+${d}`
})
</script>

<style scoped>
.contact {
  max-width: 64rem;
  margin: 0 auto;
}

.headline {
  margin-bottom: clamp(1.75rem, 4vw, 2.75rem);
}

.grid {
  display: grid;
  gap: var(--gap);
}

@media (min-width: 52rem) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: stretch;
  }
}

.extras {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.75rem;
  margin: 1.5rem 0 0;
  padding: 0;
  list-style: none;
  font-weight: 500;
}

.extras li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
}

.extras a {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.extra-label {
  color: var(--muted);
  font-weight: 400;
}
</style>
