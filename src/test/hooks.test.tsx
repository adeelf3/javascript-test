import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useBackToTop, useDebounce } from '../hooks';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it('debounces the latest search value and cancels the previous timer', async () => {
  const { result, rerender, unmount } = renderHook(({ search }) => useDebounce(search, 300), {
    initialProps: { search: 'd' },
  });
  rerender({ search: 'du' });
  await act(() => vi.advanceTimersByTimeAsync(200));
  rerender({ search: 'duck' });
  await act(() => vi.advanceTimersByTimeAsync(299));
  expect(result.current).toBe('d');
  await act(() => vi.advanceTimersByTimeAsync(1));
  expect(result.current).toBe('duck');
  unmount();
});

it('removes the scroll listener when Back to Top unmounts', () => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0, writable: true });
  const remove = vi.spyOn(window, 'removeEventListener');
  const { result, unmount } = renderHook(() => useBackToTop());
  expect(result.current).toBe(false);
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 500, writable: true });
  act(() => window.dispatchEvent(new Event('scroll')));
  expect(result.current).toBe(true);
  unmount();
  expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
  remove.mockRestore();
});
