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
      return current === action.id ? null : action.id
    case 'press':
      // Keyboard focus already lit the node, so the first Enter or Space must
      // not undo it; Escape or tabbing away clears.
      return action.id
    case 'clear':
      return null
  }
}

export interface ActiveResult {
  active: string | null
  /** The reader took over: stop the trace. */
  cancelTrace: boolean
}

/**
 * The same reducer while "Trace a request" may be playing. A trace owns the
 * lighting, so passive input (hover, mouse-style focus, blur) is ignored: the
 * button sits right under the diagram, and moving the pointer up to watch
 * would otherwise cancel the trace at once. Deliberate input (a tap, Enter or
 * Space, keyboard focus, Escape) ends it and takes over; a tap on the node that
 * is already active keeps it lit instead of toggling it off under the trace.
 */
export function reduceActiveDuring(current: string | null, action: ActiveAction, tracing: boolean): ActiveResult {
  if (!tracing) return { active: reduceActive(current, action), cancelTrace: false }

  switch (action.type) {
    case 'hover':
    case 'unhover':
    case 'blur':
      return { active: current, cancelTrace: false }
    case 'focus':
      return action.keyboard ? { active: action.id, cancelTrace: true } : { active: current, cancelTrace: false }
    case 'tap':
    case 'press':
      return { active: action.id, cancelTrace: true }
    case 'clear':
      return { active: null, cancelTrace: true }
  }
}
