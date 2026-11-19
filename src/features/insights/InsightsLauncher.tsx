import { useSearchParams } from 'react-router'
import { AiIcon, Button } from '@/components/ui'
import { useRestaurantQuery } from '@/features/restaurant/hooks'
import { InsightsDialog } from './components/InsightsDialog'
import { INSIGHTS_TEXT } from './messages'

/** `/resumen?informe=1` opens the report (a link can point at it; `/informe` redirects here). */
export const INSIGHTS_PARAM = 'informe'

/**
 * «Ver informe de la semana»: the button in the header of Resumen and the report's dialog. Only for an approved restaurant
 * (§12.16: a suspended one gets 403), so a suspended one sees neither the button nor the dialog, even with `?informe=1`.
 * The open state lives in the URL and keeps the other params of Resumen (the period).
 */
export function InsightsLauncher() {
  const restaurant = useRestaurantQuery()
  const [params, setParams] = useSearchParams()
  if (restaurant.data?.approvalStatus !== 'approved') return null

  const open = params.get(INSIGHTS_PARAM) === '1'
  function setOpen(next: boolean) {
    setParams(
      (previous) => {
        const nextParams = new URLSearchParams(previous)
        if (next) nextParams.set(INSIGHTS_PARAM, '1')
        else nextParams.delete(INSIGHTS_PARAM)
        return nextParams
      },
      { replace: !next },
    )
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <AiIcon size={20} />
        {INSIGHTS_TEXT.open}
      </Button>
      <InsightsDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
