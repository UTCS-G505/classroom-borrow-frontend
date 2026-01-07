import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(router)

app.mount('#app')

// Initialize auth store on app start
const authStore = useAuthStore()
authStore.initializeAuth()
