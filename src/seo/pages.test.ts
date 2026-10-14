import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getPages, pageTitle, pageUrl, resolvePage } from './pages'
import { withCase, withoutCase } from './fixtures'

const list = [withCase, withoutCase]

test('home is always the first page', () => {
  assert.deepEqual(getPages([]).map((page) => page.path), ['/'])
})

test('only projects with a case study get a page', () => {
  assert.deepEqual(getPages(list).map((page) => page.path), ['/', '/work/alpha'])
})

test('a known path resolves to its page', () => {
  const page = resolvePage('/work/alpha', list)
  assert.equal(page.kind, 'case')
  assert.equal(page.path, '/work/alpha')
})

test('an unknown path resolves to home', () => {
  assert.equal(resolvePage('/nope', list).kind, 'home')
})

test('the slug of a project without a case study resolves to home', () => {
  assert.equal(resolvePage('/work/beta', list).kind, 'home')
})

test('a trailing slash is not a match', () => {
  assert.equal(resolvePage('/work/alpha/', list).kind, 'home')
})

test('urls are absolute and titles name the org', () => {
  const [home, caseStudy] = getPages(list)
  assert.equal(pageUrl(home), 'https://andhanautama.id/')
  assert.equal(pageUrl(caseStudy), 'https://andhanautama.id/work/alpha')
  assert.equal(pageTitle(caseStudy), 'Alpha Co case study | Andhana Utama')
})
