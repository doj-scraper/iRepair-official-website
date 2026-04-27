import { describe, expect, it, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockCheckBotId = vi.fn();
const mockGetUserFromAuthHeader = vi.fn();
const mockFunctionsInvoke = vi.fn();

vi.mock('botid/server', () => ({
  checkBotId: mockCheckBotId,
}));

vi.mock('@/lib/supabaseServer', () => ({
  default: {
    functions: {
      invoke: mockFunctionsInvoke,
    },
  },
  getUserFromAuthHeader: mockGetUserFromAuthHeader,
}));

describe('POST /api/create-checkout', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockCheckBotId.mockResolvedValue({ isBot: false });
    mockFunctionsInvoke.mockResolvedValue({
      data: { url: 'https://stripe.test/session', orderId: 'order-1' },
      error: null,
    });
  });

  it('returns 401 when the caller is not authenticated', async () => {
    mockGetUserFromAuthHeader.mockResolvedValue(null);
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost:3000/api/create-checkout', {
      method: 'POST',
      headers: { authorization: 'Bearer token' },
      body: JSON.stringify({ items: [{ skuId: 'AP-IP15PR-SCR-OEM', quantity: 1 }] }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.ok).toBe(false);
    expect(mockFunctionsInvoke).not.toHaveBeenCalled();
  });

  it('forwards the user access token to the checkout edge function', async () => {
    mockGetUserFromAuthHeader.mockResolvedValue({ id: 'user-1' });
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost:3000/api/create-checkout', {
      method: 'POST',
      headers: { authorization: 'Bearer token' },
      body: JSON.stringify({ items: [{ skuId: 'AP-IP15PR-SCR-OEM', quantity: 2 }] }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(mockFunctionsInvoke).toHaveBeenCalledWith(
      'create-checkout',
      expect.objectContaining({
        body: {
          items: [{ skuId: 'AP-IP15PR-SCR-OEM', quantity: 2 }],
          userId: 'user-1',
        },
        headers: { Authorization: 'Bearer token' },
      })
    );
    expect(json).toEqual({ url: 'https://stripe.test/session', orderId: 'order-1' });
  });
});
