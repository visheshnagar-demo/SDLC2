/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2563EB",
          accent: "#0EA5E9",
          surface: "#151B2B",
          background: "#0D1322",
          card: "#191F2F",
          border: "#33394A",
          textPrimary: "#F8FAFC",
          textSecondary: "#94A3B8",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
        },
      },
    },
  },
  plugins: [],
};
