import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors' // Import default colors

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: { // Override entire color palette to ensure hex/rgb
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.gray, // Using neutral gray, can be swapped for slate if preferred
      // Define specific shades we use to ensure they are not oklch
      slate: { // Example: using Tailwind's slate hex values
        ...colors.slate, // Spread existing slate shades
        300: '#cbd5e1', // text-slate-300
        600: '#475569', // bg-slate-600
        700: '#334155', // bg-slate-700
      },
      purple: { // Example: using Tailwind's purple hex values
        ...colors.purple,
        300: '#c084fc', // hover:text-purple-300
        400: '#a855f7', // text-purple-400
        500: '#8b5cf6', // bg-purple-500
        600: '#7c3aed', // bg-purple-600
        700: '#6d28d9', // hover:bg-purple-700
      },
      green: { // Example: using Tailwind's green hex values
        ...colors.green,
        500: '#22c55e', // bg-green-500
      },
      yellow: { // Example: using Tailwind's yellow hex values
        ...colors.yellow,
        500: '#eab308', // bg-yellow-500
      },
      red: { // Example: using Tailwind's red hex values
        ...colors.red,
        500: '#ef4444', // bg-red-500
      },
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
