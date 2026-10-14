import { test } from 'node:test'
import assert from 'node:assert/strict'
import { escapeHtml, renderHead } from './head'
import { getPages } from './pages'
import { withCase } from './fixtures'
import type { CaseProject } from './pages'

const [home, caseStudy] = getPages([withCase])

const jsonLd = (head: string) => {
  const match = head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  assert.ok(match, 'JSON-LD block present')
  return JSON.parse(match[1])
}

test('home head has one title and the home canonical', () => {
  const head = renderHead(home)
  assert.equal(head.match(/<title>/g)?.length, 1)
  assert.match(head, /<link rel="canonical" href="https:\/\/andhanautama\.id\/" \/>/)
  assert.match(head, /property="og:type" content="profile"/)
  assert.match(head, /property="profile:first_name" content="Andhana"/)
})

test('case head has its own title, canonical, and og:type', () => {
  const head = renderHead(caseStudy)
  assert.match(head, /<title>Alpha Co case study \| Andhana Utama<\/title>/)
  assert.match(head, /<link rel="canonical" href="https:\/\/andhanautama\.id\/work\/alpha" \/>/)
  assert.match(head, /name="description" content="How Alpha Co shipped a thing\."/)
  assert.match(head, /property="og:type" content="article"/)
  assert.doesNotMatch(head, /profile:first_name/)
})

test('home JSON-LD links the website, profile page, and person', () => {
  const graph = jsonLd(renderHead(home))['@graph']
  assert.deepEqual(
    graph.map((node: { '@type': string }) => node['@type']),
    ['WebSite', 'ProfilePage', 'Person'],
  )
  const person = graph.find((node: { '@type': string }) => node['@type'] === 'Person')
  assert.equal(person['@id'], 'https://andhanautama.id/#person')
})

test('case JSON-LD has a WebPage and a two-item breadcrumb', () => {
  const graph = jsonLd(renderHead(caseStudy))['@graph']
  const crumbs = graph.find((node: { '@type': string }) => node['@type'] === 'BreadcrumbList')
  assert.deepEqual(
    crumbs.itemListElement.map((item: { item: string }) => item.item),
    ['https://andhanautama.id/', 'https://andhanautama.id/work/alpha'],
  )
})

test('attribute and text values are escaped', () => {
  const hostile: CaseProject = {
    ...withCase,
    org: 'A&B <i>"x"</i>',
    caseStudy: { ...withCase.caseStudy, description: 'He said "go" & left <now>' },
  }
  const [, page] = getPages([hostile])
  const head = renderHead(page)
  assert.match(head, /<title>A&amp;B &lt;i&gt;&quot;x&quot;&lt;\/i&gt; case study/)
  assert.match(head, /content="He said &quot;go&quot; &amp; left &lt;now&gt;"/)
})

test('JSON-LD can never close its own script tag', () => {
  const hostile: CaseProject = {
    ...withCase,
    caseStudy: { ...withCase.caseStudy, description: 'x </script><script>alert(1)</script>' },
  }
  const [, page] = getPages([hostile])
  const head = renderHead(page)
  assert.equal(head.match(/<\/script/g)?.length, 1)
  assert.equal(
    jsonLd(head)['@graph'][0].description,
    'x </script><script>alert(1)</script>',
  )
})

test('escapeHtml covers the four characters that break markup', () => {
  assert.equal(escapeHtml(`&<>"`), '&amp;&lt;&gt;&quot;')
})
