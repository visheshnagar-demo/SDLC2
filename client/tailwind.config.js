/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dg: {
          yellow: "#FACC15",
          gold: "#EAB308",
          dark: "#0F172A",
          surface: "#1E293B",
          card: "#1E293B",
          border: "#334155",
          muted: "#94A3B8",
          light: "#F8FAFC",
        },
      },
    },
  },
  plugins: [],
};
