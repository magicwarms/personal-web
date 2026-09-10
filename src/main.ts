import { createApp } from 'vue'
import App from './App.vue'
import './styles/base.css'
// Side effect: registers every GSAP plugin and the shared `site-out` ease.
import './motion/gsap'

createApp(App).mount('#app')
