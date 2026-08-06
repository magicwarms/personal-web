import { onScopeDispose, readonly, ref } from 'vue'
import type { Ref } from 'vue'

/**
 * Tracks `prefers-reduced-motion`, live. Motion's own `MotionConfig` handles
 * transform animations; this is for the things it can't know about, such as
 * whether content should auto-advance on a timer at all.
 */
export function usePrefersReducedMotion(): Readonly<Ref<boolean>> {
  const prefersReducedMotion = ref(false)

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = query.matches

    const onChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion.value = event.matches
    }

    query.addEventListener('change', onChange)
    onScopeDispose(() => query.removeEventListener('change', onChange))
  }

  return readonly(prefersReducedMotion)
}
