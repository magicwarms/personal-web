/**
 * The Kirimfresh.id backend, simplified, as drawn in the hero. Every node is
 * a component the CV names; nothing here is decorative invention.
 *
 * Pure data and helpers with no Vue and no alias imports, so the unit tests
 * import it directly.
 */

export interface DiagramNode {
  id: string
  x: number
  y: number
  w: number
  h: number
  label: string
  sub?: string
  /** 0 = callers, 1 = API dependencies, 2 = downstream of the queue. */
  phase: number
  /**
   * Shown in the caption while the node is active. Each one is a line from
   * the Kirimfresh.id `did` list in portfolio.ts, and a unit test keeps it
   * that way. Nodes the CV says nothing specific about have no note.
   */
  note?: string
}

export interface DiagramEdge {
  id: string
  from: string
  to: string
  /** Orthogonal route, drawn from caller to callee so pulses flow forward. */
  d: string
  phase: number
}

export const nodes: DiagramNode[] = [
  { id: 'customers', x: 16, y: 16, w: 140, h: 36, label: 'Customers', phase: 0 },
  {
    id: 'assistant',
    x: 184,
    y: 16,
    w: 140,
    h: 36,
    label: 'AI assistant',
    phase: 0,
    note: 'A customer-facing AI assistant for recipe search, nutrition questions, product lookups, and support.',
  },
  {
    id: 'api',
    x: 80,
    y: 92,
    w: 180,
    h: 48,
    label: 'API',
    sub: 'Go · Fiber',
    phase: 0,
    note: 'Go (Fiber) services in a layered handler-service-repository design with dependency injection.',
  },
  { id: 'postgres', x: 16, y: 184, w: 94, h: 36, label: 'PostgreSQL', phase: 1 },
  { id: 'redis', x: 16, y: 240, w: 94, h: 36, label: 'Redis', phase: 1 },
  { id: 'meilisearch', x: 16, y: 296, w: 94, h: 36, label: 'Meilisearch', phase: 1 },
  {
    id: 'payments',
    x: 230,
    y: 184,
    w: 94,
    h: 36,
    label: 'Payments',
    phase: 1,
    note: 'Payment gateway and third-party API integrations.',
  },
  {
    id: 'rabbitmq',
    x: 230,
    y: 240,
    w: 94,
    h: 36,
    label: 'RabbitMQ',
    phase: 1,
    note: 'RabbitMQ event processing for order events, delivery tracking, and notifications via Firebase FCM.',
  },
  { id: 'fcm', x: 230, y: 304, w: 94, h: 36, label: 'Firebase FCM', phase: 2 },
]

export const edges: DiagramEdge[] = [
  { id: 'customers-api', from: 'customers', to: 'api', d: 'M86 52 V72 H150 V92', phase: 0 },
  { id: 'assistant-api', from: 'assistant', to: 'api', d: 'M254 52 V72 H190 V92', phase: 0 },
  { id: 'api-postgres', from: 'api', to: 'postgres', d: 'M130 140 V202 H110', phase: 1 },
  { id: 'api-redis', from: 'api', to: 'redis', d: 'M130 140 V258 H110', phase: 1 },
  { id: 'api-meilisearch', from: 'api', to: 'meilisearch', d: 'M130 140 V314 H110', phase: 1 },
  { id: 'api-payments', from: 'api', to: 'payments', d: 'M210 140 V202 H230', phase: 1 },
  { id: 'api-rabbitmq', from: 'api', to: 'rabbitmq', d: 'M210 140 V258 H230', phase: 1 },
  { id: 'rabbitmq-fcm', from: 'rabbitmq', to: 'fcm', d: 'M277 276 V304', phase: 2 },
]

export const nodeById = new Map(nodes.map((node) => [node.id, node]))
export const edgeById = new Map(edges.map((edge) => [edge.id, edge]))

/** Both directions, in edge order. Derived, so there is no second copy of the graph. */
export function buildNeighbors(list: DiagramEdge[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()
  const link = (a: string, b: string) => {
    const set = map.get(a) ?? new Set<string>()
    set.add(b)
    map.set(a, set)
  }
  for (const edge of list) {
    link(edge.from, edge.to)
    link(edge.to, edge.from)
  }
  return map
}

export const neighbors = buildNeighbors(edges)

/** "A", "A and B", "A, B and C". */
export function joinLabels(labels: string[]): string {
  if (labels.length <= 1) return labels.join('')
  return `${labels.slice(0, -1).join(', ')} and ${labels.at(-1)}`
}

function neighborLabels(id: string): string[] {
  return [...(neighbors.get(id) ?? [])].map((other) => nodeById.get(other)?.label ?? other)
}

export interface LitSet {
  nodes: ReadonlySet<string>
  edges: ReadonlySet<string>
}

export function litFor(id: string): LitSet {
  return {
    nodes: new Set([id, ...(neighbors.get(id) ?? [])]),
    edges: new Set(edges.filter((edge) => edge.from === id || edge.to === id).map((edge) => edge.id)),
  }
}

export function captionFor(id: string): string {
  const node = nodeById.get(id)
  if (!node) return ''
  return node.note ?? `${node.label}: connects to ${joinLabels(neighborLabels(id))}.`
}

export function ariaLabelFor(id: string): string {
  const node = nodeById.get(id)
  if (!node) return ''
  return `${node.label}, connected to ${joinLabels(neighborLabels(id))}`
}

/** One request through the system, in order. Edges in one step run together. */
export const traceSteps: string[][] = [
  ['customers-api'],
  ['api-redis', 'api-postgres'],
  ['api-payments'],
  ['api-rabbitmq'],
  ['rabbitmq-fcm'],
]

/** "API → Redis, PostgreSQL". Names the hop and makes no other claim. */
export function stepCaption(step: string[]): string {
  const hops = step.map((id) => edgeById.get(id)).filter((edge): edge is DiagramEdge => edge !== undefined)
  const first = hops[0]
  if (!first) return ''
  const from = nodeById.get(first.from)?.label ?? first.from
  const to = hops.map((edge) => nodeById.get(edge.to)?.label ?? edge.to).join(', ')
  return `${from} → ${to}`
}

/** The whole trace in one line, for reduced motion, where it lights all at once. */
export function traceSummary(): string {
  return traceSteps.map(stepCaption).join('; ')
}

export function nodesOnEdges(edgeIds: string[]): Set<string> {
  const ids = new Set<string>()
  for (const id of edgeIds) {
    const edge = edgeById.get(id)
    if (!edge) continue
    ids.add(edge.from)
    ids.add(edge.to)
  }
  return ids
}
