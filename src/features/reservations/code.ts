// Reservation code (CLAUDE.md §12.1): 6 characters of this alphabet, without the ones that are mistaken for others
// (0 O 1 I L). The backend normalizes it again and answers 404 RESERVATION_CODE_NOT_FOUND to any other format.

export const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
export const CODE_LENGTH = 6

/** What the restaurant typed or pasted → uppercase without any whitespace ("k7m 4qx" → "K7M4QX"). */
export function normalizeCode(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase()
}

export type CodeProblem = 'empty' | 'format'

/** Checked before sending: an empty code, or one that is not 6 characters of the alphabet, never reaches the API. */
export function codeProblem(normalized: string): CodeProblem | null {
  if (normalized.length === 0) return 'empty'
  if (normalized.length !== CODE_LENGTH) return 'format'
  return [...normalized].every((char) => CODE_ALPHABET.includes(char)) ? null : 'format'
}

/** What a scanner or the camera read → the code, or null when it is not a DiNNo code (any other QR or barcode). */
export function toReservationCode(raw: string): string | null {
  const code = normalizeCode(raw)
  return codeProblem(code) === null ? code : null
}
