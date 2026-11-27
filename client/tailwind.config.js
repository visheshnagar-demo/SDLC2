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
          DEFAULT: '#0F172A',
          foreground: '#FFFFFF',
          container: '#1E293B',
          'on-primary': '#FFFFFF',
        },
        accent: {
          DEFAULT: '#4F46E5',
          foreground: '#FFFFFF',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          'container-lowest': '#FFFFFF',
          'container-low': '#F1F5F9',
          'on-surface': '#0B1C30',
        },
        'text-primary': '#0B1C30',
        'text-secondary': '#45464D',
      },
      fontFamily: {
        headline: ['"Hanken Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
}
