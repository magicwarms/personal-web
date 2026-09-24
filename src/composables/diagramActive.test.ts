import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reduceActive, reduceActiveDuring } from './diagramActive'
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

test('Enter or Space lights the node and keeps a lit node lit', () => {
  assert.equal(run([{ type: 'press', id: 'api' }]), 'api')
  // Keyboard focus already lit it; the first activation must not undo that.
  assert.equal(run([{ type: 'press', id: 'api' }], 'api'), 'api')
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

test('hover, unhover and mouse-style focus are ignored while a trace plays', () => {
  const ignored: ActiveAction[] = [
    { type: 'hover', id: 'redis' },
    { type: 'unhover', id: 'redis' },
    { type: 'blur', id: 'redis' },
    { type: 'focus', id: 'redis', keyboard: false },
  ]
  for (const action of ignored) {
    assert.deepEqual(reduceActiveDuring(null, action, true), { active: null, cancelTrace: false }, action.type)
  }
})

test('a tap on the already-active node during a trace keeps it lit and ends the trace', () => {
  assert.deepEqual(reduceActiveDuring('redis', { type: 'tap', id: 'redis' }, true), {
    active: 'redis',
    cancelTrace: true,
  })
})

test('keyboard focus, press, tap and clear take over from a trace', () => {
  assert.deepEqual(reduceActiveDuring(null, { type: 'focus', id: 'api', keyboard: true }, true), {
    active: 'api',
    cancelTrace: true,
  })
  assert.deepEqual(reduceActiveDuring(null, { type: 'press', id: 'api' }, true), { active: 'api', cancelTrace: true })
  assert.deepEqual(reduceActiveDuring(null, { type: 'tap', id: 'api' }, true), { active: 'api', cancelTrace: true })
  assert.deepEqual(reduceActiveDuring('api', { type: 'clear' }, true), { active: null, cancelTrace: true })
})

test('outside a trace it defers to reduceActive and never cancels', () => {
  assert.deepEqual(reduceActiveDuring(null, { type: 'hover', id: 'redis' }, false), {
    active: 'redis',
    cancelTrace: false,
  })
  assert.deepEqual(reduceActiveDuring('redis', { type: 'tap', id: 'redis' }, false), {
    active: null,
    cancelTrace: false,
  })
})
