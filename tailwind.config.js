/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        spotify: {
          green: '#1DB954',
          dark: '#121212',
          gray: '#2b2b2b',
        }
      }
    },
  },
  plugins: [],
}
