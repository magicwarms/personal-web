/**
 * Single registration point for GSAP and its plugins.
 *
 * Imported for its side effects in `main.ts`, so plugins are registered once
 * for the whole app rather than in every component that animates. GSAP
 * drives the scroll reveals, hairline draw-in, label progress, hero depth,
 * the diagram trace, and the earlier-roles accordion. The hero load stagger
 * and the diagram's idle pulses stay in CSS; the signal field is Canvas 2D.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(ScrollTrigger, CustomEase)

/**
 * The same literal curves as `--ease-out` / `--ease-in-out` in base.css.
 * Registering them here means the CSS transitions and the GSAP tweens share
 * one definition instead of two copies that quietly drift apart.
 */
CustomEase.create('site-out', '0.16,1,0.3,1')
CustomEase.create('site-in-out', '0.65,0,0.35,1')

gsap.defaults({ duration: 0.45, ease: 'site-out' })

/** Where a block's entrance fires: a sliver of it is on screen. */
export const REVEAL_START = 'top 90%'

export { gsap, ScrollTrigger, CustomEase }
