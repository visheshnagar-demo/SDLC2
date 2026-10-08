/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3525cd",
          dark: "#271ba3",
          light: "#eef0ff",
        },
        accent: "#4f46e5",
        brand: {
          surface: "#f8f9ff",
          dark: "#0f172a",
        },
      },
    },
  },
  plugins: [],
};
