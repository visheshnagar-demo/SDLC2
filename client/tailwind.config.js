/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0284c7",
          600: "#0369a1",
          700: "#0f172a",
          800: "#0b1c30",
          900: "#0a1120",
        },
        brand: {
          dark: "#0F172A",
          blue: "#1E3A8A",
          accent: "#4F46E5",
          surface: "#FFFFFF",
          bg: "#F8FAFC",
        },
      },
    },
  },
  plugins: [],
};
