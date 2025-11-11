/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        neutral: {
          100: 'var(--color-neutral-100)',
          900: 'var(--color-neutral-900)'
        }
      },
      borderRadius: {
        '2xl': '1.5rem'
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          md: '2rem',
          lg: '3rem'
        }
      }
    },
  },
  darkMode: 'class',
  plugins: [],
};


