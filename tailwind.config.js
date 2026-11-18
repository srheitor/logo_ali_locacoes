import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          ...colors.teal,
          // Cores da identidade visual (src/assets/brand)
          ink: '#0B3D33', // "Logo" e fundo do favicon
          deep: '#0F7A63', // "Alí" e início do degradê do símbolo
          mint: '#2FBF9B', // fim do degradê do símbolo
        },
        accent: colors.amber,
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        brand: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
