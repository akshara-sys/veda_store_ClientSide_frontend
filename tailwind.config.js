/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This is critical
  ],
  theme: {
    extend: {
      colors: {
        'vs-cream': '#FAF8F2',
        'vs-green': '#1B4332',
        'vs-dark': '#2C2C2C',
        'vs-red': '#D9381E',
        'vs-gold': '#E5B040',
        'vs-border': '#E8E3D8',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}