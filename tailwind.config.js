/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Darkmode komplett deaktivieren
  darkMode: false,
  theme: {
    extend: {
      colors: {
        brand1: '#D9ED92', // sehr helles Grün
        brand2: '#B5E48C',
        brand3: '#99D98C',
        brand4: '#76C893',
        brand5: '#52B69A',
        brand6: '#34A0A4',
        brand7: '#168AAD',
        brand8: '#1A759F',
        brand9: '#1E6091',
        brand10: '#184E77', // dunkelstes Blau
      },
    },
  },
  plugins: [],
  safelist: [
    'from-brand6', 'to-brand4', 'from-brand8', 'to-brand6', 'from-brand3', 'to-brand7', 'from-brand2', 'to-brand5',
    'bg-brand6', 'bg-brand4', 'bg-brand8', 'bg-brand3', 'bg-brand7', 'bg-brand2', 'bg-brand5'
  ],
}
