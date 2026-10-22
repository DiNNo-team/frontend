import { useEffect } from 'react'
import {
  AdvancedMarker,
  APILoadingStatus,
  APIProvider,
  ColorScheme,
  Map as GoogleMap,
  useApiLoadingStatus,
  useMap,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps'
import { Logo } from '@/components/ui'
import { useTheme } from '@/lib/theme-context'
import { BOGOTA_BOUNDS, type Coordinates } from '../location'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? ''
const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID?.trim() ?? ''

// The whole city: the same bounds the backend accepts.
const BOGOTA_LAT_LNG_BOUNDS = {
  north: BOGOTA_BOUNDS.maxLatitude,
  south: BOGOTA_BOUNDS.minLatitude,
  east: BOGOTA_BOUNDS.maxLongitude,
  west: BOGOTA_BOUNDS.minLongitude,
}

/** Close enough to see the block and the street names. */
const PIN_ZOOM = 17

export interface LocationMapProps {
  /** Point of the pin; `null` shows the whole city without a pin. */
  position: Coordinates | null
  /** The user dragged the pin or clicked the map. */
  onPositionChange: (position: Coordinates) => void
  /** The map cannot be shown: no key or Map ID, or Google rejected or failed to load it. */
  onUnavailable: () => void
}

/**
 * Google map with the DiNNo pin (manual 1 and 8: never a generic pin), draggable, in light or dark.
 * Isolated here so the tests can replace it: jsdom cannot load Google Maps.
 */
export function LocationMap(props: LocationMapProps) {
  const { onUnavailable } = props
  const configured = API_KEY !== '' && MAP_ID !== ''

  useEffect(() => {
    if (!configured) onUnavailable()
  }, [configured, onUnavailable])

  if (!configured) return null
  return (
    <APIProvider apiKey={API_KEY} language="es" region="CO" onError={onUnavailable}>
      <PinMap {...props} />
    </APIProvider>
  )
}

function PinMap({ position, onPositionChange, onUnavailable }: LocationMapProps) {
  const { theme } = useTheme()
  const status = useApiLoadingStatus()
  const map = useMap()

  useEffect(() => {
    if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) onUnavailable()
  }, [status, onUnavailable])

  // Follow the pin when it comes from the address; without a pin, show the whole city.
  useEffect(() => {
    if (!map) return
    if (!position) {
      map.fitBounds(BOGOTA_LAT_LNG_BOUNDS)
      return
    }
    map.panTo({ lat: position.latitude, lng: position.longitude })
    if ((map.getZoom() ?? 0) < PIN_ZOOM) map.setZoom(PIN_ZOOM)
  }, [map, position])

  function moveTo(point: { lat: number; lng: number } | null | undefined) {
    if (point) onPositionChange({ latitude: point.lat, longitude: point.lng })
  }

  return (
    <GoogleMap
      mapId={MAP_ID}
      className="aspect-4/3 w-full overflow-hidden rounded-input border border-line"
      defaultBounds={BOGOTA_LAT_LNG_BOUNDS}
      colorScheme={theme === 'dark' ? ColorScheme.DARK : ColorScheme.LIGHT}
      gestureHandling="cooperative"
      clickableIcons={false}
      mapTypeControl={false}
      streetViewControl={false}
      fullscreenControl={false}
      onClick={(event: MapMouseEvent) => moveTo(event.detail.latLng)}
    >
      {position && (
        <AdvancedMarker
          position={{ lat: position.latitude, lng: position.longitude }}
          draggable
          title="Ubicación de tu restaurante"
          onDragEnd={(event) => moveTo(event.latLng?.toJSON())}
        >
          <Logo symbolOnly className="h-10 w-auto" />
        </AdvancedMarker>
      )}
    </GoogleMap>
  )
}
