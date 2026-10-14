import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'

export { getPages } from './seo/pages'
export { renderHead } from './seo/head'
export { buildSitemap } from './seo/sitemap'
export { buildLlmsTxt } from './seo/llmsTxt'

/**
 * Build-time only. scripts/prerender.mjs calls this once per page and writes
 * the markup into that page's HTML file, so crawlers and link-preview bots
 * that do not run JavaScript still get the full page. The browser then
 * hydrates it (see main.ts). Styles are not imported here; the client bundle
 * owns them.
 */
export function render(path: string): Promise<string> {
  return renderToString(createSSRApp(App, { path }))
}
