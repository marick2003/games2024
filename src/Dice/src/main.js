import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import './assets/main.css'
import App from './App.vue'
import { createPinia } from 'pinia'
const app = createApp(App)
app.use(createPinia())
app.use(ElementPlus)
app.mount('#app')
