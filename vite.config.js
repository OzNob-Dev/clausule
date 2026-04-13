import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

// Vercel handles compression at the CDN edge — pre-compressed files are only
// useful for self-hosted deployments (Nginx, Caddy, etc.).
// Set VITE_PRECOMPRESS=true to emit .gz / .br siblings in dist/assets.
const precompress = process.env.VITE_PRECOMPRESS === 'true'

export default defineConfig({
  plugins: [
    react(),
    // Gzip — served by most CDNs and web servers automatically
    precompress && compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // only compress files > 1 KB
      deleteOriginFile: false,
    }),
    // Brotli — better compression ratio, supported by all modern browsers
    precompress && compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
    }),
  ],

  build: {
    // Emit a warning when a chunk exceeds 500 KB before compression
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        // Split vendor libraries into separate chunks so they can be cached
        // independently from app code — libraries change less frequently
        manualChunks(id) {
          if (id.includes('node_modules/react-dom/')) return 'vendor-react-dom'
          if (id.includes('node_modules/react-router-dom/')) return 'vendor-router'
          if (id.includes('node_modules/react/') || id.includes('node_modules/scheduler/')) return 'vendor-react'
          if (id.includes('node_modules/')) return 'vendor'
        },

        // Content-addressed filenames — the hash changes only when the file
        // content changes, so CDNs and browsers can cache assets aggressively
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },

    // Use esbuild for JS minification — fast and produces small output
    minify: 'esbuild',

    // Minify CSS with lightningcss — better compression than esbuild's CSS pass
    cssMinify: 'lightningcss',

    // Inline assets smaller than 4 KB to reduce round trips
    assetsInlineLimit: 4096,

    // Generate source maps only for production debugging — omit in CI if not needed
    sourcemap: false,
  },
})
