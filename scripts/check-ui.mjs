#!/usr/bin/env node
// Checks src/ against the hard rules of the DiNNo identity manual v1.1 (sections 0, 8, 16 and 17).
// Run with `npm run check:ui`. Exits with code 1 and lists file:line:column for each violation.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SRC = join(ROOT, 'src')

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css']
// tokens.css is the manual copied verbatim; brand SVGs carry their own fixed colors.
const IGNORED = ['styles/tokens.css', 'assets/brand/']

const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white'
const PALETTE_PREFIXES =
  'bg|text|border|ring|fill|stroke|from|via|to|outline|divide|placeholder|accent|caret|decoration'
const SIDES = '(?:-(?:t|r|b|l|s|e|x|y|tl|tr|bl|br|ss|se|es|ee))?'
const FORBIDDEN_ICONS = ['Utensils', 'UtensilsCrossed', 'ChefHat', 'Pizza', 'Coffee', 'Hamburger', 'MapPin', 'MapPinned', 'Pin']
// Tailwind variants that legitimately use brackets: data-[state=open]:, aria-[invalid=true]:, group-data-[…]:
const ALLOWED_BRACKET_VARIANT = /(?:^|[\s"'`:])(?:(?:group|peer)-)?(?:data|aria)-\[[^\]]*\]$/

/** @type {{ id: string, message: string, pattern: RegExp, only?: string[], allow?: (line: string, index: number) => boolean }[]} */
const RULES = [
  {
    id: 'hex-color',
    message: 'Color hex suelto. Usa un token (bg-surface, text-fg…) o `bg-(--token)`.',
    pattern: /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![0-9a-z_-])/gi,
  },
  {
    id: 'color-function',
    message: 'rgb()/rgba()/hsl() suelto. Usa un token del manual.',
    pattern: /\b(?:rgba?|hsla?)\(/gi,
  },
  {
    id: 'arbitrary-value',
    message: 'Valor arbitrario de Tailwind (`-[…]`). Usa la escala exacta, `(--token)` o un @utility en globals.css.',
    pattern: /-\[/g,
    allow: (line, index) => {
      const end = line.indexOf(']', index)
      const chunk = line.slice(0, end === -1 ? line.length : end + 1)
      return ALLOWED_BRACKET_VARIANT.test(chunk)
    },
  },
  {
    id: 'default-palette',
    message: 'Paleta por defecto de Tailwind. Usa las clases de tokens (bg-surface, text-fg-2, bg-ok/15…).',
    pattern: new RegExp(`(?<![\\w-])(?:${PALETTE_PREFIXES})-(?:${PALETTE})(?![\\w-])`, 'g'),
    only: ['.ts', '.tsx', '.js', '.jsx'],
  },
  {
    id: 'default-palette',
    message: 'Paleta por defecto de Tailwind. Usa las clases de tokens (bg-surface, text-fg-2, bg-ok/15…).',
    pattern: new RegExp(`(?<![\\w-])(?:${PALETTE_PREFIXES})-(?:${PALETTE})-\\d{2,3}(?![\\w-])`, 'g'),
  },
  {
    id: 'default-radius',
    message: 'Radio por defecto de Tailwind. Usa rounded-card, rounded-tile, rounded-btn, rounded-input o rounded-full.',
    pattern: new RegExp(`(?<![\\w-])rounded${SIDES}(?:-(?:xs|sm|md|lg|xl|2xl|3xl|4xl))?(?![\\w-])`, 'g'),
    only: ['.ts', '.tsx', '.js', '.jsx'],
  },
  {
    id: 'default-shadow',
    message: 'Sombra por defecto de Tailwind. Usa shadow-card (soft) o shadow-lifted (flotante).',
    pattern: /(?<![\w-])shadow(?:-(?:2xs|xs|sm|md|lg|xl|2xl|inner))?(?![\w-])/g,
    only: ['.ts', '.tsx', '.js', '.jsx'],
    allow: (line, index) => /^shadow\s*[:=(]/.test(line.slice(index)),
  },
  {
    id: 'console-log',
    message: 'console.log no se sube.',
    pattern: /\bconsole\.log\s*\(/g,
  },
]

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

function toPosix(path) {
  return path.split(sep).join('/')
}

function lineAndColumn(text, index) {
  const before = text.slice(0, index)
  const line = before.split('\n').length
  return { line, column: index - before.lastIndexOf('\n') }
}

function checkForbiddenIcons(text, report) {
  const importPattern = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]lucide-react['"]/g
  for (const match of text.matchAll(importPattern)) {
    for (const specifier of match[1].split(',')) {
      const imported = specifier.trim().split(/\s+as\s+/)[0].trim()
      const base = imported.replace(/^Lucide/, '').replace(/Icon$/, '')
      if (FORBIDDEN_ICONS.includes(base)) {
        const offset = match.index + match[0].indexOf(imported)
        report(offset, 'forbidden-icon', `Ícono prohibido por el manual (sección 8): ${imported}.`)
      }
    }
  }
  const deepImport = /from\s*['"]lucide-react\/(?:dist\/esm\/)?icons\/([\w-]+)['"]/g
  for (const match of text.matchAll(deepImport)) {
    const name = match[1].replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase())
    if (FORBIDDEN_ICONS.includes(name)) {
      report(match.index, 'forbidden-icon', `Ícono prohibido por el manual (sección 8): ${match[1]}.`)
    }
  }
}

const violations = []

for (const file of walk(SRC)) {
  const rel = toPosix(relative(SRC, file))
  const extension = rel.slice(rel.lastIndexOf('.'))
  if (!EXTENSIONS.includes(extension)) continue
  if (IGNORED.some((ignored) => rel === ignored || rel.startsWith(ignored))) continue

  const text = readFileSync(file, 'utf8')
  const lines = text.split('\n')
  const report = (index, rule, message) => {
    const { line, column } = lineAndColumn(text, index)
    violations.push({ file: `src/${rel}`, line, column, rule, message, source: lines[line - 1].trim() })
  }

  for (const rule of RULES) {
    if (rule.only && !rule.only.includes(extension)) continue
    for (const match of text.matchAll(rule.pattern)) {
      if (rule.allow) {
        const { line, column } = lineAndColumn(text, match.index)
        if (rule.allow(lines[line - 1], column - 1)) continue
      }
      report(match.index, rule.id, rule.message)
    }
  }
  if (extension !== '.css') checkForbiddenIcons(text, report)
}

if (violations.length > 0) {
  violations.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column)
  for (const v of violations) {
    console.error(`${v.file}:${v.line}:${v.column}  [${v.rule}] ${v.message}\n    ${v.source}`)
  }
  console.error(`\ncheck:ui: ${violations.length} problema(s). Revisa el manual (secciones 8, 16 y 17).`)
  process.exit(1)
}

console.info('check:ui: sin problemas.')
