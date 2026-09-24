/**
 * Alias-free so the unit tests can import it without Vite.
 *
 * A rule has "passed" once its top edge is anywhere above the viewport's
 * bottom edge. Not a fraction short of it: the scroll trigger fires earlier,
 * but this decides what is already on screen when a builder runs, and a rule
 * already visible must never be left hidden.
 */
export function hasPassed(top: number, viewportHeight: number): boolean {
  return top < viewportHeight
}
