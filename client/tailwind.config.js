/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2461F5',
          dark: '#1A4CD2',
          light: '#EEF4FF',
        },
        accent: '#0FA65C',
        surface: '#FFFFFF',
        background: '#F7FAFC',
        textPrimary: '#0F1729',
        textSecondary: '#66738A',
        success: '#0FA65C',
        warning: '#F59E0A',
        danger: '#F04545',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
