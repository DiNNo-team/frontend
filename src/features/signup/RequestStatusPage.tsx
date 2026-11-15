import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { Pencil } from 'lucide-react'
import { Alert, Button, Card, ConfirmDialog, EmptyState, PageHeader, Skeleton, useToast } from '@/components/ui'
import { useAuth } from '@/features/auth/auth-context'
import { AuthAnchor } from '@/features/auth/components/AuthLink'
import { TEAM_EMAIL } from '@/features/auth/restaurant-request'
import { RestaurantForm } from '@/features/restaurant/components/RestaurantForm'
import { restaurantQueryKey, useResubmitRestaurant, useUpdateRestaurant } from '@/features/restaurant/hooks'
import { toRestaurantFormValues, toUpdateRestaurantInput, type ValidRestaurantFormValues } from '@/features/restaurant/restaurant-form'
import type { RestaurantProfile } from '@/features/restaurant/types'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { RequestDetails } from './components/RequestDetails'
import { useRequestStatusQuery } from './hooks'
import { describeResendError, isNotRejectedError, REQUEST_TEXT } from './messages'
import { markAwaitingApproval } from './use-welcome'

function SignOutButton() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [signingOut, setSigningOut] = useState(false)

  async function closeSession() {
    setSigningOut(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch {
      toast.show({ type: 'error', message: REQUEST_TEXT.signOutFailed })
      setSigningOut(false)
    }
  }

  return (
    <Button variant="ghost" onClick={closeSession} loading={signingOut} loadingText="Cerrando sesión…">
      {REQUEST_TEXT.signOut}
    </Button>
  )
}

/** Review in progress: the data in read mode, what comes next, and «Editar mis datos» (PATCH keeps it in review). */
function PendingView({ restaurant }: { restaurant: RestaurantProfile }) {
  const toast = useToast()
  const updateRestaurant = useUpdateRestaurant()
  const [editing, setEditing] = useState(false)

  async function save(values: ValidRestaurantFormValues) {
    const update = toUpdateRestaurantInput(restaurant, values)
    if (Object.keys(update).length > 0) await updateRestaurant.mutateAsync(update)
    toast.show({ type: 'success', message: REQUEST_TEXT.editSavedToast })
    setEditing(false)
  }

  return (
    <>
      <PageHeader
        title={REQUEST_TEXT.pendingTitle}
        description={REQUEST_TEXT.pendingDescription}
        actions={
          editing ? undefined : (
            <Button variant="outline" icon={Pencil} onClick={() => setEditing(true)}>
              {REQUEST_TEXT.edit}
            </Button>
          )
        }
      />
      <Alert type="info">
        <span className="block font-bold">{REQUEST_TEXT.pendingAlertTitle}</span>
        {REQUEST_TEXT.pendingAlert}
      </Alert>
      {editing ? (
        <RestaurantForm
          key={restaurant.id}
          initialValues={toRestaurantFormValues(restaurant)}
          submitLabel={REQUEST_TEXT.editSave}
          saving={updateRestaurant.isPending}
          onSubmit={save}
          onCancel={() => setEditing(false)}
          contactPhone="required"
        />
      ) : (
        <>
          <RequestDetails restaurant={restaurant} />
          <Card as="section" title={REQUEST_TEXT.nextTitle}>
            <ol className="flex list-decimal flex-col gap-3 pl-5 text-sec text-fg marker:font-bold marker:text-accent-text">
              {REQUEST_TEXT.nextSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Card>
        </>
      )}
      <p className="text-sec text-fg">
        {REQUEST_TEXT.contactQuestion} <AuthAnchor href={`mailto:${TEAM_EMAIL}`}>{TEAM_EMAIL}</AuthAnchor>.
      </p>
    </>
  )
}

/** Not approved: the reason first, the form already filled to correct it, and «Reenviar solicitud». */
function RejectedView({ restaurant }: { restaurant: RestaurantProfile }) {
  const toast = useToast()
  const queryClient = useQueryClient()
  const updateRestaurant = useUpdateRestaurant()
  const resubmit = useResubmitRestaurant()
  const [pending, setPending] = useState<ValidRestaurantFormValues | null>(null)
  const [error, setError] = useState<string>()
  const busy = updateRestaurant.isPending || resubmit.isPending

  async function resend() {
    if (!pending || busy) return
    try {
      const update = toUpdateRestaurantInput(restaurant, pending)
      if (Object.keys(update).length > 0) await updateRestaurant.mutateAsync(update)
      await resubmit.mutateAsync()
      toast.show({ type: 'success', message: REQUEST_TEXT.resentToast })
      setPending(null)
    } catch (failure) {
      setError(describeResendError(failure))
      // No longer rejected: ask again, and the screen shows what it is now.
      if (isNotRejectedError(failure)) void queryClient.invalidateQueries({ queryKey: restaurantQueryKey })
    }
  }

  return (
    <>
      <PageHeader title={REQUEST_TEXT.rejectedTitle} description={REQUEST_TEXT.rejectedDescription} />
      <Alert type="warning">
        <span className="block font-bold">{REQUEST_TEXT.rejectedReasonTitle}</span>
        {restaurant.rejectionReason ?? ''}
      </Alert>
      <RestaurantForm
        key={restaurant.id}
        initialValues={toRestaurantFormValues(restaurant)}
        submitLabel={REQUEST_TEXT.resend}
        saving={busy}
        onSubmit={async (values) => {
          setError(undefined)
          setPending(values)
        }}
        contactPhone="required"
      />
      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setPending(null)
        }}
        title={REQUEST_TEXT.resendConfirmTitle}
        description={REQUEST_TEXT.resendConfirmBody}
        confirmLabel={REQUEST_TEXT.resendConfirm}
        confirmVariant="primary"
        loadingText={REQUEST_TEXT.resending}
        loading={busy}
        error={error}
        onConfirm={resend}
      />
      <p className="text-sec text-fg">
        {REQUEST_TEXT.contactQuestion} <AuthAnchor href={`mailto:${TEAM_EMAIL}`}>{TEAM_EMAIL}</AuthAnchor>.
      </p>
    </>
  )
}

