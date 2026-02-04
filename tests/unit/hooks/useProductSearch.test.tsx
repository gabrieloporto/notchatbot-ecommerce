import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProductSearch } from '@/app/hooks/useProductSearch';

describe('useProductSearch Hook', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = fetchMock;
    // Using real timers to avoid Promise/microtask issues with fake timers
    vi.useRealTimers();
  });

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  it('initializes with default state', () => {
    const { result } = renderHook(() => useProductSearch());
    
    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isVisible).toBe(false);
  });

  it('updates query state', () => {
    const { result } = renderHook(() => useProductSearch());
    
    act(() => {
      result.current.setQuery('test');
    });
    
    expect(result.current.query).toBe('test');
  });

  it('sets isVisible state', () => {
    const { result } = renderHook(() => useProductSearch());
    
    act(() => {
      result.current.setIsVisible(true);
    });
    
    expect(result.current.isVisible).toBe(true);
  });

  it('does not search if query is too short', async () => {
    const { result } = renderHook(() => useProductSearch());
    
    act(() => {
      result.current.setQuery('a');
    });

    await act(async () => {
      await wait(350);
    });
    
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
  });

  it('searches when query is long enough', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', price: 100, category: 'Test', description: 'Desc', image: null }
    ];

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    const { result } = renderHook(() => useProductSearch());
    
    act(() => {
      result.current.setQuery('test');
    });

    // Wait for loading to start and finish
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.results).toEqual(mockProducts);
    }, { timeout: 2000 });
    
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('debounces search requests', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', price: 100, category: 'Test', description: 'Desc', image: null }
    ];

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    });

    const { result } = renderHook(() => useProductSearch());
    
    act(() => {
      result.current.setQuery('tes');
    });
    
    // Wait less than debounce
    await act(async () => {
      await wait(100);
    });

    // Update query again
    act(() => {
      result.current.setQuery('test');
    });

    // Wait for full debounce
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    }, { timeout: 2000 });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('q=test'),
      expect.any(Object)
    );
  });

  it('handles empty results', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { result } = renderHook(() => useProductSearch());
    
    act(() => {
      result.current.setQuery('nonexistent');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.results).toEqual([]);
      expect(fetchMock).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('handles network errors', async () => {
    // Mock should return a rejected promise instantly
    fetchMock.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useProductSearch());
    
    act(() => {
      result.current.setQuery('network');
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Error al cargar los resultados');
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 2000 });
  });

  it('aborts previous request on new search', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { result } = renderHook(() => useProductSearch());
    
    // First search
    act(() => {
      result.current.setQuery('first');
    });

    // Wait for it to trigger
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    // Second search
    act(() => {
      result.current.setQuery('second');
    });

    // Wait for second trigger
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    // Check signals
    const firstCall = fetchMock.mock.calls[0];
    const secondCall = fetchMock.mock.calls[1];
    
    if (firstCall && secondCall) {
      expect(firstCall[1].signal).toBeInstanceOf(AbortSignal);
      expect(secondCall[1].signal).toBeInstanceOf(AbortSignal);
      expect(firstCall[1].signal).not.toBe(secondCall[1].signal);
    }
  });
});
