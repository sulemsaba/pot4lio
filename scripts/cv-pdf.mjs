// Prints the CV page of the built site to public/suleiman-msaba-cv.pdf, so the
// download always matches the page. Run with: npm run cv:pdf
//
// With --private (npm run cv:pdf:private) it also fills in the referees' phone numbers
// and emails from private/referees.json, and writes private/Suleiman-Msaba-CV-with-referees.pdf.
// That folder is not in git, so their details never reach the website or GitHub.
//
// Needs Chrome or Chromium installed (set CHROME=/path/to/chrome if it is not found).
import { execFile, spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { preview } from 'vite'

const root = fileURLToPath(new URL('..', import.meta.url))
const isPrivate = process.argv.includes('--private')
const out = fileURLToPath(
  new URL(isPrivate ? '../private/Suleiman-Msaba-CV-with-referees.pdf' : '../public/suleiman-msaba-cv.pdf', import.meta.url),
)

let extra = ''
if (isPrivate) {
  const file = fileURLToPath(new URL('../private/referees.json', import.meta.url))
  const referees = JSON.parse(readFileSync(file, 'utf8'))
  extra = `&referees=${Buffer.from(JSON.stringify(referees)).toString('base64url')}`
  mkdirSync(fileURLToPath(new URL('../private/', import.meta.url)), { recursive: true })
}

function findChrome() {
  const names = [process.env.CHROME, 'chromium-browser', 'chromium', 'google-chrome', 'google-chrome-stable'].filter(Boolean)
  for (const name of names) {
    if (spawnSync(name, ['--version'], { stdio: 'ignore' }).status === 0) return name
  }
  throw new Error('Chrome or Chromium was not found. Set CHROME=/path/to/chrome and run again.')
}

const chrome = findChrome()
const server = await preview({ root, preview: { port: 4179, strictPort: false, open: false } })
const url = `${server.resolvedUrls.local[0]}?lang=en${extra}#/cv`

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
