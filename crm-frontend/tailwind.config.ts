import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        surface: {
          DEFAULT: '#0f172a',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1)',
        'card-hover': '0 10px 25px -5px rgba(0,0,0,.15)',
      }
    },
  },
  plugins: [],
} satisfies Config
