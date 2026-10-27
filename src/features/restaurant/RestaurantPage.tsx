import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import { useBlocker } from 'react-router'
import { Alert, Button, Card, ConfirmDialog, DetailList, PageHeader, Skeleton, useToast } from '@/components/ui'
import { DAY_LABELS, closesNextDay } from '@/components/ui/hours'
import { getApiErrorMessage, isAccessError } from '@/lib/api-client'
import { formatTime12h } from '@/lib/format'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { RestaurantForm } from './components/RestaurantForm'
import { useRestaurantQuery, useUpdateRestaurant } from './hooks'
import {
  toRegisterRestaurantInput,
  toRestaurantFormValues,
  type RestaurantFormValues,
  type ValidRestaurantFormValues,
} from './restaurant-form'
import { RESTAURANT_CATEGORY_LABELS } from './types'
import type { RestaurantProfile } from './types'

const INCOMPLETE = 'Sin completar'

function displayValue(value: string | null | undefined): string {
  return value?.trim() || INCOMPLETE
}

function createUpdateInput(restaurant: RestaurantProfile, values: ValidRestaurantFormValues) {
  const originalValues = toRestaurantFormValues({
    ...restaurant,
    name: restaurant.name ?? '',
    schedules: Array.isArray(restaurant.schedules) ? restaurant.schedules : [],
  })
  const originalPayload = toRegisterRestaurantInput({ ...values, ...originalValues, category: values.category })
  const updatedPayload = toRegisterRestaurantInput(values)
  const update: {
    name?: string
    category?: ValidRestaurantFormValues['category']
    address?: string
    latitude?: number
    longitude?: number
    schedules?: typeof updatedPayload.schedules
  } = {}

  if (originalValues.name.trim() !== updatedPayload.name) update.name = updatedPayload.name
  if ((restaurant.category ?? '') !== updatedPayload.category) update.category = updatedPayload.category
  if (originalValues.address.trim() !== updatedPayload.address) update.address = updatedPayload.address
  // Both coordinates or neither (Sprint 2 contract); they cannot be removed, so only a moved pin is sent.
  const { latitude, longitude } = updatedPayload
  if (
    latitude !== undefined &&
    longitude !== undefined &&
    (latitude !== originalPayload.latitude || longitude !== originalPayload.longitude)
  ) {
    update.latitude = latitude
    update.longitude = longitude
  }
  if (JSON.stringify(originalPayload.schedules) !== JSON.stringify(updatedPayload.schedules)) {
    update.schedules = updatedPayload.schedules
  }
  return update
}

