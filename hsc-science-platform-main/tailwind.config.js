/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0f1b2d',
        green: '#00c896',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        bengali: ['Hind Siliguri', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
