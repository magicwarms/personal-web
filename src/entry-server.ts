import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'

/**
 * Build-time only. scripts/prerender.mjs calls this once and writes the
 * markup into dist/index.html, so crawlers and link-preview bots that do not
 * run JavaScript still get the full page. The browser then hydrates it
 * (see main.ts). Styles are not imported here; the client bundle owns them.
 */
export function render(): Promise<string> {
  return renderToString(createSSRApp(App))
}
