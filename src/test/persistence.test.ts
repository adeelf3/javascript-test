import { expect, it, vi } from 'vitest';

it('keeps an idempotent order and stock after mock-server reload', async () => {
  localStorage.removeItem('bazaar-mock-state');
  vi.resetModules();
  const first = await import('../data/mockServer');
  const headers = new Headers({
    Authorization: 'Bearer demo-session-token',
    'Idempotency-Key': 'reload-retry-test',
  });
  const body = { items: [{ productId: 'gear-2', quantity: 1 }] };
  const url = new URL('http://localhost/api/orders?delay=0');
  const created = await first.handleMockRequest(url, 'POST', headers, body);
  expect(created.status).toBe(201);
  expect(first.getMockProducts().find(product => product.id === 'gear-2')?.stock).toBe(1);

  vi.resetModules();
  const reloaded = await import('../data/mockServer');
  expect(reloaded.getMockProducts().find(product => product.id === 'gear-2')?.stock).toBe(1);
  const retried = await reloaded.handleMockRequest(url, 'POST', headers, body);
  expect(retried.body).toEqual(created.body);
  expect(reloaded.getMockProducts().find(product => product.id === 'gear-2')?.stock).toBe(1);
  localStorage.removeItem('bazaar-mock-state');
});
