import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Without this, tailwind-merge reads `text-h1` as a color and drops it when it meets `text-fg`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'h1', 'h2', 'h3', 'body', 'sec', 'label', 'figure', 'btn'] }],
      'border-w': ['border-field'],
      'grid-cols': ['grid-tables'],
    },
  },
})

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
