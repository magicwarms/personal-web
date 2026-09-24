/**
 * Which diagram node is highlighted, as a pure reducer so the event-order
 * quirks are testable.
 *
 * The one that matters: a tap focuses a tabindex element and then clicks
 * it. If any focus highlighted and the click toggled, every tap would switch
 * the highlight on and straight back off. So focus only counts when it is
 * keyboard focus (:focus-visible), and a mouse click (which follows a hover)
 * dispatches nothing at all.
 */
export type ActiveAction =
  | { type: 'hover'; id: string }
  | { type: 'unhover'; id: string }
  | { type: 'focus'; id: string; keyboard: boolean }
  | { type: 'blur'; id: string }
  /** A touch or pen tap, or an assistive-technology click. */
  | { type: 'tap'; id: string }
  /** Enter or Space on a focused node. */
  | { type: 'press'; id: string }
  | { type: 'clear' }

export function reduceActive(current: string | null, action: ActiveAction): string | null {
  switch (action.type) {
    case 'hover':
      return action.id
    case 'unhover':
    case 'blur':
      return current === action.id ? null : current
    case 'focus':
      return action.keyboard ? action.id : current
    case 'tap':
    case 'press':
      return current === action.id ? null : action.id
    case 'clear':
      return null
  }
}
