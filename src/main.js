import { createApp } from 'vue'
import '@fontsource-variable/hanken-grotesk'
import '@fontsource-variable/hanken-grotesk/wght-italic.css' // book titles in the essays
import './styles.css'
import App from './App.vue'
import { loadContent } from './site.js'

// The content is ready before the first paint: the built-in copy at once, or the admin's
// draft in preview mode (see site.js).
loadContent().finally(() => createApp(App).mount('#app'))
