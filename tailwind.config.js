/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          50:  '#fdf8f0',
          100: '#f9eedb',
          200: '#f2d9b0',
          300: '#e8be80',
          400: '#dc9f4f',
          500: '#d4882e',
          600: '#c07023',
          700: '#a05720',
          800: '#824624',
          900: '#6b3b21',
          950: '#3d1e0f',
        },
        cream: {
          50:  '#fffef7',
          100: '#fefce8',
          200: '#fdf6c3',
          300: '#fbee90',
          400: '#f7e058',
        },
        charcoal: {
          800: '#1e1a16',
          900: '#14110d',
          950: '#0a0805',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
      },
      boxShadow: {
        'wood': '0 4px 24px 0 rgba(192, 112, 35, 0.15)',
        'card': '0 2px 16px 0 rgba(0,0,0,0.08)',
        'card-hover': '0 8px 32px 0 rgba(192, 112, 35, 0.2)',
      },
      backgroundImage: {
        'wood-gradient': 'linear-gradient(135deg, #d4882e 0%, #a05720 100%)',
        'dark-gradient': 'linear-gradient(135deg, #1e1a16 0%, #3d1e0f 100%)',
        'hero-gradient': 'linear-gradient(160deg, #14110d 0%, #3d1e0f 50%, #6b3b21 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
