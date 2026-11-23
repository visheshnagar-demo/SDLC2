/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2563EB',
          secondary: '#1E3A8A',
          accent: '#10B981',
          surface: '#171F33',
          background: '#0B1326',
          textPrimary: '#DAE2FD',
          textSecondary: '#C3C6D7',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444'
        }
      }
    }
  },
  plugins: []
};
