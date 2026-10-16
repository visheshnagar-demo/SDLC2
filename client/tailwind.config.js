/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2461F5",
          hover: "#1B4ED8",
          light: "#EDF2FF",
        },
        accent: "#0885E3",
        surface: "#FFFFFF",
        background: "#F7FAFC",
        textPrimary: "#0F1729",
        textSecondary: "#66738A",
        success: "#0FA65C",
        warning: "#F59E0A",
        danger: "#F04545",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
