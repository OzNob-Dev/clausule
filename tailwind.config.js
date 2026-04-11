/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Source Sans 3', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
      colors: {
        nav: {
          DEFAULT: '#1C2540',
          dark: '#141B30',
        },
        canvas: {
          DEFAULT: '#F5F2EC',
          dark: '#1A1E26',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#222730',
        },
        accent: '#C9A84C',
        // Text
        tp: { DEFAULT: '#1A1F2B', dark: '#E8E5DF' },
        ts: { DEFAULT: '#4A4A47', dark: '#9A9994' },
        tm: { DEFAULT: '#9A9994', dark: '#6B6B68' },
        tc: { DEFAULT: '#C4C0BA', dark: '#4A4A47' },
        // Semantic status
        bl: { DEFAULT: '#4A6FA5', dark: '#6B9FD4' },
        blb: { DEFAULT: '#E6F1FB', dark: '#1A2840' },
        blt: { DEFAULT: '#185FA5', dark: '#85B7EB' },
        ab: { DEFAULT: '#FAEEDA', dark: '#2A2010' },
        at: { DEFAULT: '#854F0B', dark: '#EF9F27' },
        gb: { DEFAULT: '#EAF3DE', dark: '#182310' },
        gt: { DEFAULT: '#3B6D11', dark: '#97C459' },
        rb: { DEFAULT: '#FCEBEB', dark: '#2A1010' },
        rt: { DEFAULT: '#A32D2D', dark: '#F09595' },
        // Category colors
        cat: {
          perf: '#4A6FA5',
          conduct: '#BA7517',
          dev: '#639922',
        },
        // Brag doc palette
        brag: {
          canvas: '#F7F3EE',
          card: '#FDFCFA',
          nav: '#2E2820',
          accent: '#C46B4A',
          'accent-light': '#FAECE7',
          'accent-mid': '#F0997B',
          gold: '#C9A84C',
          tp: '#1E1A16',
          ts: '#4A3F36',
          tm: '#8C7B6E',
        },
      },
      borderRadius: {
        ledger: '5px',
      },
    },
  },
  plugins: [],
}
