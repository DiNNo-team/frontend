import { ApiError } from '@/lib/api-client'
import { mockFailIfAsked, mockParams, mockWait } from '@/lib/mock-env'
import type { ApprovalStatus } from '@/features/restaurant/types'
import type { AdminApi } from './api'
import { MOCK_PANEL_ROWS, MOCK_SUSPENDED_INDEX, mockRestaurantId } from './mock-restaurants'
import type { AdminListParams, AdminRestaurantDetail, AdminRestaurantItem, AdminRestaurantPage } from './types'

// Stand-in for the review endpoints with VITE_USE_MOCKS=true. Empty: ?mockEmpty · errors: ?mockError=admin-list,
// admin-detail or admin-review · slower: ?mockLatency=3000 (shared) · somebody else reviewed first: ?mockConflict.

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString()

const SCHEDULE = [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({ dayOfWeek, isOpen24h: false, opensAt: '12:00', closesAt: '21:00' }))

function seed(): AdminRestaurantDetail[] {
  const base = { latitude: 4.6533, longitude: -74.0836, schedules: SCHEDULE, rejectionReason: null, reviewedByEmail: null, reviewedAt: null, suspensionReason: null, suspendedAt: null, suspendedByEmail: null }
  const pending = [
    ['Casa Tamarindo', 'colombian', 'Carrera 7 # 72-41, Bogotá', '+573001234567', 'tamarindo@correo.test', 6],
    ['Trattoria Nonna Pía', 'italian', 'Calle 85 # 12-30, Bogotá', '+573105550101', 'pia@correo.test', 3],
    ['Taquería La Esquina', 'mexican', 'Calle 63 # 9-15, Bogotá', '+573205550202', 'esquina@correo.test', 1],
    ['Sushi Chapinero', 'asian', 'Carrera 13 # 59-20, Bogotá', '+573015550303', 'sushi@correo.test', 0],
  ] as const
  const reviewed = [
    ['Asados del Norte', 'grill', 'Calle 116 # 15-10, Bogotá', '+573115550404', 'asados@correo.test', 'approved', 12, null],
    ['Café Quinta', 'cafe', 'Calle 70A # 5-22, Bogotá', '+573125550505', 'cafe@correo.test', 'approved', 9, null],
    ['Mar y Sol', 'seafood', 'Carrera 11 # 93-40, Bogotá', '+573135550606', 'mar@correo.test', 'rejected', 5, 'La dirección no coincide con la ubicación del mapa. Corrígela y vuelve a enviar la solicitud.'],
  ] as const
  const operating = MOCK_PANEL_ROWS.map(([name, category], index) => {
    const suspended = index === MOCK_SUSPENDED_INDEX
    return {
      ...base,
      id: mockRestaurantId(index),
      name,
      category,
      address: 'Carrera 7 # 72-41, Bogotá',
      contactPhone: `+57300555${String(index).padStart(4, '0')}`,
      ownerEmail: `dueno${index + 1}@correo.test`,
      approvalStatus: suspended ? ('suspended' as const) : ('approved' as const),
      submittedAt: daysAgo(95),
      createdAt: daysAgo(100),
      reviewedAt: daysAgo(90),
      reviewedByEmail: 'admin@dinno.test',
      suspensionReason: suspended ? 'Varios comensales reportaron que las mesas reservadas no estaban disponibles.' : null,
      suspendedAt: suspended ? daysAgo(2) : null,
      suspendedByEmail: suspended ? 'admin@dinno.test' : null,
    }
  })
  return [
    ...operating,
    ...pending.map(([name, category, address, contactPhone, ownerEmail, ago], index) => ({
      ...base, id: `mock-pending-${index + 1}`, name, category, address, contactPhone, ownerEmail, approvalStatus: 'pending' as const, submittedAt: daysAgo(ago), createdAt: daysAgo(ago + 1),
    })),
    ...reviewed.map(([name, category, address, contactPhone, ownerEmail, approvalStatus, ago, reason], index) => ({
      ...base, id: `mock-reviewed-${index + 1}`, name, category, address, contactPhone, ownerEmail, approvalStatus, submittedAt: daysAgo(ago + 2), createdAt: daysAgo(ago + 3),
      reviewedAt: daysAgo(ago), reviewedByEmail: 'admin@dinno.test', rejectionReason: reason,
    })),
  ]
}

