/** @deprecated please refactor theme context usage, this will return placeholders */
export function useTheme() {
  return { isDarkTheme: true, setIsDarkTheme: (isDarkTheme: boolean) => {} }
}
