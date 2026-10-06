/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dgYellow: {
          DEFAULT: "#FFC200",
          hover: "#E5AF00",
          light: "#FFF8E1",
        },
      },
    },
  },
  plugins: [],
};
