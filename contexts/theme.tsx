import { createContext, ReactNode, useContext } from 'react'

export interface IThemeContext {
  theme: string
  setTheme: (theme: string) => void
}

export const INITIAL_THEME: IThemeContext = {
  theme: 'light',
  setTheme: (theme: string) => {},
}

export const ThemeContext = createContext<IThemeContext>(INITIAL_THEME)

export function ThemeProvider({
  children,
  theme,
  setTheme,
}: {
  children: ReactNode
  theme: string
  setTheme: (theme: string) => void
}) {
  let value = { ...INITIAL_THEME, theme, setTheme }
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
