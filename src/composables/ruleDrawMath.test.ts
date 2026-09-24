import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hasPassed } from './ruleDrawMath'

test('a rule above or inside the viewport has passed', () => {
  assert.equal(hasPassed(-500, 900), true)
  assert.equal(hasPassed(0, 900), true)
  assert.equal(hasPassed(450, 900), true)
})

test('a rule below the viewport has not', () => {
  assert.equal(hasPassed(900, 900), false)
  assert.equal(hasPassed(1600, 900), false)
})

test('the bottom sliver of the viewport counts as passed', () => {
  // A matchMedia rebuild after crossing 60rem reverts the draw tweens. A rule
  // in the bottom 5% must be redrawn at once, not left hidden until the
  // reader scrolls, so "passed" cannot stop short of the viewport's edge.
  assert.equal(hasPassed(900 * 0.97, 900), true)
  assert.equal(hasPassed(900 * 0.999, 900), true)
})
