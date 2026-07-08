import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')
const sourceCandidates = [
  path.join(repoRoot, 'logo gif.gif'),
  path.join(repoRoot, 'CSS Logo IG black_.png'),
]
const sourcePath = sourceCandidates.find((candidate) => fs.existsSync(candidate))

if (!sourcePath) {
  throw new Error('CSS logo source file not found in repository root.')
}

const isGif = sourcePath.toLowerCase().endsWith('.gif')
const outputPath = path.resolve(__dirname, `../public/css-brand-logo.${isGif ? 'gif' : 'png'}`)

fs.copyFileSync(sourcePath, outputPath)
console.log(`Copied ${sourcePath} -> ${outputPath}`)
