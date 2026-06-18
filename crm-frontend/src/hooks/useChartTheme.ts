import { useTheme } from './useTheme'

/**
 * Theme-aware structural colors for Recharts (axes, grid, tooltip chrome).
 * Data-series colors (blue/green/etc.) stay constant across themes — only the
 * surrounding chart chrome flips so charts read correctly on light backgrounds.
 */
export function useChartTheme() {
  const { resolved } = useTheme()
  const dark = resolved === 'dark'
  return {
    axis: dark ? '#94a3b8' : '#64748b',
    grid: dark ? '#1e293b' : '#e2e8f0',
    tooltip: {
      background: dark ? '#1e293b' : '#ffffff',
      border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
      borderRadius: '8px',
      fontSize: '12px',
      color: dark ? '#f1f5f9' : '#0f172a',
    } as const,
  }
}
