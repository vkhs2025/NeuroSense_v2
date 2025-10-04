/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-blue': 'linear-gradient(135deg, #007cf0 0%, #00dfd8 100%)'
      },
      animation: {
        pulseGlow: 'pulseGlow 2s infinite'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(1.05)' }
        }
      }
    }
  },
  plugins: []
};
