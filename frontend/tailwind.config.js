/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0C0A09',
          900: '#15120F',
          800: '#1C1917',
          700: '#2A2522',
          600: '#3D3835',
        },
        paper: {
          DEFAULT: '#FAF7F2',
          dim: '#A8A29E',
          faint: '#5C5753',
        },
        ember: {
          DEFAULT: '#FF6B35',
          soft: '#FF8A5C',
          muted: 'rgba(255,107,53,0.12)',
        },
        moss: {
          DEFAULT: '#7E9E5C',
          muted: 'rgba(126,158,92,0.12)',
        },
        crimson: {
          DEFAULT: '#B23A3A',
          muted: 'rgba(178,58,58,0.12)',
        },
      },
      fontFamily: {
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(250,247,242,0.04), 0 20px 48px -24px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(250,247,242,0.06)',
        'card-hover': '0 1px 0 rgba(250,247,242,0.06), 0 32px 64px -24px rgba(0,0,0,0.95), inset 0 0 0 1px rgba(255,107,53,0.2)',
        ember: '0 0 32px -4px rgba(255,107,53,0.4)',
        'ember-sm': '0 0 12px -2px rgba(255,107,53,0.25)',
        subtle: 'inset 0 0 0 1px rgba(250,247,242,0.06)',
      },
      keyframes: {
        'pulse-ember': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.85)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'transcript-in': {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'pulse-ember': 'pulse-ember 1.6s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s ease-out both',
        'transcript-in': 'transcript-in 0.3s ease-out both',
      },
    },
  },
  plugins: [],
}
