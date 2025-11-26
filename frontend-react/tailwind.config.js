/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          500: '#D4AF37',
          600: '#B8941F',
          700: '#9A7A1A'
        }
      }
    },
  },
  plugins: [],
}