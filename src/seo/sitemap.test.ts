import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSitemap } from './sitemap'
import { getPages, homePage } from './pages'
import { withCase } from './fixtures'

test('lists every page and the CV with a lastmod', () => {
  const xml = buildSitemap(getPages([withCase]))
  assert.match(xml, /<loc>https:\/\/andhanautama\.id\/<\/loc>/)
  assert.match(xml, /<loc>https:\/\/andhanautama\.id\/work\/alpha<\/loc>/)
  assert.match(xml, /<loc>https:\/\/andhanautama\.id\/assets\/CV-Andhana-Utama-2026\.pdf<\/loc>/)
  assert.equal(xml.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)?.length, 3)
})

test('with no case pages it lists home and the CV', () => {
  assert.equal(buildSitemap(getPages([])).match(/<url>/g)?.length, 2)
})

test('escapes XML special characters in a url', () => {
  const xml = buildSitemap([homePage, { kind: 'case', path: '/work/a&b', project: withCase }])
  assert.match(xml, /<loc>https:\/\/andhanautama\.id\/work\/a&amp;b<\/loc>/)
})
