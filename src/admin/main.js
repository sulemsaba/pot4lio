import { createApp } from 'vue'
import '@fontsource-variable/hanken-grotesk'
import './admin.css'
import App from './App.vue'
import { init } from './store.js'

createApp(App).mount('#admin')
init()
