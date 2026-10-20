import { useNavigate } from 'react-router'
import { PageHeader, useToast } from '@/components/ui'
import { ACCOUNT_NOT_ENABLED_CODE, ApiError, DINER_ACCOUNT_CODE } from '@/lib/api-client'
import { RestaurantForm } from './components/RestaurantForm'
import { useRegisterRestaurant } from './hooks'
import { ONBOARDING_TEXT } from './messages'
import { emptyRestaurantFormValues, toRegisterRestaurantInput, type ValidRestaurantFormValues } from './restaurant-form'

/** Restaurant registration (manual 12.4, PBI 3). Inside OnboardingShell: no sidebar, logo-only topbar. */
export default function OnboardingPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const registerRestaurant = useRegisterRestaurant()

  async function handleSubmit(values: ValidRestaurantFormValues) {
    try {
      await registerRestaurant.mutateAsync(toRegisterRestaurantInput(values))
      toast.show({ type: 'success', message: ONBOARDING_TEXT.savedToast })
    } catch (error) {
      // Wrong account: the layout already shows WrongAccountScreen, so stay here.
      if (error instanceof ApiError && error.status === 403 && (error.code === ACCOUNT_NOT_ENABLED_CODE || error.code === DINER_ACCOUNT_CODE)) {
        return
      }
      // 409: the user already has a restaurant, so there is nothing to register: go to the tables.
      if (!(error instanceof ApiError && error.status === 409)) throw error
      toast.show({ type: 'info', message: ONBOARDING_TEXT.alreadyRegisteredToast })
    }
    // Replace: going back must not return to the registration.
    navigate('/mesas', { replace: true })
  }

  return (
    <>
      <PageHeader title={ONBOARDING_TEXT.title} description={ONBOARDING_TEXT.description} />
      <RestaurantForm
        initialValues={emptyRestaurantFormValues()}
        submitLabel={ONBOARDING_TEXT.submit}
        saving={registerRestaurant.isPending}
        onSubmit={handleSubmit}
      />
    </>
  )
}
