import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Albert Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        stone: {
          25: '#FAFAF8',
          50: '#F7F5F2',
          75: '#F2EFE9',
          100: '#E8E4DD',
          200: '#D5CFC6',
          300: '#B8B0A5',
          400: '#9A9189',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
          950: '#0C0A09',
        },
        accent: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
      },
      borderRadius: {
        DEFAULT: '6px',
        'sm': '4px',
        'md': '6px',
        'lg': '10px',
        'xl': '14px',
        '2xl': '20px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'elevated': '0 4px 12px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)',
        'modal': '0 20px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
