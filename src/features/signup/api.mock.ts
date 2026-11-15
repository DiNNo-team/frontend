import { mockFailIfAsked, mockWait } from '@/lib/mock-env'
import type { RestaurantProfile } from '@/features/restaurant/types'
import type { SignupApi } from './api'

// Stand-in for POST /restaurants/signup with VITE_USE_MOCKS=true: answers the restaurant in review.
export const mockSignupApi: SignupApi = {
  async signup(input): Promise<RestaurantProfile> {
    await mockWait(400)
    mockFailIfAsked('signup')
    return {
      id: 'mock-restaurant',
      name: input.name,
      category: input.category,
      address: input.address,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      schedules: input.schedules.map((day) =>
        day.isOpen24h
          ? { dayOfWeek: day.dayOfWeek, isOpen24h: true, opensAt: null, closesAt: null }
          : { dayOfWeek: day.dayOfWeek, isOpen24h: false, opensAt: day.opensAt, closesAt: day.closesAt },
      ),
      activeReservationsCount: 0,
      approvalStatus: 'pending',
      rejectionReason: null,
      contactPhone: input.contactPhone.replace(/[^\d+]/g, ''),
    }
  },
}
