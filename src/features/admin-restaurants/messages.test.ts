import { describe, expect, it } from 'vitest'
import type { AdminActivityItem } from '../admin/panel-types'
import { filterDirectory, memberSince } from './messages'

const item = (approvalStatus: AdminActivityItem['approvalStatus'], extra: Partial<AdminActivityItem> = {}) =>
  ({ id: approvalStatus, approvalStatus, approvedAt: null, createdAt: '2026-09-01T12:00:00.000Z', ...extra }) as AdminActivityItem

describe('directory of restaurants', () => {
  const items = [item('approved', { id: 'a' }), item('suspended', { id: 's' }), item('approved', { id: 'b' })]

  it('filters by state', () => {
    expect(filterDirectory(items, 'all')).toHaveLength(3)
    expect(filterDirectory(items, 'active').map((entry) => entry.id)).toEqual(['a', 'b'])
    expect(filterDirectory(items, 'suspended').map((entry) => entry.id)).toEqual(['s'])
  })

  it('counts the time in DiNNo from the approval, or from the creation when the team approved it', () => {
    expect(memberSince(item('approved', { approvedAt: '2026-10-01T12:00:00.000Z' }))).toBe('2026-10-01T12:00:00.000Z')
    expect(memberSince(item('approved'))).toBe('2026-09-01T12:00:00.000Z')
  })
})
