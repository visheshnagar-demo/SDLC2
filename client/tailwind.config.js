/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F2C59",
          dark: "#0A1E3F",
          light: "#1E40AF",
        },
        genre: {
          navy: "#0F2C59",
          blue: "#1E40AF",
          sky: "#3B82F6",
          bg: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0",
          text: "#0F172A",
          muted: "#525F75",
          success: "#065F46",
          warning: "#92400E",
          danger: "#9F1239",
        },
      },
    },
  },
  plugins: [],
};
