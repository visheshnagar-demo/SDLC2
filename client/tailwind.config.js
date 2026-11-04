/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}"
  ],
  theme: {
    extend: {
      colors: {
        'citi-blue': '#002D62',
        'citi-blue-dark': '#00193C',
        'citi-blue-deep': '#0D1E3B',
        'citi-cyan': '#1793CF',
        'citi-secondary': '#0070BA',
        'citi-secondary-hover': '#056DAE',
        'citi-surface-banner': '#EBF3FB',
        'citi-track-blue': '#2B6BA5',
        'citi-text-primary': '#131B2E',
        'citi-text-secondary': '#475569',
        'citi-bg': '#F8FAFC'
      }
    },
  },
  plugins: [],
}
