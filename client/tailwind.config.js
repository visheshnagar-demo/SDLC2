/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00288e",
          hover: "#001f70",
          container: "#1e40af",
          light: "#eff4ff",
        },
        surface: {
          DEFAULT: "#ffffff",
          subtle: "#f8f9ff",
          muted: "#f1f5f9",
          border: "#e2e8f0",
        },
        accent: {
          DEFAULT: "#059669",
          hover: "#047857",
          light: "#ecfdf5",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
