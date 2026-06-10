import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
      },
      colors: {
        accent: '#e0f2fe',
      },
    },
  },
  plugins: [],
}
export default config













