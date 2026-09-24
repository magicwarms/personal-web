/**
 * Writes the server-rendered page into dist/index.html.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (dist-ssr). The
 * site is a single page, so there is exactly one route to render. The SSR
 * bundle is build scaffolding only and is removed afterwards; nothing in
 * dist-ssr ships in the image.
 */
import { readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ssrDir = path.join(root, 'dist-ssr')
const indexPath = path.join(root, 'dist', 'index.html')
const mountPoint = '<div id="app"></div>'

const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)
const appHtml = await render()

const template = await readFile(indexPath, 'utf8')
if (!template.includes(mountPoint)) {
  throw new Error(`prerender: ${mountPoint} not found in dist/index.html`)
}

await writeFile(indexPath, template.replace(mountPoint, `<div id="app">${appHtml}</div>`))
await rm(ssrDir, { recursive: true, force: true })

console.log(`prerender: wrote ${(appHtml.length / 1024).toFixed(1)} kB of markup into dist/index.html`)
