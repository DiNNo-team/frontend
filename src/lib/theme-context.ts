import { createContext, useContext } from 'react'

export type Theme = 'light' | 'dark'

/** Same key the inline script in `index.html` reads before the bundle loads. */
export const THEME_STORAGE_KEY = 'dinno-theme'

export interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>')
  return context
}
