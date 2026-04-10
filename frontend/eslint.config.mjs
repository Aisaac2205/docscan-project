import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default [
  ...nextVitals,
  ...nextTs,
  {
    settings: {
      // Explicit version bypasses eslint-plugin-react@7 auto-detection
      // which calls the deprecated context.getFilename() in flat config mode
      react: { version: '19' },
    },
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'node_modules/**',
    ],
  },
]
