import type { Ref } from 'vue'
import { REVEAL_START, ScrollTrigger, gsap } from '@/motion/gsap'
import { useSectionMotion } from './useSectionMotion'

/** A section's rule fires just before its content rises in at REVEAL_START. */
const SECTION_RULE_START = 'top 95%'
const SECTION_RULE_LINE = 0.95
const REVEAL_LINE = 0.9

const isBelowFold = (el: HTMLElement) => el.getBoundingClientRect().top >= window.innerHeight
const isPast = (el: HTMLElement, line: number) => el.getBoundingClientRect().top < window.innerHeight * line

const draw = (batch: Element[]) => gsap.to(batch, { '--draw': 1, duration: 0.6, stagger: 0.04 })

/**
 * Hairlines draw in from the left as they scroll into view.
 *
 * Table rules sit inside RevealItem blocks, which stay invisible until
 * REVEAL_START, so they fire with the reveal; firing earlier would finish
 * the draw unseen. Same rule as RevealItem: anything already on screen at
 * mount was painted by the prerender and stays drawn, so nothing blinks.
 */
export function useRuleDraw(root: Ref<HTMLElement | null>) {
  let sections: HTMLElement[] = []
  let tables: HTMLElement[] = []

  useSectionMotion(
    root,
    ({ reduceMotion }) => {
      if (reduceMotion) {
        // Reduced motion switched on mid-visit: finish anything still hidden.
        const hidden = [...sections, ...tables]
        if (hidden.length) gsap.set(hidden, { '--draw': 1 })
        return
      }
      schedule(sections, SECTION_RULE_START, SECTION_RULE_LINE)
      schedule(tables, REVEAL_START, REVEAL_LINE)
    },
    (el) => {
      sections = Array.from(el.querySelectorAll<HTMLElement>('.section')).filter(isBelowFold)
      tables = Array.from(el.querySelectorAll<HTMLElement>('.spec, .spec__row')).filter(isBelowFold)
      const hidden = [...sections, ...tables]
      if (hidden.length) gsap.set(hidden, { '--draw': 0 })
    },
  )
}

/**
 * The builder can run with the page already scrolled past some rules (a
 * restored scroll position, or a matchMedia re-run after crossing 60rem,
 * which reverts earlier tweens). Those draw immediately instead of waiting
 * for a trigger that already fired.
 */
function schedule(targets: HTMLElement[], start: string, line: number) {
  const passed = targets.filter((el) => isPast(el, line))
  const pending = targets.filter((el) => !isPast(el, line))
  if (passed.length) gsap.set(passed, { '--draw': 1 })
  if (pending.length) ScrollTrigger.batch(pending, { start, once: true, onEnter: draw })
}
