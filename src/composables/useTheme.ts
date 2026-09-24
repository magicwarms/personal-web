import { onBeforeUnmount, onMounted, readonly, ref } from 'vue'

export type Theme = 'light' | 'dark'

/** Shared with public/theme-init.js, which applies the theme before paint. */
const STORAGE_KEY = 'theme'

function readSaved(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'light' || saved === 'dark' ? saved : null
  } catch {
    return null
  }
}

/**
 * Light/dark theme on `<html data-theme>`. The reader's explicit choice is
 * saved; until they make one, the page follows the system setting live.
 *
 * The page is prerendered, so `theme` starts as 'light' on both server and
 * client and only picks up the real value after mount. Reading it during
 * setup would make the hydrated toggle label disagree with the server HTML.
 * The colors themselves never wait for this: theme-init.js has already set
 * `data-theme` before first paint.
 */
export function useTheme() {
  const theme = ref<Theme>('light')

  function apply(next: Theme) {
    theme.value = next
    document.documentElement.dataset.theme = next
  }

  function toggle() {
    const next: Theme = theme.value === 'dark' ? 'light' : 'dark'
    apply(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage blocked (private mode, strict settings): the choice still
      // applies for this visit, it just is not remembered.
    }
  }

  let query: MediaQueryList | undefined
  const onSystemChange = (event: MediaQueryListEvent) => {
    if (!readSaved()) apply(event.matches ? 'dark' : 'light')
  }

  onMounted(() => {
    query = window.matchMedia('(prefers-color-scheme: dark)')
    const current = document.documentElement.dataset.theme
    theme.value = current === 'light' || current === 'dark' ? current : query.matches ? 'dark' : 'light'
    query.addEventListener('change', onSystemChange)
  })

  onBeforeUnmount(() => query?.removeEventListener('change', onSystemChange))

  return { theme: readonly(theme), toggle }
}
