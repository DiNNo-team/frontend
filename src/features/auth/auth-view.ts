export function validateEmail(value: string, action: string): string | undefined {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : `Escribe un correo válido para ${action}.`
}
