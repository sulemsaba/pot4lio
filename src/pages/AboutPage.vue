<template>
  <div class="about">
    <section class="card story reveal" :style="{ '--i': 1 }" aria-labelledby="about-title">
      <h1 id="about-title" class="headline swap" tabindex="-1" data-page-title><RichText :text="t.aboutPageTitle" /></h1>
      <hr class="rule" />
      <div class="parts">
        <div v-for="part in t.story" :key="part.label">
          <h2 class="tag swap">{{ part.label }}</h2>
          <p class="story-text swap"><RichText :text="part.text" /></p>
        </div>
      </div>
    </section>

    <section class="card reveal" :style="{ '--i': 2 }" aria-labelledby="experience-title">
      <h2 id="experience-title" class="tag swap">{{ t.experience }}</h2>
      <ol class="rows">
        <li v-for="job in experience" :key="job.org" class="row">
          <span class="row-main">{{ job.org }}</span>
          <span class="row-sub swap">{{ job.role[lang] }}</span>
          <span class="row-date swap">{{ job.period[lang] }}</span>
        </li>
      </ol>
    </section>

    <section class="card reveal" :style="{ '--i': 3 }" aria-labelledby="education-title">
      <h2 id="education-title" class="tag swap">{{ t.education }}</h2>
      <ul class="rows">
        <li v-for="school in education" :key="school.org" class="row">
          <span class="row-main">{{ school.org }}</span>
          <span class="row-sub swap">{{ school.detail[lang] }}</span>
          <span class="row-date swap">{{ school.period[lang] }}</span>
        </li>
      </ul>
    </section>

    <section class="card reveal" :style="{ '--i': 4 }" aria-labelledby="certificates-title">
      <h2 id="certificates-title" class="tag swap">{{ t.certificates }}</h2>
      <ul class="rows">
        <li v-for="cert in certificates" :key="cert.name.en" class="row">
          <span class="row-main swap">{{ cert.name[lang] }}</span>
          <span class="row-sub swap">{{ cert.issuer[lang] }}</span>
        </li>
      </ul>
    </section>

    <section class="card skills reveal" :style="{ '--i': 5 }" aria-labelledby="skills-title">
      <h2 id="skills-title" class="tag swap">{{ t.skills }}</h2>
      <ul class="rows rows--grid">
        <li v-for="skill in skills" :key="skill.name.en" class="row">
          <span class="row-main swap">{{ skill.name[lang] }}</span>
          <span class="row-sub row-sub--wide swap">{{ skill.items[lang] }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { certificates, education, experience, skills } from '../content.js'
import RichText from '../components/RichText.vue'

defineProps({
  lang: { type: String, required: true },
  t: { type: Object, required: true },
  focus: { type: String, default: '' },
})
</script>

<style scoped>
.about {
  display: grid;
  gap: var(--gap);
}

@media (min-width: 60rem) {
  .about {
    grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
    align-items: start;
  }

  .story {
    grid-row: span 3;
    align-self: stretch;
  }

  .skills {
    grid-column: 1 / -1;
  }
}

.story {
  padding: clamp(1.5rem, 3vw, 2.25rem);
}

.rule {
  width: 100%;
  height: 1px;
  margin: clamp(1.25rem, 2.5vw, 1.75rem) 0;
  border: 0;
  background: var(--line);
}

.parts {
  display: grid;
  gap: 1.75rem;
}

.story-text {
  max-width: 36rem;
  margin: 0.375rem 0 0;
  color: var(--muted);
  font-size: clamp(1.0625rem, 0.98rem + 0.3vw, 1.1875rem);
  line-height: 1.6;
  text-wrap: pretty;
}

.story-text :deep(strong) {
  color: var(--ink);
  font-weight: 500;
}

/* Lists: name, then detail, the date to the right. */
.rows {
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0;
}

.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  column-gap: 1rem;
  padding: 0.875rem 0;
  border-top: 1px solid var(--line);
}

.row:first-child {
  border-top: 0;
}

.row-main {
  font-weight: 500;
}

.row-sub {
  grid-column: 1;
  color: var(--muted);
  font-size: 0.9375rem;
}

.row-sub--wide {
  grid-column: 1 / -1;
}

.row-date {
  grid-row: 1;
  grid-column: 2;
  color: var(--muted);
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}

@media (min-width: 48rem) {
  .rows--grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 2.5rem;
  }

  .rows--grid .row:nth-child(2) {
    border-top: 0;
  }
}
</style>
