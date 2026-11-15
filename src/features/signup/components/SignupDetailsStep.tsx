import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { ConfirmDialog, PageHeader, useToast } from '@/components/ui'
import { meQueryKey } from '@/features/account/hooks'
import { RestaurantForm } from '@/features/restaurant/components/RestaurantForm'
import { restaurantQueryKey } from '@/features/restaurant/hooks'
import { emptyRestaurantFormValues, toSignupRestaurantInput, type ValidRestaurantFormValues } from '@/features/restaurant/restaurant-form'
import { ApiError } from '@/lib/api-client'
import { useSignupRestaurant } from '../hooks'
import { describeSignupError, SIGNUP_TEXT } from '../messages'
import { SignupProgress } from './SignupProgress'

/**
 * Step 2 of the public registration: the restaurant's data (the shared RestaurantForm, with the contact phone
 * required). The form validates; sending asks for a confirmation first, and if it fails the form keeps what was typed.
 */
export function SignupDetailsStep() {
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const signup = useSignupRestaurant()
  const [values] = useState(emptyRestaurantFormValues)
  const [pending, setPending] = useState<ValidRestaurantFormValues | null>(null)
  const [error, setError] = useState<string>()

  async function askConfirmation(valid: ValidRestaurantFormValues) {
    setError(undefined)
    setPending(valid)
  }

  async function send() {
    if (!pending || signup.isPending) return
    try {
      await signup.mutateAsync(toSignupRestaurantInput(pending))
      toast.show({ type: 'success', message: SIGNUP_TEXT.sentToast })
      navigate('/solicitud', { replace: true })
    } catch (failure) {
      setError(describeSignupError(failure))
      // 409: the account already has its restaurant; ask again who it is so the guard takes it to its request.
      if (failure instanceof ApiError && failure.status === 409) {
        void queryClient.invalidateQueries({ queryKey: meQueryKey })
        void queryClient.invalidateQueries({ queryKey: restaurantQueryKey })
      }
    }
  }

  return (
    <>
      <SignupProgress step={2} />
      <PageHeader title={SIGNUP_TEXT.detailsTitle} description={SIGNUP_TEXT.detailsDescription} />
      <RestaurantForm
        initialValues={values}
        submitLabel={SIGNUP_TEXT.submit}
        saving={signup.isPending}
        onSubmit={askConfirmation}
        requireLocation
        contactPhone="required"
      />
      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open && !signup.isPending) setPending(null)
        }}
        title={SIGNUP_TEXT.confirmTitle}
        description={SIGNUP_TEXT.confirmBody}
        confirmLabel={SIGNUP_TEXT.confirmSend}
        confirmVariant="primary"
        loadingText={SIGNUP_TEXT.sending}
        loading={signup.isPending}
        error={error}
        onConfirm={send}
      />
    </>
  )
}
