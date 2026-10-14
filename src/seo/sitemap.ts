import { profile, site } from '../data/portfolio'
import { pageUrl } from './pages'
import type { Page } from './pages'

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

/** Every page plus the CV PDF, all dated with `site.updated`. */
export function buildSitemap(pages: readonly Page[]): string {
  const urls = [...pages.map(pageUrl), `${site.url}${profile.cv}`]
  const entries = urls
    .map(
      (url) =>
        `  <url>\n    <loc>${escapeXml(url)}</loc>\n    <lastmod>${site.updated}</lastmod>\n  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
}
