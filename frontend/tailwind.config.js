/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      colors: {
        ink: {
          900: '#08090B', // page
          800: '#0F1115', // surface
          700: '#15181D', // raised
          600: '#1C2026', // hover
        },
        line: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          strong: 'rgba(255,255,255,0.14)',
        },
        accent: {
          100: '#F0E4CC',
          300: '#E0CB9E',
          400: '#D3B77F',
          500: '#C9A86C',
          600: '#B08F52',
          700: '#8C7140',
        },
        state: {
          pending: '#D9A03C',
          progress: '#6E9BD1',
          done: '#6FB287',
          closed: '#8A8F98',
          due: '#D07A6E',
        },
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'rise': 'rise 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
