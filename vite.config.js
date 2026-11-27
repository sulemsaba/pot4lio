import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// The public address of the site, used for link previews (WhatsApp, LinkedIn, X).
// GitHub Pages is the default. On another host, build with:
//   SITE_URL=https://your-domain.com npm run build
const SITE_URL = (process.env.SITE_URL || 'https://sulemsaba.github.io/pot4lio').replace(/\/$/, '')

export default defineConfig({
  // Relative asset paths, so the same build works on GitHub Pages (a /pot4lio/ subpath)
  // and on Netlify, Vercel or Cloudflare Pages (the domain root).
  base: './',
  plugins: [
    vue(),
    {
      name: 'site-url',
      transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', SITE_URL),
    },
  ],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Two pages: the site, and the admin page at /admin/ that edits it.
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('index.html', import.meta.url)),
        admin: fileURLToPath(new URL('admin/index.html', import.meta.url)),
      },
    },
  },
})
