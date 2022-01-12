import { createContext, ReactNode, useContext, useState } from 'react'

export interface IThemeContext {
  isDarkTheme: boolean
  setIsDarkTheme: (isDark: boolean) => void
}

export const INITIAL_THEME: IThemeContext = {
  isDarkTheme: false,
  setIsDarkTheme: (isDark: boolean) => {},
}

export const ThemeContext = createContext<IThemeContext>(INITIAL_THEME)

export function ThemeProvider({
  children,
  isDarkTheme,
  setIsDarkTheme,
}: {
  children: ReactNode
  isDarkTheme: boolean
  setIsDarkTheme: (isDark: boolean) => void
}) {
  let value = { ...INITIAL_THEME, isDarkTheme, setIsDarkTheme }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
