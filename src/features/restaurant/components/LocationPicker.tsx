import { useState } from 'react'
import { Map as MapIcon } from 'lucide-react'
import { Alert, Button, type AlertType } from '@/components/ui'
import { ApiError, getApiErrorMessage } from '@/lib/api-client'
import { useGeocodeAddress } from '../hooks'
import { BOGOTA_BOUNDS, type Coordinates } from '../location'
import { LOCATION_TEXT } from '../messages'
import { validateAddress } from '../restaurant-form'
import { LocationMap } from './LocationMap'

// Where the pin starts when the address was not found: the middle of the bounds the backend accepts.
const BOGOTA_MIDDLE: Coordinates = {
  latitude: (BOGOTA_BOUNDS.minLatitude + BOGOTA_BOUNDS.maxLatitude) / 2,
  longitude: (BOGOTA_BOUNDS.minLongitude + BOGOTA_BOUNDS.maxLongitude) / 2,
}

// The two answers of GET /geocode with no point: the person places the pin by hand.
const NO_POINT_CODES: Record<string, string> = {
  ADDRESS_NOT_FOUND: LOCATION_TEXT.addressNotFound,
  GEOCODING_UNAVAILABLE: LOCATION_TEXT.geocodingUnavailable,
}

interface Notice {
  type: AlertType
  text: string
}

export interface LocationPickerProps {
  /** The address typed in the form: "Ubicar en el mapa" looks it up. */
  address: string
  value: Coordinates | null
  onChange: (value: Coordinates) => void
  error?: string
  /** The address is empty or too long: the form shows its error instead of looking it up. */
  onInvalidAddress: (message: string) => void
  mapUnavailable: boolean
  onMapUnavailable: () => void
  /** Id of "Ubicar en el mapa", so the form can focus it when the location is missing. */
  locateButtonId: string
}

/**
 * Location of the restaurant (Sprint 2): "Ubicar en el mapa" asks GET /geocode for the address and puts
 * the pin there; the person drags it to the exact place. Without an answer, the map shows Bogotá with
 * the pin in the middle, still to be moved. Without a map, the point of the address is saved as it is.
 */
export function LocationPicker({
  address,
  value,
  onChange,
  error,
  onInvalidAddress,
  mapUnavailable,
  onMapUnavailable,
  locateButtonId,
}: LocationPickerProps) {
  const geocode = useGeocodeAddress()
  const [notice, setNotice] = useState<Notice>()
  // Pin shown after a failed lookup: it is not the location until the person moves it.
  const [pendingPin, setPendingPin] = useState<Coordinates | null>(null)

  function locate() {
    const addressError = validateAddress(address)
    if (addressError) {
      onInvalidAddress(addressError)
      return
    }
    setNotice(undefined)
    geocode.mutate(address, {
      onSuccess: ({ latitude, longitude, formattedAddress }) => {
        setPendingPin(null)
        onChange({ latitude, longitude })
        if (mapUnavailable) setNotice({ type: 'success', text: LOCATION_TEXT.locatedWithoutMap(formattedAddress) })
      },
      onError: (failure) => {
        const noPointText = failure instanceof ApiError && failure.code ? NO_POINT_CODES[failure.code] : undefined
        if (!noPointText) {
          setNotice({ type: 'error', text: getApiErrorMessage(failure, LOCATION_TEXT.locateFailed) })
          return
        }
        if (mapUnavailable) {
          setNotice({ type: 'info', text: LOCATION_TEXT.notLocatedWithoutMap })
          return
        }
        setNotice({ type: 'info', text: noPointText })
        if (!value) setPendingPin(BOGOTA_MIDDLE)
      },
    })
  }

  function handlePinMove(position: Coordinates) {
    setPendingPin(null)
    setNotice(undefined)
    onChange(position)
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert type="error">{error}</Alert>}
      <div>
        <Button
          id={locateButtonId}
          variant="secondary"
          icon={MapIcon}
          loading={geocode.isPending}
          loadingText={LOCATION_TEXT.locating}
          onClick={locate}
        >
          {LOCATION_TEXT.locate}
        </Button>
      </div>
      {notice && <Alert type={notice.type}>{notice.text}</Alert>}
      {mapUnavailable ? (
        !notice && <Alert type="info">{LOCATION_TEXT.mapUnavailable}</Alert>
      ) : (
        <>
          <LocationMap position={value ?? pendingPin} onPositionChange={handlePinMove} onUnavailable={onMapUnavailable} />
          <p className="text-sec text-fg-2">{LOCATION_TEXT.help}</p>
        </>
      )}
    </div>
  )
}
