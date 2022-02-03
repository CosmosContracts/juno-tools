const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      colors: {
        dark: '#06090B',
        gray: '#F3F6F8',
        'dark-gray': '#191D20',
        purple: '#7E5DFF',
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
