import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          secondary: 'hsl(var(--surface-secondary))',
          tertiary: 'hsl(var(--surface-tertiary))',
        },
        content: {
          DEFAULT: 'hsl(var(--content))',
          muted: 'hsl(var(--content-muted))',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#5558e6',
        },
        border: 'hsl(var(--border))',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        node: '12px',
        panel: '8px',
      },
    },
  },
  plugins: [],
};

export default config;
