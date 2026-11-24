import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App.tsx';
import { api, ApiClientError, request } from '../data/client';
import { updateMockStock } from '../data/mockServer';
import { startStockFeed } from '../data/stockFeed';
import { actions, store } from '../store';
import type { Product } from '../types';

function renderApp(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[path]}><App /></MemoryRouter>
      </QueryClientProvider>
    </Provider>,
  );
}

beforeEach(() => {
  store.dispatch(actions.signOut());
  store.dispatch(actions.clear());
});
afterEach(cleanup);
afterEach(() => vi.restoreAllMocks());

describe('storefront acceptance flows', () => {
  it('shows a themed mock API guide while keeping raw JSON links accessible', () => {
    renderApp('/mock-api');
    expect(screen.getByRole('heading', { name: /Mock API, made clear/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore endpoints/i })).toHaveAttribute('href', '#api-data-title');
    expect(screen.getByText('/api/products.json').closest('a')).toHaveAttribute('href', '/api/products.json');
    expect(screen.getByText('These paths describe the demo adapter used by the shop; they are not public HTTP endpoints.')).toBeInTheDocument();
  });

  it('uses URL filters to show matching products', async () => {
    renderApp('/?search=Debug&category=ducks');
    expect(await screen.findAllByRole('link', { name: 'Debug Duck 2' })).toHaveLength(2);
    expect(screen.queryByText('Mechanical Keyboard 1')).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search products' })).toHaveValue('Debug');
  });

  it('restores price, rating, and sorting controls from a shared URL', async () => {
    renderApp('/?priceBand=under-25&minRating=4.5&sort=name');
    expect(await screen.findByText(/products found/)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Price' })).toHaveValue('under-25');
    expect(screen.getByRole('combobox', { name: 'Rating' })).toHaveValue('4.5');
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveValue('name');
  });

  it('falls back to page one for an invalid page parameter', async () => {
    renderApp('/?page=NaN');
    expect(await screen.findAllByRole('link', { name: 'Debug Duck 2' })).toHaveLength(2);
    expect(screen.getByText('Page 1 of 209')).toBeInTheDocument();
  });

  it('moves an out-of-range page back to the last available page', async () => {
    renderApp('/?page=999999');
    expect(await screen.findByText('Page 209 of 209')).toBeInTheDocument();
    expect(screen.getByText('5,000 products found')).toBeInTheDocument();
    expect(screen.queryByText('No products match those filters. Try a different search.')).not.toBeInTheDocument();
  });

  it('keeps the newest search results when an older request finishes last', async () => {
    const pending = new Map<string, (result: { items: Product[]; total: number }) => void>();
    vi.spyOn(api, 'products').mockImplementation(filters => new Promise(resolve => {
      pending.set(filters.search, resolve);
    }));
    renderApp('/');
    const search = screen.getByRole('searchbox', { name: 'Search products' });
    fireEvent.change(search, { target: { value: 'coffee' } });
    await waitFor(() => expect(pending.has('coffee')).toBe(true), { timeout: 1500 });
    fireEvent.change(search, { target: { value: 'duck' } });
    await waitFor(() => expect(pending.has('duck')).toBe(true), { timeout: 1500 });
    const duck: Product = { id: 'new', name: 'Duck latest', price: 900, category: 'ducks', stock: 1, rating: 4, imageUrl: '' };
    const coffee: Product = { id: 'old', name: 'Coffee stale', price: 900, category: 'coffee', stock: 1, rating: 4, imageUrl: '' };
    await act(async () => { pending.get('duck')!({ items: [duck], total: 1 }); });
    expect(await screen.findByText('Duck latest')).toBeInTheDocument();
    expect(search).toHaveValue('duck');
    await act(async () => { pending.get('coffee')!({ items: [coffee], total: 1 }); });
    expect(screen.getByText('Duck latest')).toBeInTheDocument();
    expect(screen.queryByText('Coffee stale')).not.toBeInTheDocument();
  });

  it('shows and recovers from an intentionally triggered 500', async () => {
    renderApp('/?forceError=500');
    expect(await screen.findByText('Something went wrong. Please try again.', {}, { timeout: 3000 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findAllByRole('link', { name: 'Debug Duck 2' })).toHaveLength(2);
  });

  it('shows a not-found page for an unknown product', async () => {
    renderApp('/products/unknown');
    expect(await screen.findByRole('heading', { name: 'Looks like a broken link.' })).toBeInTheDocument();
  });

  it('recovers from a detail-page 500', async () => {
    renderApp('/products/gear-2?forceError=500');
    expect(await screen.findByText('Something went wrong. Please try again.', {}, { timeout: 3000 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('heading', { name: 'Debug Duck 2' })).toBeInTheDocument();
  });

  it('announces invalid login fields and prevents submission', async () => {
    renderApp('/login');
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'invalid' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findAllByRole('alert')).toHaveLength(2);
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Enter your password.')).toBeInTheDocument();
  });

  it('returns to checkout after login', async () => {
    store.dispatch(actions.add({ id: 'gear-2', name: 'Debug Duck 2', price: 936, category: 'ducks', stock: 2, rating: 3.6, imageUrl: '' }));
    renderApp('/checkout');
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByRole('heading', { name: 'Checkout' })).toBeInTheDocument();
  });

  it('clears the session for unauthorized API requests', async () => {
    store.dispatch(actions.signIn({ token: 'expired', user: { id: '1', name: 'Demo', email: 'demo@bugbazaar.dev' } }));
    await expect(api.me('expired')).rejects.toBeInstanceOf(ApiClientError);
    expect(store.getState().session.token).toBeNull();
  });

  it('ignores a request cancelled while it is in flight', async () => {
    const controller = new AbortController();
    const pending = request('/api/products?delay=50', { signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('places an order and shows its confirmation', async () => {
    store.dispatch(actions.signIn({ token: 'demo-session-token', user: { id: 'dev-1', name: 'Demo Developer', email: 'demo@bugbazaar.dev' } }));
    store.dispatch(actions.add({ id: 'gear-3', name: 'Dark Roast Beans 3', price: 1073, category: 'coffee', stock: 3, rating: 3.7, imageUrl: '' }));
    renderApp('/checkout');
    fireEvent.click(screen.getByRole('button', { name: /Place order/ }));
    expect(await screen.findByRole('heading', { name: 'Order placed!' })).toBeInTheDocument();
    expect(store.getState().cart).toHaveLength(0);
  });

  it('names the sold-out item when checkout returns 409', async () => {
    store.dispatch(actions.signIn({ token: 'demo-session-token', user: { id: 'dev-1', name: 'Demo Developer', email: 'demo@bugbazaar.dev' } }));
    store.dispatch(actions.add({ id: 'gear-2', name: 'Debug Duck 2', price: 936, category: 'ducks', stock: 2, rating: 3.6, imageUrl: '' }));
    updateMockStock('gear-2', 0);
    renderApp('/checkout');
    fireEvent.click(screen.getByRole('button', { name: /Place order/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Debug Duck 2 is no longer available in that quantity.');
    updateMockStock('gear-2', 2);
  });
});

describe('stock polling recovery', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('retries after a disconnect and stops when unsubscribed', async () => {
    const read = vi.fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({ id: 'gear-2', stock: 3 });
    const onUpdate = vi.fn();
    const stop = startStockFeed(read, onUpdate, 12_000);
    await vi.advanceTimersByTimeAsync(12_000);
    expect(onUpdate).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1000);
    expect(onUpdate).toHaveBeenCalledWith({ id: 'gear-2', stock: 3 });
    stop();
    await vi.advanceTimersByTimeAsync(24_000);
    expect(read).toHaveBeenCalledTimes(2);
  });

  it('ignores a response arriving after cleanup', async () => {
    let resolve!: (value: { id: string; stock: number }) => void;
    const read = () => new Promise<{ id: string; stock: number }>(done => { resolve = done; });
    const onUpdate = vi.fn();
    const stop = startStockFeed(read, onUpdate, 100);
    await vi.advanceTimersByTimeAsync(100);
    stop();
    resolve({ id: 'gear-2', stock: 3 });
    await Promise.resolve();
    expect(onUpdate).not.toHaveBeenCalled();
  });
});
