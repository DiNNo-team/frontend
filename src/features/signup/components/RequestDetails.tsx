import { Card, DetailList } from '@/components/ui'
import { closesNextDay, DAY_LABELS } from '@/components/ui/hours'
import { toRestaurantFormValues } from '@/features/restaurant/restaurant-form'
import { RESTAURANT_CATEGORY_LABELS, type RestaurantProfile } from '@/features/restaurant/types'
import { formatTime12h } from '@/lib/format'
import { REQUEST_TEXT } from '../messages'

const INCOMPLETE = 'Sin completar'

/** What the restaurant sent, in read mode: the data the administrator reviews. */
export function RequestDetails({ restaurant }: { restaurant: RestaurantProfile }) {
  const { hours } = toRestaurantFormValues(restaurant)
  return (
    <Card as="section" title={REQUEST_TEXT.sentTitle}>
      <DetailList
        items={[
          { label: 'Nombre', value: restaurant.name },
          { label: 'Categoría', value: restaurant.category ? RESTAURANT_CATEGORY_LABELS[restaurant.category] : INCOMPLETE },
          { label: 'Dirección', value: restaurant.address ?? INCOMPLETE },
          { label: 'Teléfono de contacto', value: restaurant.contactPhone ?? INCOMPLETE },
          ...hours.map((day) => {
            let value = 'Cerrado'
            if (day.isOpen24h) value = 'Abierto 24 horas'
            else if (day.isOpen) {
              value = `${formatTime12h(day.opensAt)} – ${formatTime12h(day.closesAt)}${closesNextDay(day) ? ' (día siguiente)' : ''}`
            }
            return { label: DAY_LABELS[day.day].long, value }
          }),
        ]}
      />
    </Card>
  )
}
