/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0e1a',
        space: {
          dark: '#0a0e1a',
          mid: '#0f1424',
          light: '#1a1f36',
        },
        text: {
          light: '#e8edf5',
          muted: '#94a3b8',
        },
        primary: {
          cyan: '#00d4ff',
          DEFAULT: '#00d4ff',
        },
        ai: {
          purple: '#7c3aed',
          DEFAULT: '#7c3aed',
        },
        success: {
          green: '#10b981',
          DEFAULT: '#10b981',
        },
        brand: {
          cyan: '#00d4ff',
          purple: '#7c3aed',
          green: '#10b981',
          blue: '#2563eb',
          amber: '#f59e0b',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '16px', // Standardize to 16px as requested
        'card': '16px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orb-float-1': 'orbFloat1 18s ease-in-out infinite',
        'orb-float-2': 'orbFloat2 22s ease-in-out infinite',
        'orb-float-3': 'orbFloat3 26s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        orbFloat1: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(120px, 80px) scale(1.15)' },
          '66%': { transform: 'translate(-80px, 140px) scale(0.95)' },
        },
        orbFloat2: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(-140px, -100px) scale(1.1)' },
          '66%': { transform: 'translate(100px, -60px) scale(0.9)' },
        },
        orbFloat3: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(100px, -120px) scale(1.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
