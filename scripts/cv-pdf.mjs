// Prints the CV page of the built site to public/suleiman-msaba-cv.pdf, so the
// download always matches the page. Run with: npm run cv:pdf
// Needs Chrome or Chromium installed (set CHROME=/path/to/chrome if it is not found).
import { execFile, spawnSync } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { preview } from 'vite'

const root = fileURLToPath(new URL('..', import.meta.url))
const out = fileURLToPath(new URL('../public/suleiman-msaba-cv.pdf', import.meta.url))

function findChrome() {
  const names = [process.env.CHROME, 'chromium-browser', 'chromium', 'google-chrome', 'google-chrome-stable'].filter(Boolean)
  for (const name of names) {
    if (spawnSync(name, ['--version'], { stdio: 'ignore' }).status === 0) return name
  }
  throw new Error('Chrome or Chromium was not found. Set CHROME=/path/to/chrome and run again.')
}

const chrome = findChrome()
const server = await preview({ root, preview: { port: 4179, strictPort: false, open: false } })
const url = `${server.resolvedUrls.local[0]}?lang=en#/cv`

// Run Chrome without blocking: the preview server lives in this same process.
try {
  await promisify(execFile)(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-pdf-header-footer',
    '--virtual-time-budget=6000',
    `--print-to-pdf=${out}`,
    url,
  ], { timeout: 60000 })
  console.log(`CV written to ${out}`)
} finally {
  await server.close()
}
