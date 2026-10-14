import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildLlmsTxt } from './llmsTxt'
import { getPages } from './pages'
import { withCase } from './fixtures'
import type { Role } from '../data/portfolio'

const roles: Role[] = [
  { id: 'r1', title: 'Lead', company: 'Acme', location: 'Remote', period: '2024-2026', scope: 'Scope.' },
]

test('starts with the name and a quoted summary', () => {
  const lines = buildLlmsTxt(getPages([]), roles).split('\n')
  assert.equal(lines[0], '# Andhana Utama')
  assert.equal(lines[2].startsWith('> '), true)
})

test('lists a case study with an absolute url and its description', () => {
  const text = buildLlmsTxt(getPages([withCase]), roles)
  assert.match(
    text,
    /- \[Alpha Co: A test project\]\(https:\/\/andhanautama\.id\/work\/alpha\): How Alpha Co shipped a thing\./,
  )
})

test('omits the case studies section when there are none', () => {
  assert.doesNotMatch(buildLlmsTxt(getPages([]), roles), /## Case studies/)
})

test('has experience, contact, and optional sections', () => {
  const text = buildLlmsTxt(getPages([]), roles)
  assert.match(text, /## Experience\n\n- Lead, Acme, 2024-2026/)
  assert.match(text, /## Contact\n\n- Email: /)
  assert.match(text, /## Optional\n\n- \[Home page\]\(https:\/\/andhanautama\.id\/\)/)
})

test('ends with one newline', () => {
  assert.match(buildLlmsTxt(getPages([]), roles), /[^\n]\n$/)
})
