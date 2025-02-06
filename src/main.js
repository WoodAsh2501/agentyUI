import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

export const pinia = createPinia()
const app = createApp(App)

app.use(pinia).mount('#app')