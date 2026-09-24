import { createApp, createSSRApp } from 'vue'
import App from './App.vue'
import './styles/base.css'
// Side effect: registers every GSAP plugin and the shared `site-out` ease.
import './motion/gsap'

// Production HTML arrives prerendered (scripts/prerender.mjs), so hydrate it
// instead of re-rendering. The dev server serves an empty #app, which gets a
// normal client mount.
const container = document.getElementById('app')
const app = container?.hasChildNodes() ? createSSRApp(App) : createApp(App)

app.mount('#app')
