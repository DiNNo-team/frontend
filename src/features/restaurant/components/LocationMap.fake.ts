import { createElement, useEffect } from 'react'
import type { LocationMapProps } from './LocationMap'

// Test double of LocationMap (jsdom cannot load Google Maps). Use it with
// `vi.mock('./LocationMap', () => import('./LocationMap.fake'))` and set `fakeMap` in each test.
// Plain .ts with createElement: a .tsx exporting `fakeMap` would break fast refresh (lint).
export const fakeMap = {
  available: true,
  /** Where "Mover pin" drops the pin, as a drag would. */
  dropAt: { latitude: 4.660123, longitude: -74.053211 },
}

export function LocationMap({ position, onPositionChange, onUnavailable }: LocationMapProps) {
  const { available } = fakeMap
  useEffect(() => {
    if (!available) onUnavailable()
  }, [available, onUnavailable])

  if (!available) return null
  const pin = position ? `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}` : 'sin pin'
  return createElement(
    'div',
    null,
    createElement('p', null, `Pin: ${pin}`),
    createElement('button', { type: 'button', onClick: () => onPositionChange(fakeMap.dropAt) }, 'Mover pin'),
  )
}
