import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  styles: {
    global: () => ({
      body: {
        bg: '',
      },
    }),
  },
})

export const defaultThemeObject = {
  styles: {
    global: () => ({
      bg: '',
    }),
  },
}

export const defaultTheme = extendTheme(defaultThemeObject)
