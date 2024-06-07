import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'main-color': '#FFF9F9',
        'font-color': '#374151',
        'card-color': '#FDFBF5',
      },
      boxShadow: {
        'card': '0px 4px 4px rgba(0, 0, 0, 0.25);'
      },
      minHeight: {
        'sm-center-height': 'calc(var(--vh, 1vh) * 100)'
      }
    },
  },
  plugins: [],
}
export default config
