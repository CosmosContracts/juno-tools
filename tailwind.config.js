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

        plumbus: {
          DEFAULT: '#F0827D',
          light: '#FF9D9E',
          matte: '#CA9991',
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
    },
  },
  plugins: [require('daisyui')],
}
