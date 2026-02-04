import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '../../setup/test-utils';
import userEvent from '@testing-library/user-event';
import { ShippingCalculator } from '@/app/components/ShippingCalculator';
import { useCart } from '@/app/context/CartContext';
import { renderHook, act } from '@testing-library/react';

// Mock formatPrice
vi.mock('@/utils/formatPrice', () => ({
  formatPrice: (price: number) => `$${price}`,
}));

describe('ShippingCalculator Component', () => {
  beforeEach(() => {
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders calculator title', () => {
      render(<ShippingCalculator />);
      
      expect(screen.getByText(/calculadora de envío/i)).toBeInTheDocument();
    });

    it('renders postal code input', () => {
      render(<ShippingCalculator />);
      
      const input = screen.getByPlaceholderText(/código postal/i);
      expect(input).toBeInTheDocument();
    });

    it('renders calculate button', () => {
      render(<ShippingCalculator />);
      
      const button = screen.getByRole('button', { name: /calcular/i });
      expect(button).toBeInTheDocument();
    });

    it('has proper accessibility labels', () => {
      render(<ShippingCalculator />);
      
      expect(screen.getByLabelText(/código postal/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/calcular costo de envío/i)).toBeInTheDocument();
    });
  });

  describe('Postal Code Input', () => {
    it('updates input value when typing', async () => {
      const user = userEvent.setup();
      render(<ShippingCalculator />);
      
      const input = screen.getByPlaceholderText(/código postal/i) as HTMLInputElement;
      await user.type(input, '1234');
      
      expect(input.value).toBe('1234');
    });

    it('only allows numeric input', async () => {
      const user = userEvent.setup();
      render(<ShippingCalculator />);
      
      const input = screen.getByPlaceholderText(/código postal/i) as HTMLInputElement;
      await user.type(input, 'abc123def456');
      
      // Should only contain digits
      expect(input.value).toMatch(/^\d+$/);
    });
  });

  describe('Calculate Button', () => {
    it('shows "Calcular" text when ready', () => {
      render(<ShippingCalculator />);
      
      const button = screen.getByRole('button', { name: /calcular/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Shipping Calculation', () => {
    it('makes API call with postal code', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ price: 500, estimatedDays: 3 }),
      });

      const user = userEvent.setup();
      render(<ShippingCalculator />);
      
      const input = screen.getByPlaceholderText(/código postal/i);
      await user.type(input, '1234');
      
      const button = screen.getByRole('button', { name: /calcular/i });
      await user.click(button);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/shipping-costs/1234')
      );
    });

    it('displays shipping result on success', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ price: 500, estimatedDays: 3 }),
      });

      const user = userEvent.setup();
      render(<ShippingCalculator />);
      
      const input = screen.getByPlaceholderText(/código postal/i);
      await user.type(input, '1234');
      
      const button = screen.getByRole('button', { name: /calcular/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/costo de envío/i)).toBeInTheDocument();
        expect(screen.getByText(/\$500/i)).toBeInTheDocument();
        expect(screen.getByText(/3 días/i)).toBeInTheDocument();
      });
    });

    it('handles API error gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
      });

      const user = userEvent.setup();
      render(<ShippingCalculator />);
      
      const input = screen.getByPlaceholderText(/código postal/i);
      await user.type(input, '1234');
      
      const button = screen.getByRole('button', { name: /calcular/i });
      await user.click(button);
      
      await waitFor(() => {
        // Button should be enabled again after error
        expect(button).not.toBeDisabled();
      });
      
      // Should not show result on error
      expect(screen.queryByText(/costo de envío/i)).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading state during calculation', async () => {
      let resolvePromise: any;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      (global.fetch as any).mockReturnValueOnce(promise);

      const user = userEvent.setup();
      render(<ShippingCalculator />);
      
      const input = screen.getByPlaceholderText(/código postal/i);
      await user.type(input, '1234');
      
      const button = screen.getByRole('button', { name: /calcular/i });
      await user.click(button);
      
      // Should show loading text
      expect(screen.getByText(/calculando/i)).toBeInTheDocument();
      expect(button).toBeDisabled();
      
      // Resolve promise
      resolvePromise({
        ok: true,
        json: async () => ({ price: 500, estimatedDays: 3 }),
      });
      
      await waitFor(() => {
        expect(screen.queryByText(/calculando/i)).not.toBeInTheDocument();
      });
    });
  });
});
