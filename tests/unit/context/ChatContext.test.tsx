import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ChatProvider, useChat } from '@/app/context/ChatContext';
import type { ReactNode } from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ChatContext', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    global.fetch = fetchMock;
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <ChatProvider>{children}</ChatProvider>
  );

  describe('Initialization', () => {
    it('initializes with empty messages', () => {
      const { result } = renderHook(() => useChat(), { wrapper });

      expect(result.current.messages).toEqual([]);
      expect(result.current.isOpen).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('loads messages from localStorage on mount', () => {
      const storedMessages = [
        {
          role: 'user' as const,
          content: 'Hello',
          timestamp: '2024-01-01T00:00:00Z',
        },
      ];

      localStorageMock.setItem(
        'nexoshop-chat-history',
        JSON.stringify({
          messages: storedMessages,
          lastUpdated: '2024-01-01T00:00:00Z',
        })
      );

      const { result } = renderHook(() => useChat(), { wrapper });

      expect(result.current.messages).toEqual(storedMessages);
    });

    it('handles corrupted localStorage data gracefully', () => {
      localStorageMock.setItem('nexoshop-chat-history', 'invalid json{');

      const { result } = renderHook(() => useChat(), { wrapper });

      expect(result.current.messages).toEqual([]);
    });
  });

  describe('Message Management', () => {
    it('sends a user message', async () => {
      const mockResponse = {
        message: 'Hello! How can I help you?',
        timestamp: '2024-01-01T00:00:00Z',
        products: [],
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      await waitFor(() => {
        expect(result.current.messages.length).toBe(2);
      });

      expect(result.current.messages[0]).toMatchObject({
        role: 'user',
        content: 'Hello',
      });

      expect(result.current.messages[1]).toMatchObject({
        role: 'assistant',
        content: 'Hello! How can I help you?',
      });
    });

    it('includes conversation history in API calls', async () => {
      const mockResponse = {
        message: 'Response',
        timestamp: '2024-01-01T00:00:00Z',
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useChat(), { wrapper });

      // Send first message
      await act(async () => {
        await result.current.sendMessage('First message');
      });

      // Send second message
      await act(async () => {
        await result.current.sendMessage('Second message');
      });

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(2);
      });

      // Check second call includes history
      const secondCall = fetchMock.mock.calls[1];
      if (secondCall) {
        const body = JSON.parse(secondCall[1].body as string);
      
        expect(body.conversationHistory).toBeDefined();
        expect(body.conversationHistory.length).toBeGreaterThan(0);
      }
    });

    it('limits conversation history to last 10 messages', async () => {
      const mockResponse = {
        message: 'Response',
        timestamp: '2024-01-01T00:00:00Z',
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useChat(), { wrapper });

      // Send 12 messages
      for (let i = 0; i < 12; i++) {
        await act(async () => {
          await result.current.sendMessage(`Message ${i}`);
        });
      }

      await waitFor(() => {
        expect(result.current.messages.length).toBe(24); // 12 user + 12 assistant
      });

      // Check last call only includes last 10 messages in history
      const lastCall = fetchMock.mock.calls[11];
      if (lastCall) {
        const body = JSON.parse(lastCall[1].body as string);
      
        expect(body.conversationHistory.length).toBeLessThanOrEqual(10);
      }
    });
  });

  describe('API Integration', () => {
    it('handles product recommendations from API', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Product 1',
          price: 10000,
          stock: 5,
          category: 'Test',
        },
      ];

      const mockResponse = {
        message: 'Here are some products',
        timestamp: '2024-01-01T00:00:00Z',
        products: mockProducts,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.sendMessage('Show me products');
      });

      await waitFor(() => {
        expect(result.current.messages.length).toBe(2);
      });

      const assistantMessage = result.current.messages[1];
      if (assistantMessage) {
        expect(assistantMessage.products).toEqual(mockProducts);
      }
    });

    it('handles API errors gracefully', async () => {
      fetchMock.mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      await waitFor(() => {
        expect(result.current.messages.length).toBe(2);
      });

      const errorMessage = result.current.messages[1];
      if (errorMessage) {
        expect(errorMessage.role).toBe('assistant');
        expect(errorMessage.content).toContain('error');
      }
    });

    it('handles non-ok API responses', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      await waitFor(() => {
        expect(result.current.messages.length).toBe(2);
      });

      const errorMessage = result.current.messages[1];
      if (errorMessage) {
        expect(errorMessage.content).toContain('error');
      }
    });

    it('sets loading state during API call', async () => {
      const mockResponse = {
        message: 'Response',
        timestamp: '2024-01-01T00:00:00Z',
      };

      fetchMock.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockResponse,
                }),
              100
            )
          )
      );

      const { result } = renderHook(() => useChat(), { wrapper });

      act(() => {
        void result.current.sendMessage('Hello');
      });

      // Should be loading immediately
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('LocalStorage Persistence', () => {
    it('saves messages to localStorage', async () => {
      const mockResponse = {
        message: 'Response',
        timestamp: '2024-01-01T00:00:00Z',
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.sendMessage('Test message');
      });

      await waitFor(() => {
        const stored = localStorageMock.getItem('nexoshop-chat-history');
        expect(stored).toBeTruthy();
        
        if (stored) {
          const parsed = JSON.parse(stored);
          expect(parsed.messages).toHaveLength(2);
        }
      });
    });

    it('clears history and localStorage', async () => {
      const mockResponse = {
        message: 'Response',
        timestamp: '2024-01-01T00:00:00Z',
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.sendMessage('Test');
      });

      await waitFor(() => {
        expect(result.current.messages.length).toBe(2);
      });

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.messages).toEqual([]);
      expect(localStorageMock.getItem('nexoshop-chat-history')).toBeNull();
    });
  });

  describe('UI State Management', () => {
    it('toggles chat open and closed', () => {
      const { result } = renderHook(() => useChat(), { wrapper });

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.toggleChat();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggleChat();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('Error Cases', () => {
    it('throws error when useChat is used outside provider', () => {
      expect(() => {
        renderHook(() => useChat());
      }).toThrow('useChat must be used within ChatProvider');
    });
  });
});
