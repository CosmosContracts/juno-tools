const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ['./{components,contexts,hooks,pages,utils}/**/*.{js,cjs,mjs,ts,tsx}'],

  theme: {
    extend: {
      colors: {
        juno: { DEFAULT: '#CA706D' },
        dark: { DEFAULT: '#06090B' },
        gray: { DEFAULT: '#F3F6F8' },
        'dark-gray': { DEFAULT: '#191D20' },
        purple: { DEFAULT: '#7E5DFF' },

        neutral: colors.neutral,
        plumbus: {
          DEFAULT: '#F0827D',
          light: '#FF9D9E',
          matte: '#CA9991',
          dark: '#6E5451',
          10: '#FFF0ED',
          20: '#FACBC8',
          30: '#F5A7A2',
          40: '#F0827D',
          50: '#D9726F',
          60: '#C26261',
          70: '#AB5152',
          80: '#944144',
          90: '#7D3136',
          100: '#662027',
          110: '#4F1019',
          120: '#38000B',
        },
        twitter: { DEFAULT: '#1DA1F2' },
      },
      fontFamily: {
        heading: ["'Basement Grotesque'", ...defaultTheme.fontFamily.sans],
        sans: ['Roboto', ...defaultTheme.fontFamily.sans],
        mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
      },
    },
  },

  plugins: [
    // tailwindcss official plugins
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/line-clamp'),

    // custom gradient background
    plugin(({ addUtilities }) => {
      addUtilities({
        '.juno-gradient-bg': {
          background: `linear-gradient(63.38deg, rgba(29, 24, 24, 0.25) 45.06%, rgba(240, 130, 125, 0.25) 100.6%), #252020`,
        },
        '.juno-gradient-brand': {
          background: `linear-gradient(102.33deg, #F9BCB2 10.96%, #FFFFFF 93.51%)`,
        },
      })
    }),
  ],
}
