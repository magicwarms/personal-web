import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reduceActive } from './diagramActive'
import type { ActiveAction } from './diagramActive'

const run = (actions: ActiveAction[], start: string | null = null) =>
  actions.reduce<string | null>(reduceActive, start)

test('a tap (non-keyboard focus, then tap) leaves the node highlighted', () => {
  assert.equal(run([{ type: 'focus', id: 'redis', keyboard: false }, { type: 'tap', id: 'redis' }]), 'redis')
})

test('a second tap on the same node clears it', () => {
  assert.equal(run([{ type: 'tap', id: 'redis' }], 'redis'), null)
})

test('tapping another node moves the highlight', () => {
  assert.equal(
    run(
      [
        { type: 'blur', id: 'redis' },
        { type: 'focus', id: 'api', keyboard: false },
        { type: 'tap', id: 'api' },
      ],
      'redis',
    ),
    'api',
  )
})

test('keyboard focus highlights and tabbing moves it', () => {
  assert.equal(run([{ type: 'focus', id: 'api', keyboard: true }]), 'api')
  assert.equal(
    run([{ type: 'blur', id: 'api' }, { type: 'focus', id: 'redis', keyboard: true }], 'api'),
    'redis',
  )
})

test('Enter or Space toggles', () => {
  assert.equal(run([{ type: 'press', id: 'api' }]), 'api')
  assert.equal(run([{ type: 'press', id: 'api' }], 'api'), null)
})

test('hover sets and leaving clears, but only for the same node', () => {
  assert.equal(run([{ type: 'hover', id: 'api' }]), 'api')
  assert.equal(run([{ type: 'unhover', id: 'api' }], 'api'), null)
  assert.equal(run([{ type: 'unhover', id: 'redis' }], 'api'), 'api')
  assert.equal(run([{ type: 'blur', id: 'redis' }], 'api'), 'api')
})

test('clear always resets', () => {
  assert.equal(run([{ type: 'clear' }], 'api'), null)
})
