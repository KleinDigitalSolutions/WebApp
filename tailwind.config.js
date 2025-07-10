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
        // Primary Brand Colors
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          500: '#FF6B35', // Main brand color
          600: '#EA580C',
          700: '#C2410C',
          900: '#9A3412'
        },
        // Success & Health Colors
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857'
        },
        // Premium Purple
        premium: {
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9'
        },
        // Warm Neutrals
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717'
        }
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
