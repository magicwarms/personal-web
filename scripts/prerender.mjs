/**
 * Writes one server-rendered HTML file per page, plus sitemap.xml and llms.txt.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (dist-ssr). Pages
 * come from `getPages()`: the home page, then one page for each project that
 * has a `caseStudy`. Each page gets its own head (title, canonical, JSON-LD)
 * and its own markup. The SSR bundle is build scaffolding only and is removed
 * afterwards; nothing in dist-ssr ships in the image.
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ssrDir = path.join(root, 'dist-ssr')
const distDir = path.join(root, 'dist')
const mountPoint = '<div id="app"></div>'
const headMarker = '<!--page-head-->'

const { render, getPages, renderHead, buildSitemap, buildLlmsTxt } = await import(
  pathToFileURL(path.join(ssrDir, 'entry-server.js')).href
)

const template = await readFile(path.join(distDir, 'index.html'), 'utf8')
for (const marker of [mountPoint, headMarker]) {
  if (!template.includes(marker)) {
    throw new Error(`prerender: ${marker} not found in dist/index.html`)
  }
}

const pages = getPages()

for (const page of pages) {
  const appHtml = await render(page.path)
  // Function replacements: a string replacement would treat `$&` and `$'`
  // inside the rendered markup as substitution patterns.
  const html = template
    .replace(headMarker, () => renderHead(page))
    .replace(mountPoint, () => `<div id="app">${appHtml}</div>`)

  const file =
    page.path === '/'
      ? path.join(distDir, 'index.html')
      : path.join(distDir, ...page.path.split('/').filter(Boolean), 'index.html')
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, html)
  console.log(`prerender: ${page.path} -> ${path.relative(root, file)} (${(appHtml.length / 1024).toFixed(1)} kB of markup)`)
}

await writeFile(path.join(distDir, 'sitemap.xml'), buildSitemap(pages))
await writeFile(path.join(distDir, 'llms.txt'), buildLlmsTxt(pages))
await rm(ssrDir, { recursive: true, force: true })

console.log(`prerender: wrote sitemap.xml and llms.txt for ${pages.length} page(s)`)
