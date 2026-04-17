/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          bg: 'rgba(255, 255, 255, 0.03)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        bg: {
          dark: '#0f172a',
        },
        text: {
          main: '#f8fafc',
          muted: '#cbd5e1',
        },
        accent: {
          DEFAULT: '#7c3aed',
          hover: '#6d28d9',
          pink: '#ec4899',
          blue: '#3b82f6',
        }
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #7c3aed, #ec4899)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
