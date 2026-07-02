import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './modules/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          DEFAULT: '#4F7CFF',
          soft: '#E8EEFF'
        },
        argus: {
          DEFAULT: '#1B1F23',
          accent: '#2ECC71'
        },
        /** Gradiente compartilhado da marca (logo, títulos) — referência: material de branding AURA/ARGUS. */
        brand: {
          violet: '#7C3AED',
          indigo: '#6366F1',
          cyan: '#22D3EE'
        }
      }
    }
  },
  plugins: []
};

export default config;
