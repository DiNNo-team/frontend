import type { RestaurantApi, UpdateRestaurantInput } from './api'
import type { RegisterScheduleInput, RestaurantProfile, RestaurantSchedule } from './types'

// In-memory stand-in for GET and PATCH /restaurants/me with VITE_USE_MOCKS=true, so the dashboard shows a real-looking
// restaurant name next to the mocked tables. Registration and geocoding still go to the backend: they have no sample.

function toSchedule(input: RegisterScheduleInput): RestaurantSchedule {
  return input.isOpen24h
    ? { dayOfWeek: input.dayOfWeek, isOpen24h: true, opensAt: null, closesAt: null }
    : { dayOfWeek: input.dayOfWeek, isOpen24h: false, opensAt: input.opensAt, closesAt: input.closesAt }
}

let restaurant: RestaurantProfile = {
  id: 'mock-restaurant',
  name: 'Casa 72',
  category: 'colombian',
  address: 'Calle 72 # 10-34, Bogotá',
  latitude: 4.657,
  longitude: -74.058,
  schedules: [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
    dayOfWeek,
    isOpen24h: false,
    opensAt: '12:00',
    closesAt: dayOfWeek >= 5 ? '01:00' : '22:00',
  })),
}

const wait = () => new Promise((resolve) => setTimeout(resolve, 300))

export const mockRestaurantApi: Pick<RestaurantApi, 'get' | 'update'> = {
  async get() {
    await wait()
    return { ...restaurant, schedules: restaurant.schedules.map((day) => ({ ...day })) }
  },
  async update(input: UpdateRestaurantInput) {
    await wait()
    const { schedules, ...fields } = input
    restaurant = { ...restaurant, ...fields, ...(schedules ? { schedules: schedules.map(toSchedule) } : {}) }
    return { ...restaurant }
  },
}
