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
          DEFAULT: 'var(--primary)',
          50: '#E6F0ED',
          100: '#CCE0DB',
          200: '#99C1B7',
          300: '#66A293',
          400: '#33836F',
          500: '#022C22',
          600: '#02231B',
          700: '#011A14',
          800: '#01120E',
          900: '#000907',
          foreground: 'var(--text-on-primary)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          50: '#F7FBEA',
          100: '#EFF7D5',
          200: '#DFEFAB',
          300: '#CFE781',
          400: '#BFD852',
          500: '#A8C341',
          600: '#849C33',
          700: '#637526',
          800: '#424E19',
          900: '#21270D',
          foreground: 'var(--text-on-secondary)',
        },
        background: {
          DEFAULT: 'var(--background)',
          dark: '#0A0A0A',
        },
        foreground: {
          DEFAULT: 'var(--foreground)',
          muted: 'var(--foreground-muted)',
        },
        card: {
          DEFAULT: 'var(--card)',
          hover: 'var(--card-hover)',
          foreground: 'var(--foreground)',
        },
        // Utility colors
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        info: 'var(--info)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--border-focus)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
export default config;

