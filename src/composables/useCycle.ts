import { computed, onMounted, onScopeDispose, ref, watch } from 'vue'
import type { Ref } from 'vue'

export interface UseCycleOptions {
  /** Number of items to cycle through. */
  length: number
  /** Milliseconds each item stays on screen. */
  intervalMs: number
  /**
   * When false the timer never runs — used to honour `prefers-reduced-motion`,
   * where content should not move on its own.
   */
  enabled?: Ref<boolean> | (() => boolean)
}

export interface UseCycle {
  index: Readonly<Ref<number>>
  /** True while the timer is actually advancing the index. */
  isRunning: Readonly<Ref<boolean>>
  /** Jump to an item and stop auto-advancing — the user has taken over. */
  select: (next: number) => void
  /** Temporarily hold (hover, focus, hidden tab). */
  pause: () => void
  resume: () => void
  /** Stop for good. */
  stop: () => void
}

/**
 * Auto-advancing index with the housekeeping that is easy to forget: the timer
 * is cleared on unmount, held while the tab is hidden, and never started when
 * the user has asked for reduced motion.
 */
export function useCycle({ length, intervalMs, enabled }: UseCycleOptions): UseCycle {
  const index = ref(0)
  const isPaused = ref(false)
  const isStopped = ref(false)
  const isDocumentHidden = ref(false)

  let timer: ReturnType<typeof setInterval> | undefined

  const isEnabled = computed(() => {
    if (typeof enabled === 'function') return enabled()
    return enabled ? enabled.value : true
  })

  const isRunning = computed(
    () => isEnabled.value && !isPaused.value && !isStopped.value && !isDocumentHidden.value,
  )

  function clear() {
    if (timer !== undefined) {
      clearInterval(timer)
      timer = undefined
    }
  }

  function start() {
    clear()
    if (!isRunning.value || length < 2) return
    timer = setInterval(() => {
      index.value = (index.value + 1) % length
    }, intervalMs)
  }

  function select(next: number) {
    isStopped.value = true
    index.value = ((next % length) + length) % length
  }

  function pause() {
    isPaused.value = true
  }

  function resume() {
    isPaused.value = false
  }

  function stop() {
    isStopped.value = true
  }

  function onVisibilityChange() {
    isDocumentHidden.value = document.visibilityState === 'hidden'
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', onVisibilityChange)
    onVisibilityChange()
    start()
  })

  // Re-arm whenever the running state flips, so a resumed cycle always gets a
  // full interval rather than firing immediately.
  watch(isRunning, (running) => (running ? start() : clear()))

  onScopeDispose(() => {
    clear()
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  })

  return { index, isRunning, select, pause, resume, stop }
}
