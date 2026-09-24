import { onBeforeUnmount, onMounted, readonly, ref } from 'vue'

/**
 * Which section the reader is in, shared by the header nav and every margin
 * label. One IntersectionObserver watches a band 1% tall, 40% down the
 * viewport; the section crossing it is the active one.
 *
 * Module-level and reference-counted: the first subscriber creates the
 * observer, the last one disconnects it. `activeId` is null on the server
 * and until the first observer callback, so hydration output matches.
 */
const activeId = ref<string | null>(null)
const intersecting = new Set<string>()
let order: string[] = []
let observer: IntersectionObserver | undefined
let subscribers = 0

/** The first section in document order that is in the band. */
export function pickActive(ids: readonly string[], hits: ReadonlySet<string>): string | null {
  return ids.find((id) => hits.has(id)) ?? null
}

function connect() {
  // No observer support: nothing is ever marked active, as before this feature.
  if (typeof IntersectionObserver === 'undefined') return
  const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'))
  order = sections.map((section) => section.id)
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).id
        if (entry.isIntersecting) intersecting.add(id)
        else intersecting.delete(id)
      }
      activeId.value = pickActive(order, intersecting)
    },
    { rootMargin: '-40% 0px -59% 0px' },
  )
  sections.forEach((section) => io.observe(section))
  observer = io
}

function disconnect() {
  observer?.disconnect()
  observer = undefined
  intersecting.clear()
  order = []
  activeId.value = null
}

export function useActiveSection() {
  // Mounted hooks run after the whole app is in the document, so every
  // section exists by the time the first subscriber connects.
  onMounted(() => {
    if (subscribers++ === 0) connect()
  })
  onBeforeUnmount(() => {
    if (--subscribers === 0) disconnect()
  })
  return { activeId: readonly(activeId) }
}
