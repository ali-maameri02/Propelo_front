/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        almarai: ['Almarai', 'sans-serif'],
      },
      colors: {
        color1: "#2563EB",
        color2: "#334155",
        color3: "#DBEAFE",
        color4: "#22D3EE",
        textcolor: "#252729",
        span_color: "#0F172A",
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
