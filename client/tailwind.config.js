/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0B192C",
          slate: "#1E3E62",
          lightSlate: "#2E5077",
          teal: "#008080",
          tealLight: "#0D9488",
          accent: "#0284C7",
          surface: "#FFFFFF",
          surfaceAlt: "#F1F5F9",
          bg: "#F8FAFC",
        },
      },
    },
  },
  plugins: [],
};
