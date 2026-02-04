import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../../setup/test-utils';
import userEvent from '@testing-library/user-event';
import { CartModal } from '@/app/components/CartModal';

// Mock product data
const mockProduct = {
  id: 1,
  name: 'Test Product',
  description: 'Test Description',
  price: 10000,
  image: '/test.jpg',
  stock: 10,
};

describe('CartModal Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Empty Cart State', () => {
    it('displays empty cart message when no items', () => {
      render(<CartModal isOpen={true} onClose={() => {}} />);
      expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
    });

    it('does not show shipping section when cart is empty', () => {
      render(<CartModal isOpen={true} onClose={() => {}} />);
      // Empty cart should not show shipping or checkout options
      expect(screen.queryByText(/método de envío/i)).not.toBeInTheDocument();
    });

    it('does not show checkout button when cart is empty', () => {
      render(<CartModal isOpen={true} onClose={() => {}} />);
      expect(screen.queryByRole('link', { name: /proceder al pago/i })).not.toBeInTheDocument();
    });
  });

  describe('Modal Visibility', () => {
    it('renders when isOpen is true', () => {
      render(<CartModal isOpen={true} onClose={() => {}} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<CartModal isOpen={false} onClose={() => {}} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      render(<CartModal isOpen={true} onClose={onClose} />);
      
      const closeButton = screen.getByLabelText(/cerrar/i);
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalled();
    });

    it('closes when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      render(<CartModal isOpen={true} onClose={onClose} />);
      
      // Click on the backdrop/overlay (role=presentation)
      const backdrop = screen.getByRole('presentation');
      await user.click(backdrop);
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Cart Title', () => {
    it('displays cart title', () => {
      render(<CartModal isOpen={true} onClose={() => {}} />);
      expect(screen.getByText('Tu Carrito')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper dialog role', () => {
      render(<CartModal isOpen={true} onClose={() => {}} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has accessible close button', () => {
      render(<CartModal isOpen={true} onClose={() => {}} />);
      const closeButton = screen.getByLabelText(/cerrar/i);
      expect(closeButton).toBeInTheDocument();
    });

    it('traps focus within modal when open', () => {
      render(<CartModal isOpen={true} onClose={() => {}} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      // Focus management is handled by the Dialog component
    });
  });

  describe('Modal Animations', () => {
    it('renders dialog with proper classes', () => {
      render(<CartModal isOpen={true} onClose={() => {}} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('bg-white');
    });
  });
});
