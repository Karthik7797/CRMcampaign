import type { Config } from 'tailwindcss'

// Colors resolve from CSS variables (see src/index.css). Channel-triplet vars
// + the rgb(var() / <alpha-value>) form keep every existing opacity modifier
// (e.g. bg-surface-700/50, bg-blue-500/15) working while enabling light/dark.
const withVar = (name: string) => `rgb(var(${name}) / <alpha-value>)`
// shadcn/ui semantic tokens are stored as HSL triplets (see src/index.css).
const hsl = (name: string) => `hsl(var(${name}))`

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: withVar('--brand-50'),
          100: withVar('--brand-100'),
          400: withVar('--brand-400'),
          500: withVar('--brand-500'),
          600: withVar('--brand-600'),
          700: withVar('--brand-700'),
          900: withVar('--brand-900'),
        },
        surface: {
          DEFAULT: withVar('--surface-DEFAULT'),
          50: withVar('--surface-50'),
          100: withVar('--surface-100'),
          200: withVar('--surface-200'),
          600: withVar('--surface-600'),
          700: withVar('--surface-700'),
          800: withVar('--surface-800'),
          900: withVar('--surface-900'),
        },
        // Override slate so text classes flip with the theme (dark text in light
        // mode, light text in dark mode). Other slate shades fall back to the
        // closest defined token.
        slate: {
          50: withVar('--slate-50'),
          100: withVar('--slate-100'),
          200: withVar('--slate-200'),
          300: withVar('--slate-300'),
          400: withVar('--slate-400'),
          500: withVar('--slate-500'),
          600: withVar('--slate-400'),
          700: withVar('--slate-300'),
          800: withVar('--slate-200'),
          900: withVar('--slate-100'),
        },
        // shadcn/ui semantic colors (additive — resolve to the HSL tokens in
        // src/index.css). These power components in src/components/ui without
        // affecting the existing brand/surface/slate utilities or component classes.
        border: hsl('--border'),
        input: hsl('--input'),
        ring: hsl('--ring'),
        background: hsl('--background'),
        foreground: hsl('--foreground'),
        primary: {
          DEFAULT: hsl('--primary'),
          foreground: hsl('--primary-foreground'),
        },
        secondary: {
          DEFAULT: hsl('--secondary'),
          foreground: hsl('--secondary-foreground'),
        },
        destructive: {
          DEFAULT: hsl('--destructive'),
          foreground: hsl('--destructive-foreground'),
        },
        muted: {
          DEFAULT: hsl('--muted'),
          foreground: hsl('--muted-foreground'),
        },
        accent: {
          DEFAULT: hsl('--accent'),
          foreground: hsl('--accent-foreground'),
        },
        popover: {
          DEFAULT: hsl('--popover'),
          foreground: hsl('--popover-foreground'),
        },
        card: {
          DEFAULT: hsl('--card'),
          foreground: hsl('--card-foreground'),
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(var(--shadow-color) / calc(var(--shadow-strength) * 0.75))',
        card: '0 1px 3px 0 rgb(var(--shadow-color) / var(--shadow-strength)), 0 1px 2px -1px rgb(var(--shadow-color) / var(--shadow-strength))',
        'card-hover': '0 10px 25px -5px rgb(var(--shadow-color) / calc(var(--shadow-strength) * 1.5)), 0 4px 10px -6px rgb(var(--shadow-color) / var(--shadow-strength))',
        lg: '0 10px 30px -10px rgb(var(--shadow-color) / calc(var(--shadow-strength) * 1.6))',
        dropdown: '0 12px 32px -8px rgb(var(--shadow-color) / calc(var(--shadow-strength) * 1.8))',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
