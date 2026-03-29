/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#1c1c1c', // Matching your dark UI background
        surface: '#2a2a2a',    // Matching your card backgrounds
      }
    },
  },
  plugins: [],
}