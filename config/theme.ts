import { extendTheme } from '@chakra-ui/react'

export const defaultThemeObject = {
  styles: {
    global: () => ({
      body: {
        bg: '',
      },
    }),
  },
}

export const defaultTheme = extendTheme(defaultThemeObject)
