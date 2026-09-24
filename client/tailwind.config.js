/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dg: {
          yellow: "#FDB813",
          dark: "#0F172A",
          slate: "#1E293B",
          muted: "#64748B",
          surface: "#FFFFFF",
          bg: "#F8FAFC",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
