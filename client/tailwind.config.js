/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#0B1326',
        surface: {
          DEFAULT: '#0F172A',
          card: '#1E293B',
          container: '#171F33',
          border: '#334155',
          highlight: '#222A3D'
        },
        brand: {
          primary: '#0284C7',
          hover: '#0369A1',
          light: '#38BDF8',
          glow: 'rgba(2, 132, 199, 0.25)'
        },
        crypto: {
          emerald: '#10B981',
          amber: '#F59E0B',
          crimson: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    },
  },
  plugins: [],
}
