/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          primary: 'var(--theme-primary)',
          secondary: 'var(--theme-secondary)',
          background: 'var(--theme-background)',
          text: 'var(--theme-text)',
          secondarytext: 'var(--theme-secondary-text)'
        }
      },
      fontFamily: {
        scoreboard: ['Scoreboard', 'Geist'],
        impact: ['Impact', 'Geist']
      }
    },
  },
  plugins: [],
}