export default function RestaurantPage() {
  const restaurantQuery = useRestaurantQuery()
  const updateRestaurant = useUpdateRestaurant()
  const showSkeleton = useDelayedFlag(restaurantQuery.isPending)
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [cancelConfirmationOpen, setCancelConfirmationOpen] = useState(false)
  const blocker = useBlocker(editing && dirty && !updateRestaurant.isPending)

  useEffect(() => {
    if (!editing || !dirty || updateRestaurant.isPending) return

    function preventUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', preventUnload)
    return () => window.removeEventListener('beforeunload', preventUnload)
  }, [dirty, editing, updateRestaurant.isPending])

  function leaveEditing() {
    setCancelConfirmationOpen(false)
    setEditing(false)
    setDirty(false)
  }

  function requestCancel() {
    if (dirty) setCancelConfirmationOpen(true)
    else leaveEditing()
  }

  function cancelBlockedNavigation() {
    if (blocker.state === 'blocked') blocker.reset()
    setCancelConfirmationOpen(false)
  }

  function confirmLeave() {
    if (blocker.state === 'blocked') {
      blocker.proceed()
      return
    }
    leaveEditing()
  }

  async function saveChanges(values: ValidRestaurantFormValues) {
    const restaurant = restaurantQuery.data
    if (!restaurant) return

    const update = createUpdateInput(restaurant, values)
    if (Object.keys(update).length === 0) {
      leaveEditing()
      return
    }

    await updateRestaurant.mutateAsync(update)
    toast.show({ type: 'success', message: 'Cambios guardados' })
    leaveEditing()
  }

  const blockerOpen = blocker.state === 'blocked'
  const confirmOpen = cancelConfirmationOpen || blockerOpen

  if (restaurantQuery.isPending) {
    return (
      <>
        <PageHeader title="Restaurante" />
        <div aria-busy="true" className="flex flex-col gap-6">
          <span role="status" className="sr-only">Cargando información del restaurante</span>
          {showSkeleton && (
            <>
              <Card><div className="flex flex-col gap-4"><Skeleton className="h-4 w-24" /><Skeleton className="h-6 w-48" /></div></Card>
              <Card><div className="flex flex-col gap-4"><Skeleton className="h-4 w-24" /><Skeleton className="h-6 w-64" /></div></Card>
              <Card><div className="flex flex-col gap-4"><Skeleton className="h-4 w-24" /><Skeleton className="h-6 w-full" /></div></Card>
            </>
          )}
        </div>
      </>
    )
  }

  if (restaurantQuery.isError || !restaurantQuery.data) {
    const accessError = isAccessError(restaurantQuery.error)
    return (
      <>
        <PageHeader title="Restaurante" />
        <Alert
          type="error"
          action={
            accessError ? undefined : (
              <Button size="sm" variant="outline" loading={restaurantQuery.isFetching} onClick={() => void restaurantQuery.refetch()}>
                Intentar de nuevo
              </Button>
            )
          }
        >
          {getApiErrorMessage(
            restaurantQuery.error,
            'No pudimos cargar la información de tu restaurante. Revisa tu conexión e intenta de nuevo.',
          )}
        </Alert>
      </>
    )
  }

  const restaurant = restaurantQuery.data
  const normalizedProfile: RestaurantProfile = {
    ...restaurant,
    name: restaurant.name ?? '',
    category: restaurant.category ?? null,
    address: restaurant.address ?? null,
    schedules: Array.isArray(restaurant.schedules) ? restaurant.schedules : [],
  }
  const initialValues: RestaurantFormValues = toRestaurantFormValues(normalizedProfile)
  const schedulesReturned = Array.isArray(restaurant.schedules)

  return (
    <>
      <PageHeader
        title="Restaurante"
        actions={
          editing ? undefined : (
            // Manual 12.2: "Editar" is an alternative, not the page's main action.
            <Button variant="outline" icon={Pencil} onClick={() => setEditing(true)}>
              Editar
            </Button>
          )
        }
      />

      {editing ? (
        <RestaurantForm
          key={restaurant.id}
          initialValues={initialValues}
          submitLabel="Guardar cambios"
          saving={updateRestaurant.isPending}
          onSubmit={saveChanges}
          onCancel={requestCancel}
          onDirtyChange={setDirty}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <Card as="section" title="Tu restaurante">
            <DetailList
              items={[
                { label: 'Nombre', value: displayValue(restaurant.name) },
                {
                  label: 'Categoría',
                  value: restaurant.category ? RESTAURANT_CATEGORY_LABELS[restaurant.category] ?? INCOMPLETE : INCOMPLETE,
                },
              ]}
            />
          </Card>

          <Card as="section" title="Ubicación">
            <DetailList items={[{ label: 'Dirección', value: displayValue(restaurant.address) }]} />
          </Card>

          <Card as="section" title="Horarios">
            <DetailList
              items={initialValues.hours.map((day) => {
                let value = 'Cerrado'
                if (!schedulesReturned) value = INCOMPLETE
                else if (day.isOpen24h) value = 'Abierto 24 horas'
                else if (day.isOpen) {
                  value = `${formatTime12h(day.opensAt)} – ${formatTime12h(day.closesAt)}${
                    closesNextDay(day) ? ' (día siguiente)' : ''
                  }`
                }
                return { label: DAY_LABELS[day.day].long, value }
              })}
            />
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) cancelBlockedNavigation()
        }}
        title="¿Salir sin guardar?"
        description="Perderás los cambios que hiciste en tu restaurante."
        cancelLabel="Seguir editando"
        confirmLabel="Salir sin guardar"
        confirmVariant="danger"
        onConfirm={confirmLeave}
      />
    </>
  )
}
