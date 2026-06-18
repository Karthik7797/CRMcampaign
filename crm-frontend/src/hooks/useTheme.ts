import { useEffect } from 'react'
import { useStore, type Theme } from '../store/useStore'

// Note: keep this resolver in sync with the pre-paint script in index.html so
// the class applied before React mounts matches what this hook computes.
function resolve(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

function apply(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', resolve(theme) === 'dark')
}

/**
 * Applies the current theme to <html> and, when in `system` mode, keeps it in
 * sync with the OS preference. Mount once near the app root.
 */
export function useTheme() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)

  useEffect(() => {
    apply(theme)
  }, [theme])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => apply('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  return { theme, setTheme, resolved: resolve(theme) }
}
