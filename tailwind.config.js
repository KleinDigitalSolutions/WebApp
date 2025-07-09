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
    // Background
    'bg-brand1', 'bg-brand2', 'bg-brand3', 'bg-brand4', 'bg-brand5', 'bg-brand6', 'bg-brand7', 'bg-brand8', 'bg-brand9', 'bg-brand10',
    // Text
    'text-brand1', 'text-brand2', 'text-brand3', 'text-brand4', 'text-brand5', 'text-brand6', 'text-brand7', 'text-brand8', 'text-brand9', 'text-brand10',
    // Border
    'border-brand1', 'border-brand2', 'border-brand3', 'border-brand4', 'border-brand5', 'border-brand6', 'border-brand7', 'border-brand8', 'border-brand9', 'border-brand10',
    // Gradients
    'from-brand1', 'from-brand2', 'from-brand3', 'from-brand4', 'from-brand5', 'from-brand6', 'from-brand7', 'from-brand8', 'from-brand9', 'from-brand10',
    'to-brand1', 'to-brand2', 'to-brand3', 'to-brand4', 'to-brand5', 'to-brand6', 'to-brand7', 'to-brand8', 'to-brand9', 'to-brand10',
  ],
}
