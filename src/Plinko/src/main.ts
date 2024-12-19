import './assets/main.css'
import './style.css'
import 'vue3-perfect-scrollbar/style.css';

import { i18n } from './i18n';
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar';
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n);
app.use(PerfectScrollbarPlugin);
app.mount('#app')
