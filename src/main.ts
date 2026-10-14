import { createApp, createSSRApp } from 'vue'
import App from './App.vue'
// Self-hosted fonts. Fontsource splits each family by unicode range, so the
// browser only fetches the latin file for this page's text.
import '@fontsource-variable/instrument-sans'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './styles/base.css'
// Side effect: registers every GSAP plugin and the shared `site-out` ease.
import './motion/gsap'

// Production HTML arrives prerendered (scripts/prerender.mjs), so hydrate it
// instead of re-rendering. The dev server serves an empty #app, which gets a
// normal client mount. Each page is its own HTML file, so the pathname alone
// says which one to hydrate.
const container = document.getElementById('app')
const props = { path: location.pathname }
const app = container?.hasChildNodes() ? createSSRApp(App, props) : createApp(App, props)

app.mount('#app')

// A link like /#work from another page loads the page and the browser jumps to
// the section, but ScrollTrigger refreshes once the fonts are in and that
// lands the page back at the top. Jump again after the refresh has settled.
document.fonts?.ready.then(() => {
  const id = decodeURIComponent(location.hash.slice(1))
  if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' })
})
