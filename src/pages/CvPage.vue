<template>
  <div class="cv-page">
    <div class="bar reveal" :style="{ '--i': 1 }">
      <div>
        <h1 class="headline swap" tabindex="-1" data-page-title><RichText :text="t.cvPageTitle" /></h1>
        <p v-if="t.cvLanguageNote" class="note swap">{{ t.cvLanguageNote }}</p>
      </div>
      <div class="actions">
        <a class="button button--ink" :href="profile.links.cv" download>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1.75v8.5M3.25 6.5 7 10.25l3.75-3.75M2 12.5h10" /></svg>
          <span class="swap">{{ t.downloadPdf }}</span>
        </a>
        <button type="button" class="button" @click="print"><span class="swap">{{ t.print }}</span></button>
      </div>
    </div>

    <!-- The CV itself, as a sheet of paper. It stays in English, like the PDF. -->
    <article class="sheet reveal" :style="{ '--i': 2 }" lang="en" aria-label="Curriculum vitae">
      <header class="sheet-head">
        <div class="cv-who">
          <h2 class="cv-name">{{ cv.name }}</h2>
          <p class="cv-headline">
            <span v-for="line in cv.headline" :key="line">{{ line }}</span>
          </p>
        </div>
        <div class="cv-reach">
          <ul v-for="(group, g) in cv.contact" :key="g" class="cv-contact">
            <li v-for="item in group" :key="item.text">
              <a v-if="item.href" :href="item.href">{{ item.text }}</a>
              <span v-else>{{ item.text }}</span>
            </li>
          </ul>
        </div>
      </header>

      <section class="cv-section">
        <h3 class="cv-heading">Profile</h3>
        <p class="cv-text">{{ cv.profile }}</p>
      </section>

      <section class="cv-section">
        <h3 class="cv-heading">Experience</h3>
        <div v-for="job in cv.experience" :key="job.role" class="cv-entry">
          <p class="cv-line">
            <strong>{{ job.role }}</strong>
            <span class="cv-dates">{{ job.dates }}</span>
          </p>
          <p class="cv-org">{{ job.org }}</p>
          <ul class="cv-bullets">
            <li v-for="bullet in job.bullets" :key="bullet">{{ bullet }}</li>
          </ul>
        </div>
      </section>

      <section class="cv-section">
        <h3 class="cv-heading">Projects</h3>
        <ul class="cv-projects">
          <li v-for="project in cv.projects" :key="project.name">
            <strong>{{ project.name }}</strong>
            <span>{{ project.what }}</span>
            <span v-if="project.tech" class="cv-muted">{{ project.tech }}</span>
          </li>
        </ul>
        <p class="cv-note">{{ cv.projectsNote }}</p>
      </section>

      <section class="cv-section">
        <h3 class="cv-heading">Education</h3>
        <div v-for="item in cv.education" :key="item.degree" class="cv-entry cv-entry--tight">
          <p class="cv-line">
            <strong>{{ item.degree }}</strong>
            <span class="cv-dates">{{ item.dates }}</span>
          </p>
          <p class="cv-org">{{ item.school }}</p>
        </div>
      </section>

      <section class="cv-section">
        <h3 class="cv-heading">Skills</h3>
        <dl class="cv-pairs">
          <template v-for="[label, items] in cv.skills" :key="label">
            <dt>{{ label }}</dt>
            <dd>{{ items }}</dd>
          </template>
        </dl>
      </section>

      <div class="cv-split">
        <section class="cv-section">
          <h3 class="cv-heading">Certifications</h3>
          <ul class="cv-bullets">
            <li v-for="item in cv.certifications" :key="item">{{ item }}</li>
          </ul>
        </section>
        <section class="cv-section">
          <h3 class="cv-heading">Languages</h3>
          <p class="cv-text">{{ cv.languages }}</p>
          <h3 class="cv-heading cv-heading--next">Interests</h3>
          <p class="cv-text">{{ cv.interests }}</p>
        </section>
      </div>
    </article>
  </div>
</template>

<script setup>
import { cv } from '../cv.js'
import { profile } from '../content.js'
import RichText from '../components/RichText.vue'

defineProps({
  lang: { type: String, required: true },
  t: { type: Object, required: true },
  focus: { type: String, default: '' },
})

const print = () => window.print()
</script>

<style scoped>
.cv-page {
  max-width: 50rem;
  margin: 0 auto;
}

.bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.25rem 2rem;
  margin-bottom: clamp(1.5rem, 3.5vw, 2.5rem);
}

.note {
  margin: 0.5rem 0 0;
  color: var(--muted);
  font-size: 0.9375rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
}

