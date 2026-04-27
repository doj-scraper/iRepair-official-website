import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockCheckBotId = vi.fn();
const mockGetUserFromAuthHeader = vi.fn();
const mockUserRoleCount = vi.fn();
const mockOrderFindMany = vi.fn();

vi.mock('botid/server', () => ({
  checkBotId: mockCheckBotId,
}));

vi.mock('@/lib/supabaseServer', () => ({
  getUserFromAuthHeader: mockGetUserFromAuthHeader,
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    userRole: {
      count: mockUserRoleCount,
    },
    order: {
      findMany: mockOrderFindMany,
    },
  },
}));

describe('GET /api/admin/orders', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockCheckBotId.mockResolvedValue({ isBot: false });
  });

  it('returns 401 when no auth user is resolved', async () => {
    mockGetUserFromAuthHeader.mockResolvedValue(null);
    const { GET } = await import('./route');
    const req = new NextRequest('http://localhost:3000/api/admin/orders');

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.ok).toBe(false);
  });

  it('returns 403 when the caller is not an admin', async () => {
    mockGetUserFromAuthHeader.mockResolvedValue({ id: 'user-1' });
    mockUserRoleCount.mockResolvedValue(0);
    const { GET } = await import('./route');
    const req = new NextRequest('http://localhost:3000/api/admin/orders', {
      headers: { authorization: 'Bearer token' },
    });

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(mockUserRoleCount).toHaveBeenCalledWith({
      where: { userId: 'user-1', role: 'admin' },
    });
    expect(json.ok).toBe(false);
  });

  it('returns orders with profile and items for admins', async () => {
    const now = '2026-04-27T10:00:00.000Z';
    const orders = [
      {
        id: 'order-1',
        userId: 'user-1',
        stripeSessionId: null,
        totalAmount: 14999,
        status: 'PAID',
        createdAt: now,
        updatedAt: now,
        profile: {
          id: 'user-1',
          email: 'boss@example.com',
          name: 'Boss',
          shopName: 'Boss Repair',
          createdAt: now,
          updatedAt: now,
        },
        items: [
          {
            id: 'item-1',
            orderId: 'order-1',
            skuId: 'AP-IP15PR-SCR-OEM',
            quantity: 1,
            unitPrice: 14999,
          },
        ],
      },
    ];

    mockGetUserFromAuthHeader.mockResolvedValue({ id: 'user-1' });
    mockUserRoleCount.mockResolvedValue(1);
    mockOrderFindMany.mockResolvedValue(orders);
    const { GET } = await import('./route');
    const req = new NextRequest('http://localhost:3000/api/admin/orders', {
      headers: { authorization: 'Bearer token' },
    });

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(mockOrderFindMany).toHaveBeenCalledWith({
      include: {
        profile: true,
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    expect(json).toEqual({ ok: true, orders });
  });
});