/**
 * `/solicitud` (CLAUDE.md §12.12): where a restaurant that is not approved yet lands. In review it shows what it sent
 * and what comes next; rejected, the administrator's reason and the form to correct and send it again. It asks its
 * state every 30 s and when the tab returns; once approved, the access guard takes it to the tables.
 */
export default function RequestStatusPage() {
  const query = useRequestStatusQuery()
  const showSkeleton = useDelayedFlag(query.isPending)
  const restaurant = query.data

  useEffect(() => {
    // The dashboard welcomes the restaurant once, the first time it sees it approved.
    if (restaurant?.approvalStatus === 'pending') markAwaitingApproval(restaurant.id)
  }, [restaurant?.approvalStatus, restaurant?.id])

  let content
  if (restaurant) {
    content = restaurant.approvalStatus === 'rejected' ? <RejectedView restaurant={restaurant} /> : <PendingView restaurant={restaurant} />
  } else if (query.isError) {
    content = (
      <EmptyState
        variant="error"
        title={REQUEST_TEXT.loadError}
        action={
          <Button variant="secondary" onClick={() => void query.refetch()}>
            {REQUEST_TEXT.retry}
          </Button>
        }
      />
    )
  } else {
    content = (
      <div aria-busy="true" className="flex flex-col gap-6">
        <span role="status" className="sr-only">
          Cargando tu solicitud
        </span>
        {showSkeleton && (
          <>
            <Skeleton className="h-10 w-2/3" />
            <Skeleton radius="card" className="h-24" />
            <Skeleton radius="card" className="h-64" />
          </>
        )}
      </div>
    )
  }

  return (
    <>
      {content}
      <div className="flex justify-start">
        <SignOutButton />
      </div>
    </>
  )
}
