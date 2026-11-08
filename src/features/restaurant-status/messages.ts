// Texts of the open/closed control. From the manual (3.3 and 14.2) unless marked "approved"
// (proposed by Sergio following 11.3 and 14, approved for PBI 8). Generic network, session and
// permission errors come from `getApiErrorMessage` (@/lib/api-client).

export const RESTAURANT_STATUS_TEXT = {
  switchLabel: 'Estado del restaurante',
  closedBanner: 'Tu restaurante está cerrado. Los comensales no lo ven en DiNNo.',
  openNow: 'Abrir ahora',
  closedToast: 'Restaurante cerrado. Los comensales ya no lo ven',
  undo: 'Deshacer',
  retry: 'Intentar de nuevo',
  loading: 'Cargando el estado del restaurante',
  // Approved.
  openedToast: 'Restaurante abierto. Los comensales ya lo ven',
  saveError: 'No pudimos cambiar el estado del restaurante. Intenta de nuevo.',
  loadError: 'No pudimos cargar el estado del restaurante. Revisa tu conexión e intenta de nuevo.',
  confirmTitle: '¿Cerrar el restaurante?',
  confirmLabel: 'Cerrar restaurante',
  confirmLoading: 'Cerrando…',
  /** When the DiNNo reservations in course could not be counted (GET /restaurants/me failed). */
  confirmUnknownReservations: 'Los comensales no verán tu restaurante en DiNNo mientras esté cerrado.',
} as const

// The warning before closing with DiNNo reservations is `closeWithReservationsText` (@/features/reservations/messages).
