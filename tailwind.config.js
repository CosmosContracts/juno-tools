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
      },
    },
  },
  plugins: [require('daisyui')],
}
