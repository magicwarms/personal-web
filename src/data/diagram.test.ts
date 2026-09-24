import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  ariaLabelFor,
  buildNeighbors,
  captionFor,
  edgeById,
  edges,
  litFor,
  neighbors,
  nodeById,
  nodes,
  nodesOnEdges,
  stepCaption,
  traceSteps,
  traceSummary,
} from './diagram'
import { projects } from './portfolio'

test('every edge joins two known nodes', () => {
  for (const edge of edges) {
    assert.ok(nodeById.has(edge.from), `${edge.id} from ${edge.from}`)
    assert.ok(nodeById.has(edge.to), `${edge.id} to ${edge.to}`)
  }
})

test('neighbors are symmetric and come from the edges', () => {
  assert.deepEqual(
    [...(neighbors.get('api') ?? [])].sort(),
    ['assistant', 'customers', 'meilisearch', 'payments', 'postgres', 'rabbitmq', 'redis'],
  )
  assert.deepEqual([...(neighbors.get('fcm') ?? [])], ['rabbitmq'])
  const built = buildNeighbors([{ id: 'a-b', from: 'a', to: 'b', d: '', phase: 0 }])
  assert.deepEqual([...(built.get('b') ?? [])], ['a'])
})

test('litFor lights a node, its neighbors, and only its own edges', () => {
  const lit = litFor('redis')
  assert.deepEqual([...lit.nodes].sort(), ['api', 'redis'])
  assert.deepEqual([...lit.edges], ['api-redis'])
})

test('captionFor uses the note, or lists connections when there is none', () => {
  assert.equal(captionFor('payments'), 'Payment gateway and third-party API integrations.')
  assert.equal(captionFor('postgres'), 'PostgreSQL: connects to API.')
  assert.equal(captionFor('fcm'), 'Firebase FCM: connects to RabbitMQ.')
  assert.equal(captionFor('nope'), '')
})

test('every note is a verbatim line from the Kirimfresh.id case study', () => {
  const did = projects.find((project) => project.id === 'kirimfresh')?.did ?? []
  assert.ok(did.length > 0)
  const withNotes = nodes.filter((node) => node.note)
  assert.equal(withNotes.length, 4)
  for (const node of withNotes) {
    assert.ok(did.includes((node.note ?? '').replace(/\.$/, '')), `${node.id}: ${node.note}`)
  }
})

test('ariaLabelFor names the node and its connections', () => {
  assert.equal(ariaLabelFor('rabbitmq'), 'RabbitMQ, connected to API and Firebase FCM')
  assert.equal(ariaLabelFor('redis'), 'Redis, connected to API')
})

test('every trace step uses known edges that share one caller', () => {
  for (const step of traceSteps) {
    assert.ok(step.length > 0)
    const callers = new Set(step.map((id) => edgeById.get(id)?.from))
    assert.equal(callers.size, 1, step.join(','))
    for (const id of step) assert.ok(edgeById.has(id), id)
  }
})

test('stepCaption names the hop', () => {
  assert.equal(stepCaption(['customers-api']), 'Customers → API')
  assert.equal(stepCaption(['api-redis', 'api-postgres']), 'API → Redis, PostgreSQL')
  assert.equal(stepCaption(['nope']), '')
})

test('traceSummary lists every hop in order', () => {
  assert.equal(
    traceSummary(),
    'Customers → API; API → Redis, PostgreSQL; API → Payments; API → RabbitMQ; RabbitMQ → Firebase FCM',
  )
})

test('nodesOnEdges collects both ends', () => {
  assert.deepEqual([...nodesOnEdges(['api-redis', 'rabbitmq-fcm'])].sort(), ['api', 'fcm', 'rabbitmq', 'redis'])
})
