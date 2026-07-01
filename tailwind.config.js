/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          base: '#0F1629',
          surface: '#F8FAFC',
          accent: '#D97706',
          'accent-dark': '#B45309',
        },
      },
    },
  },
  plugins: [],
}
