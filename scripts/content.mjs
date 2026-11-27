// Moves content between the admin page and the project, for when you publish without
// GitHub or a server connected.
//
//   npm run content -- import portfolio-content-2026-11-27.json
//     Writes the content file saved from the admin page (Settings, Save a copy) into
//     src/data/*.json, and its new pictures into public/. Then build and deploy as usual.
//
//   npm run content -- export
//     Writes a content file from src/data, to open in the admin page (Settings, Open a copy).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const KEYS = ['profile', 'copy', 'words', 'projects', 'experience', 'skills', 'education', 'certificates', 'cv', 'essays', 'tools']
const json = (value) => `${JSON.stringify(value, null, 2)}\n`
const [command, file] = process.argv.slice(2)

if (command === 'import') {
  if (!file) throw new Error('Name the content file: npm run content -- import <file>')
  const data = JSON.parse(readFileSync(resolve(file), 'utf8'))
  if (data.format !== 'pot4lio-content' || typeof data.collections !== 'object') throw new Error('That is not a content file from the admin page.')
  const changed = []
  for (const key of KEYS) {
    if (!(key in data.collections)) continue
    const target = resolve(root, 'src/data', `${key}.json`)
    const next = json(data.collections[key])
    if (!existsSync(target) || readFileSync(target, 'utf8') !== next) {
      writeFileSync(target, next)
      changed.push(`src/data/${key}.json`)
    }
  }
  // New pictures, only inside public/ and only as WebP made by the admin page.
  const publicDir = resolve(root, 'public')
  for (const [path, dataUrl] of Object.entries(data.files || {})) {
    const target = resolve(publicDir, path)
    if (!target.startsWith(publicDir + sep) || !/\.webp$/.test(path) || !String(dataUrl).startsWith('data:image/webp;base64,')) {
      console.warn(`Skipped ${path}: not a picture from the admin page.`)
      continue
    }
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, Buffer.from(dataUrl.split(',')[1], 'base64'))
    changed.push(`public/${path}`)
  }
  console.log(changed.length ? `Updated:\n  ${changed.join('\n  ')}` : 'Nothing changed: the project already has this content.')
} else if (command === 'export') {
  const collections = Object.fromEntries(KEYS.map((key) => [key, JSON.parse(readFileSync(resolve(root, 'src/data', `${key}.json`), 'utf8'))]))
  const out = file || `portfolio-content-${new Date().toISOString().slice(0, 10)}.json`
  writeFileSync(out, json({ format: 'pot4lio-content', version: 1, exportedAt: new Date().toISOString(), collections, files: {} }))
  console.log(`Wrote ${out}`)
} else {
  console.log('Use: npm run content -- import <file>   or   npm run content -- export [file]')
}
