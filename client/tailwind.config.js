/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dg: {
          yellow: "#FFD200",
          dark: "#0B132B",
          surface: "#0F172A",
          surfaceAlt: "#1E293B",
          border: "#334155",
          textMuted: "#94A3B8",
        },
        brand: {
          grow: "#10B981",
          maintain: "#38BDF8",
          swap: "#F59E0B",
          reduce: "#F43F5E",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
