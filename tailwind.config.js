/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgb(243 250 242)',
          100: 'rgb(220 241 218)',
          200: 'rgb(187 226 183)',
          300: 'rgb(147 207 142)',
          400: 'rgb(103 181 96)',
          500: 'rgb(68 154 60)',
          600: 'rgb(47 124 41)',
          700: 'rgb(39 103 34)',
          800: 'rgb(34 83 30)',
          900: 'rgb(28 68 25)',
          950: 'rgb(14 34 12)',
        },
        secondary: {
          50: 'rgb(236 253 245)',
          100: 'rgb(209 250 229)',
          200: 'rgb(167 243 208)',
          300: 'rgb(110 231 183)',
          400: 'rgb(52 211 153)',
          500: 'rgb(16 185 129)',
          600: 'rgb(5 150 105)',
          700: 'rgb(4 120 87)',
          800: 'rgb(6 95 70)',
          900: 'rgb(6 78 59)',
          950: 'rgb(2 44 34)',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};