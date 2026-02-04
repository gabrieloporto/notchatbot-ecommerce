import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '@/app/context/CartContext';
import type { ReactNode } from 'react';

// Mock the toast
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Test wrapper
const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

// Sample product data
const mockProduct = {
  id: 1,
  name: 'Test Product',
  description: 'Test Description',
  price: 10000,
  image: '/test.jpg',
  stock: 10,
};

const mockProduct2 = {
  id: 2,
  name: 'Test Product 2',
  description: 'Another product',
  price: 5000,
  image: '/test2.jpg',
  stock: 5,
};

describe('useCart Hook', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Adding to cart', () => {
    it('adds a product to cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]!.product.id).toBe(1);
      expect(result.current.items[0]!.quantity).toBe(1);
    });

    it('increments quantity when adding existing product', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.addToCart(mockProduct);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]!.quantity).toBe(2);
    });

    it('adds multiple different products', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.addToCart(mockProduct2);
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[0]!.product.id).toBe(1);
      expect(result.current.items[1]!.product.id).toBe(2);
    });
  });

  describe('Updating quantity', () => {
    it('updates product quantity', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.updateQuantity(1, 5);
      });

      expect(result.current.items[0]!.quantity).toBe(5);
    });

    it('removes product when quantity is 0', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.updateQuantity(1, 0);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('does nothing when updating non-existent product', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.updateQuantity(999, 5);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('Removing from cart', () => {
    it('removes a product from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.removeFromCart(1);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('only removes specified product', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.addToCart(mockProduct2);
        result.current.removeFromCart(1);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]!.product.id).toBe(2);
    });
  });

  describe('Getting product quantity', () => {
    it('returns 0 for product not in cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.getProductQuantity(1)).toBe(0);
    });

    it('returns correct quantity for product in cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.addToCart(mockProduct);
        result.current.addToCart(mockProduct);
      });

      expect(result.current.getProductQuantity(1)).toBe(3);
    });
  });

  describe('Calculating totals', () => {
    it('returns 0 for empty cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.getTotal()).toBe(0);
    });

    it('calculates total for single product', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.updateQuantity(1, 2);
      });

      expect(result.current.getTotal()).toBe(20000); // 10000 * 2
    });

    it('calculates total for multiple products', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct); // 10000
        result.current.addToCart(mockProduct2); // 5000
        result.current.addToCart(mockProduct2); // +5000
      });

      expect(result.current.getTotal()).toBe(20000); // 10000 + 5000 + 5000
    });

    it('does not include shipping price in getTotal (only subtotal)', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct); // 10000
        result.current.setShippingPrice(3000);
      });

      // getTotal() returns only subtotal, shipping is handled separately in components
      expect(result.current.getTotal()).toBe(10000);
      expect(result.current.shippingPrice).toBe(3000);
    });
  });

  describe('Shipping methods', () => {
    it('sets shipping method', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.setShippingMethod('delivery');
      });

      expect(result.current.shippingMethod).toBe('delivery');
    });

    it('sets postal code', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.setPostalCode('1234');
      });

      expect(result.current.postalCode).toBe('1234');
    });

    it('sets shipping price', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.setShippingPrice(5000);
      });

      expect(result.current.shippingPrice).toBe(5000);
    });
  });

  describe('Clear cart', () => {
    it('clears all cart items and state', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.addToCart(mockProduct2);
        result.current.setShippingMethod('delivery');
        result.current.setPostalCode('1234');
        result.current.setShippingPrice(3000);
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.shippingMethod).toBeNull();
      expect(result.current.postalCode).toBe('');
      expect(result.current.shippingPrice).toBe(0);
    });
  });

  describe('Cart modal control', () => {
    it('sets shouldOpenCart flag', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.setShouldOpenCart(true);
      });

      expect(result.current.shouldOpenCart).toBe(true);

      act(() => {
        result.current.setShouldOpenCart(false);
      });

      expect(result.current.shouldOpenCart).toBe(false);
    });
  });
});
