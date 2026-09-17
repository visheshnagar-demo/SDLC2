/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dgYellow: "#FFDD00",
        dgDark: "#090D16",
        dgSurface: "#0F172A",
        dgCard: "#1E293B",
        dgBorder: "#334155",
        dgTextPrimary: "#F8FAFC",
        dgTextSecondary: "#94A3B8",
        dgAccent: "#10B981",
        dgWarning: "#F59E0B",
        dgError: "#F43F5E",
      },
    },
  },
  plugins: [],
};
