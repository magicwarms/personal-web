import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pickActive } from './useActiveSection'

const order = ['work', 'experience', 'about', 'skills', 'credentials', 'contact']

test('no section in the band means none is active', () => {
  assert.equal(pickActive(order, new Set()), null)
})

test('the one section in the band is active', () => {
  assert.equal(pickActive(order, new Set(['about'])), 'about')
})

test('at a boundary the earlier section wins', () => {
  assert.equal(pickActive(order, new Set(['skills', 'about'])), 'about')
})

test('ids outside the section order are ignored', () => {
  assert.equal(pickActive(order, new Set(['hero'])), null)
})
