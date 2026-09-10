/**
 * Scroll velocity, normalised to roughly -1..1, shared between the page's
 * ScrollTrigger feeder (App.vue) and the particle canvas that consumes it.
 *
 * Deliberately a plain module-scope number rather than a Vue ref: this is
 * written on every scroll tick and read once per animation frame inside a
 * rAF loop. Reactivity there would buy nothing and cost a dependency-tracking
 * pass 60 times a second.
 */
let energy = 0

export function readEnergy(): number {
  return energy
}

export function writeEnergy(value: number): void {
  energy = value
}
