/*
 * Runs in <head> before first paint, so a saved dark choice never flashes
 * light. It is a same-origin file rather than an inline script because the
 * server's CSP only allows scripts from 'self'. Keep the storage key in sync
 * with src/composables/useTheme.ts.
 */
;(function () {
  var theme
  try {
    theme = localStorage.getItem('theme')
  } catch (error) {
    theme = null
  }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  document.documentElement.setAttribute('data-theme', theme)
})()
