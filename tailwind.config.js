const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      colors: {
        juno: '#CA706D',
        dark: '#06090B',
        gray: '#F3F6F8',
        'dark-gray': '#191D20',
        purple: '#7E5DFF',

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
      },
      fontFamily: {
        sans: ['Roboto', ...defaultTheme.fontFamily.sans],
        mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
      },
    },
  },

  plugins: [
    // https://daisyui.com
    require('daisyui'),

    // custom gradient background
    plugin(function ({ addUtilities }) {
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
