// Prints the CV page of the built site to public/suleiman-msaba-cv.pdf, so the
// download always matches the page. Run with: npm run cv:pdf
//
// With --private (npm run cv:pdf:private) it also fills in the referees' phone numbers
// and emails from private/referees.json, and writes private/Suleiman-Msaba-CV-with-referees.pdf.
// That folder is not in git, so their details never reach the website or GitHub.
//
// With --variant private/<name>.json it prints a tailored version for one application:
// the file replaces parts of src/cv.js (headline, profile, experience, skills, order of
// sections...). The site is built for it in private/.cv-build, so the tailored text
// never enters the public build, and the PDF goes to private/Suleiman-Msaba-CV-<name>.pdf.
// Example: node scripts/cv-pdf.mjs --private --variant private/some-company.json
//
// Needs Chrome or Chromium installed (set CHROME=/path/to/chrome if it is not found).
import { execFile, spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { build, preview } from 'vite'

const root = fileURLToPath(new URL('..', import.meta.url))
const isPrivate = process.argv.includes('--private')
const variantArg = process.argv[process.argv.indexOf('--variant') + 1]
const variantFile = process.argv.includes('--variant') ? resolve(root, variantArg) : null
if (variantFile && !variantFile.startsWith(resolve(root, 'private') + '/')) {
  throw new Error('A tailored CV must live in private/, so it never reaches git or the website.')
}
const out = variantFile
  ? resolve(root, 'private', `Suleiman-Msaba-CV-${basename(variantFile, '.json')}.pdf`)
  : fileURLToPath(new URL(isPrivate ? '../private/Suleiman-Msaba-CV-with-referees.pdf' : '../public/suleiman-msaba-cv.pdf', import.meta.url))

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

// A tailored version is built on its own, into private/, with its text passed in.
let outDir = 'dist'
if (variantFile) {
  outDir = resolve(root, 'private', '.cv-build')
  process.env.VITE_CV_VARIANT = JSON.stringify(JSON.parse(readFileSync(variantFile, 'utf8')))
  await build({ root, logLevel: 'warn', build: { outDir, emptyOutDir: true } })
}
const server = await preview({ root, logLevel: 'warn', build: { outDir }, preview: { port: 4179, strictPort: false, open: false } })
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
  if (variantFile) rmSync(outDir, { recursive: true, force: true })
}
