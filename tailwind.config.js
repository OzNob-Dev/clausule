/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      spacing: {
        'field-x': '13px',
        'field-y': '11px',
        'shell-x': '36px',
        'shell-y': '40px',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        // serif alias resolves to DM Sans — no serif typeface in the app shell
        serif: ['DM Sans', 'sans-serif'],
      },
      fontSize: {
        label: ['10px', { lineHeight: '1.2', letterSpacing: '0.08em' }],
        helper: ['12px', { lineHeight: '1.6' }],
        field: ['15px', { lineHeight: '1.5' }],
      },
      maxWidth: {
        shell: '1080px',
        auth: '440px',
        prose: '640px',
        modal: '34rem',
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
        blb: 'var(--blb, rgba(133,183,235,0.14))',
        blt: 'var(--blt, #85B7EB)',

        at: 'var(--at, #EF9F27)',
        ab: 'var(--ab, rgba(239,159,39,0.14))',

        gt: 'var(--gt, #5DCAA5)',
        gb: 'var(--gb, rgba(93,202,165,0.14))',

        rt: 'var(--rt, #F09595)',
        rb: 'var(--rb, rgba(240,149,149,0.14))',
        red: 'var(--red, #B83232)',
        'red-bg': 'var(--red-bg, rgba(184,50,50,0.12))',

        border: 'var(--border)',
        border2: 'var(--border2, var(--border))',
        'rule-em': 'var(--rule-em)',
        rule: 'var(--rule)',

      },
      borderRadius: {
        clausule: '10px',
        clausule2: '16px',
      },
      boxShadow: {
        surface: '0 24px 80px rgba(0,0,0,0.18)',
        float: '0 4px 16px rgba(60,45,35,0.07)',
      },
    },
  },
  plugins: [],
}
