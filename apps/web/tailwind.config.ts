import forms from '@tailwindcss/forms';
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d8efff',
          500: '#0f8fe8',
          600: '#0877c8',
          700: '#075f9d',
          900: '#08355b'
        },
        ink: '#102133',
        signal: '#20c7a5'
      },
      boxShadow: {
        soft: '0 18px 45px rgba(16, 33, 51, 0.12)'
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Manrope', 'ui-sans-serif', 'sans-serif']
      }
    }
  },
  plugins: [forms]
} satisfies Config;
