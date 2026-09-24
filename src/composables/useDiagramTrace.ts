import { onBeforeUnmount, ref } from 'vue'
import type { Ref } from 'vue'
import { gsap } from '@/motion/gsap'
import { edgeById, nodesOnEdges, stepCaption, traceSteps, traceSummary } from '@/data/diagram'
import type { LitSet } from '@/data/diagram'

/** Seconds a dash takes to cross one step's edges. Five steps: 2.5 s. */
const STEP_SECONDS = 0.5
const HOLD_SECONDS = 0.6
const REDUCED_HOLD_MS = 2000

const empty = (): LitSet => ({ nodes: new Set(), edges: new Set() })

/**
 * "Trace a request": one green dash per step, in request order, lighting
 * each node as the dash reaches it. The timeline lives in a gsap.context
 * scoped to the SVG; every play() and cancel() reverts it first, so presses
 * never stack. Under reduced motion there is no moving dash: the whole path
 * lights at once for two seconds.
 */
export function useDiagramTrace(svg: Ref<SVGSVGElement | null>) {
  const tracing = ref(false)
  const lit = ref<LitSet>(empty())
  const caption = ref<string | null>(null)

  let context: ReturnType<typeof gsap.context> | undefined
  let resetTimer: number | undefined

  function cancel() {
    context?.revert()
    context = undefined
    window.clearTimeout(resetTimer)
    tracing.value = false
    lit.value = empty()
    caption.value = null
  }

  function play() {
    const root = svg.value
    if (!root) return
    cancel()
    tracing.value = true

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const all = traceSteps.flat()
      lit.value = { nodes: nodesOnEdges(all), edges: new Set(all) }
      caption.value = traceSummary()
      resetTimer = window.setTimeout(cancel, REDUCED_HOLD_MS)
      return
    }

    const firstCaller = edgeById.get(traceSteps[0]?.[0] ?? '')?.from
    lit.value = { nodes: new Set(firstCaller ? [firstCaller] : []), edges: new Set() }

    context = gsap.context(() => {
      const timeline = gsap.timeline({
        // Revert outside the timeline's own callback.
        onComplete: () => {
          resetTimer = window.setTimeout(cancel, 0)
        },
      })

      traceSteps.forEach((step, index) => {
        const label = `step${index}`
        timeline.addLabel(label)
        timeline.call(
          () => {
            caption.value = stepCaption(step)
            lit.value = { nodes: lit.value.nodes, edges: new Set([...lit.value.edges, ...step]) }
          },
          undefined,
          label,
        )
        for (const id of step) {
          const path = root.querySelector(`[data-trace="${id}"]`)
          if (!path) continue
          timeline.fromTo(
            path,
            { strokeDashoffset: 8 },
            { strokeDashoffset: -100, duration: STEP_SECONDS, ease: 'none' },
            label,
          )
        }
        timeline.call(
          () => {
            const reached = new Set(lit.value.nodes)
            for (const id of step) {
              const to = edgeById.get(id)?.to
              if (to) reached.add(to)
            }
            lit.value = { nodes: reached, edges: lit.value.edges }
          },
          undefined,
          `${label}+=${STEP_SECONDS}`,
        )
      })

      timeline.to({}, { duration: HOLD_SECONDS })
    }, root)
  }

  onBeforeUnmount(cancel)

  return { tracing, lit, caption, play, cancel }
}