/* The sheet: paper proportions, quiet type, a soft lift off the page. */
.sheet {
  padding: clamp(1.5rem, 6vw, 4rem) clamp(1.25rem, 6vw, 4.25rem);
  border: 1px solid var(--line);
  border-radius: clamp(0.75rem, 1.4vw, 1.125rem);
  background: var(--paper);
  box-shadow:
    0 1px 2px rgb(0 0 0 / 0.04),
    0 2rem 4rem -2rem rgb(17 17 17 / 0.22);
  font-size: 0.9375rem;
  line-height: 1.55;
}

/* Header: name and title, then the contact details in two small groups.
   Stacked on phones; side by side on wider screens and on paper. */
.sheet-head {
  display: grid;
  gap: 1.25rem;
  padding-bottom: 0.5rem;
}

@media (min-width: 44rem) {
  .sheet-head {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 2rem;
  }

  .cv-reach {
    text-align: right;
  }
}

.cv-reach {
  display: grid;
  gap: 0.625rem;
}

.cv-name {
  margin: 0;
  font-size: clamp(1.875rem, 1.5rem + 1.4vw, 2.5rem);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.cv-headline {
  display: flex;
  flex-direction: column;
  margin: 0.5rem 0 0;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.4;
}

/* Contact details: one per line, no separators. */
.cv-contact {
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--muted);
  font-size: 0.875rem;
  line-height: 1.55;
}

.cv-contact a {
  color: inherit;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.cv-contact a:hover {
  color: var(--ink);
  text-decoration: underline;
}

.cv-section {
  margin-top: 1.375rem;
}

/* Section headings: small capitals with a rule running to the edge. */
.cv-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 0.625rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.cv-heading::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--line);
}

.cv-heading--next {
  margin-top: 1rem;
}

.cv-text {
  margin: 0;
  text-wrap: pretty;
}

.cv-entry + .cv-entry {
  margin-top: 0.875rem;
}

.cv-entry--tight + .cv-entry--tight {
  margin-top: 0.5rem;
}

/* Role on the left, dates on the right: the eye finds both at once. */
.cv-line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0 1rem;
  margin: 0;
}

.cv-dates {
  color: var(--muted);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.cv-org {
  margin: 0;
  color: var(--muted);
}

.cv-bullets {
  margin: 0.375rem 0 0;
  padding-left: 1.0625rem;
}

.cv-bullets li {
  padding-left: 0.125rem;
  text-wrap: pretty;
}

.cv-bullets li + li {
  margin-top: 0.125rem;
}

.cv-bullets li::marker {
  color: var(--faint);
}

.cv-projects {
  display: grid;
  gap: 0.375rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cv-projects li {
  text-wrap: pretty;
}

.cv-projects strong {
  margin-right: 0.375rem;
}

.cv-projects .cv-muted::before {
  content: '·';
  margin: 0 0.375rem;
}

.cv-muted,
.cv-note {
  color: var(--muted);
}

.cv-note {
  margin: 0.375rem 0 0;
  font-size: 0.8125rem;
}

.cv-pairs {
  display: grid;
  gap: 0.125rem 1.25rem;
  margin: 0;
}

.cv-pairs dt {
  font-weight: 600;
}

.cv-pairs dd {
  margin: 0 0 0.375rem;
  text-wrap: pretty;
}

@media (min-width: 44rem) {
  .cv-pairs {
    grid-template-columns: 10.5rem minmax(0, 1fr);
  }

  .cv-pairs dd {
    margin: 0;
  }
}

.cv-split {
  display: grid;
  gap: 0 2rem;
}

@media (min-width: 44rem) {
  .cv-split {
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  }
}

/* Printing gives just the sheet: A4, black on white, one page. */
@media print {
  .bar {
    display: none;
  }

  .sheet {
    padding: 0;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    background: #fff;
    color: #000;
    font-size: 9.2pt;
    line-height: 1.36;
  }

  .sheet-head {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1.5rem;
    padding-bottom: 0.25rem;
  }

  .cv-reach {
    gap: 0.35rem;
    text-align: right;
  }

  .cv-contact {
    font-size: 8.8pt;
    line-height: 1.4;
  }

  .cv-headline {
    margin-top: 0.3rem;
  }

  .cv-name {
    font-size: 21pt;
  }

  .cv-bullets {
    margin-top: 0.2rem;
  }

  .cv-bullets li + li {
    margin-top: 0;
  }

  .cv-entry + .cv-entry {
    margin-top: 0.55rem;
  }

  .cv-projects {
    gap: 0.15rem;
  }

  .cv-pairs {
    grid-template-columns: 9.5rem minmax(0, 1fr);
  }

  .cv-pairs dd {
    margin: 0;
  }

  .cv-split {
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  }

  .cv-section {
    margin-top: 0.75rem;
  }

  .cv-heading {
    margin-bottom: 0.4rem;
  }

  .cv-entry,
  .cv-pairs dt,
  .cv-pairs dd,
  .cv-projects li {
    break-inside: avoid;
  }

  .cv-heading {
    break-after: avoid;
  }
}
</style>
