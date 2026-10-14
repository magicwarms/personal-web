import { profile, site } from '../data/portfolio'
import { pageDescription, pageTitle, pageUrl } from './pages'
import type { Page } from './pages'
import { buildStructuredData } from './structuredData'

// public/assets/andhana.jpg is 640x640.
const IMAGE_SIZE = 640

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }

export const escapeHtml = (value: string): string => value.replace(/[&<>"]/g, (char) => ESCAPES[char])

/** JSON for a script block. Escaping `<` keeps data from ever closing the tag. */
export const jsonForScript = (value: unknown): string =>
  JSON.stringify(value, null, 2).replace(/</g, '\\u003c')

const meta = (attr: 'name' | 'property', key: string, value: string): string =>
  `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`

/**
 * The page-specific part of <head>: everything that changes from one page to
 * the next. scripts/prerender.mjs swaps it in for `<!--page-head-->` in
 * index.html; the tags that never change stay in that file.
 */
export function renderHead(page: Page): string {
  const title = pageTitle(page)
  const url = pageUrl(page)
  const description = pageDescription(page)
  const shareDescription = page.kind === 'home' ? site.socialDescription : description
  const image = `${site.url}${profile.photo}`
  const imageAlt = `Portrait of ${profile.name}`
  const [firstName, ...rest] = profile.name.split(' ')

  const lines = [
    `<title>${escapeHtml(title)}</title>`,
    meta('name', 'description', description),
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    meta('property', 'og:type', page.kind === 'home' ? 'profile' : 'article'),
    meta('property', 'og:url', url),
    meta('property', 'og:title', title),
    meta('property', 'og:description', shareDescription),
    meta('property', 'og:image', image),
    meta('property', 'og:image:width', String(IMAGE_SIZE)),
    meta('property', 'og:image:height', String(IMAGE_SIZE)),
    meta('property', 'og:image:alt', imageAlt),
  ]

  if (page.kind === 'home') {
    lines.push(
      meta('property', 'profile:first_name', firstName),
      meta('property', 'profile:last_name', rest.join(' ')),
    )
  }

  lines.push(
    meta('name', 'twitter:card', 'summary'),
    meta('name', 'twitter:title', title),
    meta('name', 'twitter:description', shareDescription),
    meta('name', 'twitter:image', image),
    meta('name', 'twitter:image:alt', imageAlt),
    `<script type="application/ld+json">${jsonForScript(buildStructuredData(page))}</script>`,
  )

  return lines.join('\n    ')
}