let restaurants = seed()

/** Test and dev controls. */
export const mockAdminControl = {
  reset() {
    restaurants = seed()
  },
}

async function simulate(operation: 'admin-list' | 'admin-detail' | 'admin-review') {
  await mockWait(400)
  mockFailIfAsked(operation)
}

function toItem(detail: AdminRestaurantDetail): AdminRestaurantItem {
  const { latitude, longitude, schedules, rejectionReason, reviewedByEmail, createdAt, suspensionReason, suspendedAt, suspendedByEmail, ...item } = detail
  void [latitude, longitude, schedules, rejectionReason, reviewedByEmail, createdAt, suspensionReason, suspendedAt, suspendedByEmail]
  return item
}

function find(id: string): AdminRestaurantDetail {
  const found = restaurants.find((item) => item.id === id)
  if (!found) throw new ApiError({ status: 404, code: 'RESTAURANT_NOT_FOUND' })
  return found
}

function review(id: string, changes: Partial<AdminRestaurantDetail>): AdminRestaurantDetail {
  const current = find(id)
  if (current.approvalStatus !== 'pending' || mockParams().has('mockConflict')) throw new ApiError({ status: 409, code: 'RESTAURANT_NOT_PENDING' })
  const updated = { ...current, ...changes, reviewedAt: new Date().toISOString(), reviewedByEmail: 'admin@dinno.test' }
  restaurants = restaurants.map((item) => (item.id === id ? updated : item))
  return updated
}

/** The restaurants of the directory (billing and activity mocks) are listed only as suspended: «Aprobadas» keeps the sample requests. */
const isDirectory = (item: AdminRestaurantDetail) => item.id.startsWith('mock-restaurant-')

function sorted({ status }: Pick<AdminListParams, 'status'>): AdminRestaurantDetail[] {
  const rows = restaurants.filter((item) => item.approvalStatus === status && (status === 'suspended' || !isDirectory(item)))
  return status === 'pending'
    ? rows.sort((a, b) => Date.parse(a.submittedAt) - Date.parse(b.submittedAt))
    : rows.sort((a, b) => Date.parse(b.suspendedAt ?? b.reviewedAt ?? '0') - Date.parse(a.suspendedAt ?? a.reviewedAt ?? '0'))
}

/** The approval state of a restaurant of the sample data, for the billing mock (a suspended one is shown as such there). */
export function mockApprovalOf(id: string): ApprovalStatus | undefined {
  return restaurants.find((item) => item.id === id)?.approvalStatus
}

function changeState(id: string, from: ApprovalStatus, changes: Partial<AdminRestaurantDetail>, code: string): AdminRestaurantDetail {
  const current = find(id)
  if (current.approvalStatus !== from || mockParams().has('mockConflict')) throw new ApiError({ status: 409, code })
  const updated = { ...current, ...changes }
  restaurants = restaurants.map((item) => (item.id === id ? updated : item))
  return updated
}

export const mockAdminApi: AdminApi = {
  async list(params): Promise<AdminRestaurantPage> {
    await simulate('admin-list')
    const rows = mockParams().has('mockEmpty') ? [] : sorted(params)
    const start = (params.page - 1) * params.pageSize
    return { items: rows.slice(start, start + params.pageSize).map(toItem), total: rows.length, page: params.page, pageSize: params.pageSize }
  },
  async get(id) {
    await simulate('admin-detail')
    return { ...find(id) }
  },
  async approve(id) {
    await simulate('admin-review')
    return review(id, { approvalStatus: 'approved', rejectionReason: null })
  },
  async reject(id, reason) {
    await simulate('admin-review')
    return review(id, { approvalStatus: 'rejected', rejectionReason: reason.trim() })
  },
  async suspend(id, reason) {
    await simulate('admin-review')
    return changeState(
      id,
      'approved',
      { approvalStatus: 'suspended', suspensionReason: reason.trim(), suspendedAt: new Date().toISOString(), suspendedByEmail: 'admin@dinno.test' },
      'RESTAURANT_NOT_APPROVED',
    )
  },
  async reactivate(id) {
    await simulate('admin-review')
    return changeState(id, 'suspended', { approvalStatus: 'approved' }, 'RESTAURANT_NOT_SUSPENDED')
  },
}
