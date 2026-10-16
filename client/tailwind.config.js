/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0F172A",
          indigo: "#4338CA",
          bg: "#F8FAFC",
          muted: "#64748B",
          success: "#059669",
          warning: "#D97706",
          danger: "#E11D48",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
