/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: '#FFFDF5',
          card: '#FFFFFF',
          dark: '#121212',
          yellow: '#FFE600',
          pink: '#FF5E8E',
          green: '#00E599',
          blue: '#00D2FF',
          purple: '#B388FF',
          orange: '#FF8800',
          red: '#FF4D4D',
          muted: '#F0EFE9'
        }
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px 0px #000000',
        'neo': '4px 4px 0px 0px #000000',
        'neo-md': '5px 5px 0px 0px #000000',
        'neo-lg': '7px 7px 0px 0px #000000',
        'neo-xl': '10px 10px 0px 0px #000000',
        'neo-inner': 'inset 2px 2px 0px 0px #000000'
      },
      borderWidth: {
        '3': '3px',
        '4': '4px'
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Impact', 'sans-serif']
      }
    },
  },
  plugins: [],
}
