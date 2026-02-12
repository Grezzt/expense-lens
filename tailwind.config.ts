import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          DEFAULT: '#022C22',  // Hijau tua
          50: '#E6F0ED',
          100: '#CCE0DB',
          200: '#99C1B7',
          300: '#66A293',
          400: '#33836F',
          500: '#022C22',      // Main
          600: '#02231B',
          700: '#011A14',
          800: '#01120E',
          900: '#000907',
        },
        secondary: {
          DEFAULT: '#BFD852',  // Hijau muda
          50: '#F7FBEA',
          100: '#EFF7D5',
          200: '#DFEFAB',
          300: '#CFE781',
          400: '#BFD852',      // Main
          500: '#A8C341',
          600: '#849C33',
          700: '#637526',
          800: '#424E19',
          900: '#21270D',
        },
        background: {
          DEFAULT: '#F1F1F1',  // Background
          dark: '#0A0A0A',
        },
        // Utility colors
        success: '#BFD852',    // Use secondary
        warning: '#F59E0B',
        error: '#DC2626',
        info: '#3B82F6',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;

