import nextVitals from 'eslint-config-next/core-web-vitals'

const testGlobals = {
  afterAll: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  beforeEach: 'readonly',
  describe: 'readonly',
  expect: 'readonly',
  it: 'readonly',
  vi: 'readonly',
}

const config = [
  {
    ignores: [
      '.next/**',
      'coverage/**',
      'node_modules/**',
      'test-results/**',
    ],
  },
  ...nextVitals,
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    files: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: testGlobals,
    },
    rules: {
      'react/display-name': 'off',
    },
  },
]

export default config
