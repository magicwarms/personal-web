import { test } from 'node:test'
import assert from 'node:assert/strict'
import { alphaLevel, buildAxisTerms, isHighlight, valueAt, waveReference } from './signalField'

test('separable terms reproduce the reference wave', () => {
  const cols = 90
  const rows = 60
  const cases: Array<[number, number]> = [
    [0, 0],
    [3.7, 12.5],
    [812.4, 431.9],
  ]
  for (const [t, rowOffset] of cases) {
    const terms = buildAxisTerms(cols, rows, t, rowOffset)
    for (let i = 0; i <= cols; i += 7) {
      for (let j = 0; j <= rows; j += 5) {
        const diff = Math.abs(valueAt(terms, i, j) - waveReference(i, j + rowOffset, t))
        assert.ok(diff < 1e-9, `i=${i} j=${j} t=${t} diff=${diff}`)
      }
    }
  }
})

test('axis terms cover both grid edges', () => {
  const terms = buildAxisTerms(4, 3, 0, 0)
  assert.equal(terms.sinA.length, 5)
  assert.equal(terms.cosC.length, 5)
  assert.equal(terms.cosB.length, 4)
  assert.equal(terms.sinD.length, 4)
})

test('alphaLevel skips values at or below the threshold', () => {
  assert.equal(alphaLevel(0.1), 0)
  assert.equal(alphaLevel(-2), 0)
})

test('alphaLevel buckets alpha into six levels', () => {
  assert.equal(alphaLevel(0.1000001), 1)
  assert.equal(alphaLevel(0.225), 1) // alpha is exactly 0.1
  assert.equal(alphaLevel(0.35), 2)
  assert.equal(alphaLevel(0.475), 3) // alpha 0.30000000000000004 must not round up to 4
  assert.equal(alphaLevel(0.85), 6)
  assert.equal(alphaLevel(2), 6) // clamped at the 0.6 peak
})

test('highlights are rare', () => {
  let hits = 0
  let total = 0
  for (let i = 0; i <= 120; i++) {
    for (let j = 0; j <= 68; j++) {
      total++
      if (isHighlight(i, j)) hits++
    }
  }
  // 1.47% on a 1920 x 1080 grid at 16 px spacing.
  assert.ok(hits / total > 0.005 && hits / total < 0.03, `rate ${hits / total}`)
})
