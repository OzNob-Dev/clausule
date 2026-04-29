/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        // serif alias resolves to DM Sans — no serif typeface in the app shell
        serif: ['DM Sans', 'sans-serif'],
      },
      colors: {
        nav: 'var(--nav)',
        canvas: 'var(--canvas)',
        card: 'var(--card)',
        'bg-doc': 'var(--bg-doc)',
        'bg-comp': 'var(--bg-comp)',
        
        acc: 'var(--acc)',
        'acc-text': 'var(--acc-text)',
        'acc-tint': 'var(--acc-tint)',
        'acc-bg': 'var(--acc-bg)',
        'acc-border': 'var(--acc-border)',

        tp: 'var(--tp)',
        ts: 'var(--ts)',
        tm: 'var(--tm)',
        tc: 'var(--tc)',
        'tx-1': 'var(--tx-1)',
        'tx-2': 'var(--tx-2)',
        'tx-3': 'var(--tx-3)',
        'tx-4': 'var(--tx-4)',

        bl: 'var(--bl)',
        blb: 'var(--blb, var(--cl-blue-alpha-12))',
        blt: 'var(--blt, var(--cl-blue))',

        at: 'var(--at, var(--cl-warning-2))',
        ab: 'var(--ab, var(--cl-gold-alpha-14))',

        gt: 'var(--gt, var(--cl-success-3))',
        gb: 'var(--gb, var(--cl-green-alpha-12))',

        rt: 'var(--rt, var(--cl-red-soft-alpha-18))',
        rb: 'var(--rb, var(--cl-red-alpha-14))',
        red: 'var(--red, var(--cl-danger))',
        'red-bg': 'var(--red-bg, var(--cl-danger-soft-3))',

        border: 'var(--border)',
        border2: 'var(--border2, var(--border))',
        'rule-em': 'var(--rule-em)',
        rule: 'var(--rule)',

      },
      borderRadius: {
        clausule: '10px',
        clausule2: '16px',
      },
    },
  },
  plugins: [],
}
