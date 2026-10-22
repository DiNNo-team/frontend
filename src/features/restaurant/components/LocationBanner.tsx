import { useLocation, useNavigate } from 'react-router'
import { Alert, Button } from '@/components/ui'
import { useRestaurantQuery } from '../hooks'
import { LOCATION_BANNER_TEXT } from '../messages'

const RESTAURANT_PATH = '/restaurante'

/**
 * Above the dashboard content, like the closed notice (manual 3.3 and 11.1): the restaurant has no
 * coordinates, so diners cannot find it. It goes away as soon as the edition or the registration saves
 * them, because both write their response into the same query. Nothing while loading, on error or
 * without a restaurant. On /restaurante there is no button: that is where the location is completed.
 */
export function LocationBanner() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const restaurantQuery = useRestaurantQuery()

  const restaurant = restaurantQuery.data
  if (!restaurant || restaurant.latitude !== null) return null

  return (
    <Alert
      type="info"
      action={
        pathname !== RESTAURANT_PATH && (
          <Button size="sm" variant="secondary" onClick={() => navigate(RESTAURANT_PATH)}>
            {LOCATION_BANNER_TEXT.action}
          </Button>
        )
      }
    >
      {LOCATION_BANNER_TEXT.text}
    </Alert>
  )
}
