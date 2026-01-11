<template>
  <aside
    class="sidecar-panel"
    :style="{ width: panelWidth + 'px' }"
  >
    <!-- Resize handle -->
    <div
      class="resize-handle"
      role="separator"
      aria-label="Resize panel"
      tabindex="0"
      @mousedown="startResize"
      @touchstart="startResize"
    ></div>

    <div class="sidecar-content">
      <section class="panel-section">
        <h3>Projects</h3>
        <ul v-if="projects.length">
          <li v-for="(project, i) in projects" :key="i">
            <a :href="project.link" target="_blank" rel="noopener">
              {{ project.name }}
            </a>
          </li>
        </ul>
        <p v-else class="placeholder">No projects yet</p>
      </section>

      <section class="panel-section">
        <h3>Skills</h3>
        <div class="skills-list">
          <span v-for="(skill, i) in skills" :key="i">{{ skill }}</span>
        </div>
      </section>

      <section class="panel-section">
        <h3>CV</h3>
        <a :href="cvLink" target="_blank" class="cv-button">Download CV</a>
      </section>

      <section class="panel-section">
        <h3>Timeline</h3>
        <ul>
          <li v-for="(event, i) in timeline" :key="i">{{ event }}</li>
        </ul>
      </section>

      <section class="panel-section">
        <h3>Contact</h3>
        <form @submit.prevent="sendContact">
          <label>
            Name
            <input v-model="contact.name" required />
          </label>

          <label>
            Email
            <input type="email" v-model="contact.email" required />
          </label>

          <label>
            Message
            <textarea v-model="contact.message" rows="3" required></textarea>
          </label>

          <button type="submit">Send</button>
        </form>
      </section>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { projects, skills, cvLink, timeline } from '../data/portfolio-data.js'

const panelWidth = ref(360)
const isResizing = ref(false)

const contact = ref({
  name: '',
  email: '',
  message: '',
})

const startResize = (e) => {
  isResizing.value = true
  e.preventDefault()
}

const stopResize = () => {
  isResizing.value = false
}

const resizePanel = (e) => {
  if (!isResizing.value) return
  const clientX = e.clientX || e.touches?.[0]?.clientX
  if (!clientX) return

  const newWidth = window.innerWidth - clientX
  panelWidth.value = Math.max(320, Math.min(520, newWidth))
}

onMounted(() => {
  window.addEventListener('mousemove', resizePanel)
  window.addEventListener('mouseup', stopResize)
  window.addEventListener('touchmove', resizePanel)
  window.addEventListener('touchend', stopResize)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', resizePanel)
  window.removeEventListener('mouseup', stopResize)
  window.removeEventListener('touchmove', resizePanel)
  window.removeEventListener('touchend', stopResize)
})

const sendContact = () => {
  console.log('Contact submitted:', contact.value)
  contact.value = { name: '', email: '', message: '' }
}
</script>

<style scoped>
.sidecar-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  background: rgba(33, 33, 33, 0.85);
  backdrop-filter: blur(14px);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  z-index: 40;
}

.resize-handle {
  position: absolute;
  left: -6px;
  width: 12px;
  height: 100%;
  cursor: ew-resize;
}

.sidecar-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.panel-section h3 {
  font-size: 0.95rem;
  font-weight: 600;
  opacity: 0.85;
  margin-bottom: 8px;
}

.panel-section ul {
  list-style: none;
  padding: 0;
}

.panel-section li {
  margin-bottom: 6px;
  opacity: 0.85;
}

.panel-section a {
  color: #10a37f;
  text-decoration: none;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skills-list span {
  padding: 6px 10px;
  border-radius: 16px;
  background: rgba(16, 163, 127, 0.12);
  font-size: 0.85rem;
}

.cv-button {
  display: inline-block;
  padding: 10px 14px;
  background: #10a37f;
  border-radius: 16px;
  color: white;
  font-weight: 500;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

label {
  font-size: 0.85rem;
  opacity: 0.85;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

input,
textarea {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 10px 12px;
  color: white;
}

button {
  margin-top: 6px;
  padding: 10px;
  border-radius: 16px;
  border: none;
  background: #10a37f;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

.placeholder {
  opacity: 0.5;
  font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 900px) {
  .sidecar-panel {
    position: relative;
    width: 100% !important;
    height: auto;
    box-shadow: none;
  }

  .resize-handle {
    display: none;
  }
}
</style>
