/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2461F5",
          hover: "#1B4FD8",
          subtle: "#EDF2FF",
          dark: "#0F3BB8",
        },
        accent: {
          DEFAULT: "#0885E3",
          subtle: "#E6F4FE",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F5F7FC",
          muted: "#F8FAFC",
        },
        brandText: {
          primary: "#0F1729",
          secondary: "#66738A",
          muted: "#94A3B8",
        },
        brandBorder: {
          DEFAULT: "#E3E8F0",
          dark: "#CBD5E1",
        },
        risk: {
          low: "#0FA65C",
          moderate: "#F59E0A",
          high: "#F97316",
          critical: "#F04545",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
