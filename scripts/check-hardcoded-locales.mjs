import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

/**
 * Static correctness check: detect hardcoded ['en', 'ar'] arrays outside the canonical constant.
 *
 * REGRESSION HISTORY:
 * This check exists because this codebase had SEVEN copies of ['en', 'ar'] scattered
 * across different files (August 2026 audit). When a locale is added or removed, having
 * multiple hardcoded arrays means updates are missed, leading to:
 * - Inconsistent locale detection across the app
 * - Some code paths recognizing new locales, others not
 * - Silent failures where only some features break
 *
 * The canonical source is STOREFRONT_RUNTIME_SUPPORTED_LOCALES in
 * src/core/runtime/contracts/constants.ts - import and derive from it.
 *
 * See: docs/reference/adr-008-critical-patterns-audit-2026-08.md
 */

const root = path.resolve(process.cwd())

const ignoreDirs = new Set(['node_modules', '.nuxt', '.output', 'dist', '.git'])
const extensions = new Set(['.ts', '.tsx', '.vue', '.js', '.mjs', '.cjs'])

// Patterns that indicate a hardcoded locale array
const patterns = [
  /\['en',\s*'ar'\]/,
  /\["en",\s*"ar"\]/,
  /\['ar',\s*'en'\]/,
  /\["ar",\s*"en"\]/,
]

const walkDir = (dir, fileList = []) => {
  const files = readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = statSync(filePath)

    if (stat.isDirectory()) {
      if (!ignoreDirs.has(file)) {
        walkDir(filePath, fileList)
      }
    } else if (extensions.has(path.extname(file))) {
      fileList.push(filePath)
    }
  }

  return fileList
}

const files = walkDir(root)

const violations = []

for (const file of files) {
  // Skip the canonical constant file itself and this check script
  const relativePath = path.relative(root, file)
  if (relativePath === 'src/core/runtime/contracts/constants.ts' ||
      relativePath === 'scripts/check-hardcoded-locales.mjs') {
    continue
  }

  const content = readFileSync(file, 'utf8')
  const lines = content.split('\n')

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]
    const trimmed = line.trim()

    // Skip comment lines
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      continue
    }

    for (const pattern of patterns) {
      if (pattern.test(line)) {
        violations.push({
          file: relativePath,
          line: lineIndex + 1,
          content: line.trim(),
        })
      }
    }
  }
}

if (violations.length > 0) {
  console.error('Hardcoded locale arrays detected:')
  console.error('')
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}`)
    console.error(`    ${v.content}`)
    console.error('')
  }
  console.error('These arrays should import STOREFRONT_RUNTIME_SUPPORTED_LOCALES from')
  console.error('src/core/runtime/contracts/constants.ts instead.')
  console.error('')
  console.error('See: docs/reference/adr-008-critical-patterns-audit-2026-08.md')
  process.exit(1)
}

console.log('No hardcoded locale arrays found.')
