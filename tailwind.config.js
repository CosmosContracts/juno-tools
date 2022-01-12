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
      },
    },
  },
  plugins: [require('daisyui')],
}
