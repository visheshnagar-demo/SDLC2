/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        genre: {
          navy: "#0F2744",
          blue: "#1E3A8A",
          sky: "#0284C7",
          light: "#F8FAFC",
          dark: "#0A192F",
        },
      },
    },
  },
  plugins: [],
};
