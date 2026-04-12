/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        // serif alias resolves to DM Sans — no serif typeface in the app shell
        serif: ['DM Sans', 'sans-serif'],
      },
      colors: {
        // Surfaces (warm brown, dark-first)
        nav: '#2A221A',
        canvas: '#2C241C',
        card: '#342B22',

        // Brand accent — terracotta
        accent: '#D05A34',
        'accent-text': '#F5A070',
        'accent-tint': 'rgba(208,90,52,0.18)',

        // Text ramp (all AAA ≥7:1 on surfaces)
        tp: '#FBF7F2',
        ts: '#C8C4BE',
        tm: '#B8B2AC',
        tc: '#B3B0AB',

        // Semantic: blue = performance (8.0:1)
        bl:  '#85B7EB',
        blb: 'rgba(133,183,235,0.14)',
        blt: '#85B7EB',

        // Semantic: amber = conduct / warning (7.8:1)
        at: '#EF9F27',
        ab: 'rgba(239,159,39,0.14)',

        // Semantic: teal = development / success (8.4:1)
        gt: '#5DCAA5',
        gb: 'rgba(93,202,165,0.14)',

        // Semantic: red = escalation / danger (7.6:1)
        rt: '#F09595',
        rb: 'rgba(240,149,149,0.14)',

        // Category dots
        cat: {
          perf:    '#85B7EB',
          conduct: '#EF9F27',
          dev:     '#5DCAA5',
        },
      },
      borderRadius: {
        clausule: '10px',
        clausule2: '16px',
      },
    },
  },
  plugins: [],
}
