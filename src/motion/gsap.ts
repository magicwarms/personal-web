/**
 * Single registration point for GSAP and its plugins.
 *
 * Imported for its side effects in `main.ts`, so plugins are registered once
 * for the whole app rather than in every component that animates. Every
 * plugin below ships in the public `gsap` package and is free for commercial
 * use — there is no auth token, private registry, or membership involved.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, ScrambleTextPlugin, CustomEase)

/**
 * The same literal curves as `--ease-out` / `--ease-in-out` in base.css.
 * Registering them here means the CSS transitions and the GSAP tweens share
 * one definition instead of two copies that quietly drift apart.
 */
CustomEase.create('site-out', '0.16,1,0.3,1')
CustomEase.create('site-in-out', '0.65,0,0.35,1')

gsap.defaults({ duration: 0.6, ease: 'site-out' })

/** Where a section's entrance fires: a sliver of it is on screen. */
export const REVEAL_START = 'top 82%'

/** Scrub lag, in seconds. Enough to smooth a trackpad without feeling loose. */
export const SCRUB = 0.6

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, ScrambleTextPlugin, CustomEase }
