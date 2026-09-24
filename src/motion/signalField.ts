/**
 * The signal field: a fixed dot grid behind the page whose density bands
 * drift like a signal. Adapted from the "Signal Particles" background on
 * thegamechangers.id, keeping its look and removing its per-dot cost.
 *
 * Framework-free on purpose: the math is exported for the unit tests, and
 * nothing here knows about Vue. SignalField.vue owns the page wiring.
 */

/** Dots are drawn only above this summed wave value. */
const THRESHOLD = 0.1
/** Peak dot alpha, the reference's visible strength. */
const MAX_ALPHA = 0.6
/** Alpha is quantized into this many levels, one fill call each. */
export const LEVELS = 6

export interface AxisTerms {
  /** Per column i: sin(0.1i + 0.5t). */
  sinA: Float64Array
  /** Per column i: sin and cos of (0.05i + 0.8t). */
  sinC: Float64Array
  cosC: Float64Array
  /** Per row j, with j' = j + rowOffset: cos(0.1j' - 0.3t). */
  cosB: Float64Array
  /** Per row j: cos and sin of 0.05j'. */
  cosD: Float64Array
  sinD: Float64Array
}

/** The reference's per-dot formula. Kept for the tests; the draw loop never calls it. */
export function waveReference(i: number, jPrime: number, t: number): number {
  const nx = 0.1 * i
  const ny = 0.1 * jPrime
  return Math.sin(nx + 0.5 * t) * Math.cos(ny - 0.3 * t) + Math.sin(0.5 * nx - 0.5 * ny + 0.8 * t)
}

/**
 * Both waves split into column and row factors (the second through
 * sin(c - d) = sin c cos d - cos c sin d), so a frame costs about
 * 3 x (cols + rows) trig calls instead of 3 x cols x rows.
 */
export function buildAxisTerms(cols: number, rows: number, t: number, rowOffset: number): AxisTerms {
  const sinA = new Float64Array(cols + 1)
  const sinC = new Float64Array(cols + 1)
  const cosC = new Float64Array(cols + 1)
  for (let i = 0; i <= cols; i++) {
    sinA[i] = Math.sin(0.1 * i + 0.5 * t)
    const c = 0.05 * i + 0.8 * t
    sinC[i] = Math.sin(c)
    cosC[i] = Math.cos(c)
  }

  const cosB = new Float64Array(rows + 1)
  const cosD = new Float64Array(rows + 1)
  const sinD = new Float64Array(rows + 1)
  for (let j = 0; j <= rows; j++) {
    const jPrime = j + rowOffset
    cosB[j] = Math.cos(0.1 * jPrime - 0.3 * t)
    const d = 0.05 * jPrime
    cosD[j] = Math.cos(d)
    sinD[j] = Math.sin(d)
  }

  return { sinA, sinC, cosC, cosB, cosD, sinD }
}

export function valueAt(terms: AxisTerms, i: number, j: number): number {
  return terms.sinA[i] * terms.cosB[j] + terms.sinC[i] * terms.cosD[j] - terms.cosC[i] * terms.sinD[j]
}

/**
 * 0 for a skipped dot, otherwise 1..LEVELS. The epsilon keeps float noise
 * (0.30000000000000004 / 0.1) from bumping a dot up a level.
 */
export function alphaLevel(value: number): number {
  if (value <= THRESHOLD) return 0
  const alpha = Math.min(MAX_ALPHA, (value - THRESHOLD) * 0.8)
  return Math.min(LEVELS, Math.max(1, Math.ceil(alpha / 0.1 - 1e-9)))
}

/** The reference's hash, about 1.5% of dots. Screen indices, so a highlight never moves. */
export function isHighlight(i: number, j: number): boolean {
  return Math.abs(Math.sin(i * 12.34) * Math.cos(j * 56.78)) > 0.98
}
