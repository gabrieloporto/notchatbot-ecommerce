import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../setup/test-utils';
import userEvent from '@testing-library/user-event';
import { OrderModal } from '@/app/components/OrderModal';

// Mock formatPrice
vi.mock('@/utils/formatPrice', () => ({
  formatPrice: (price: number) => `$${price}`,
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

const mockOrder = {
  id: 12345,
  customerName: 'Juan Pérez',
  total: 25000,
  status: 'pending',
  createdAt: '2024-01-15T10:30:00Z',
  items: [
    {
      product: {
        id: 1,
        name: 'Product 1',
        price: 10000,
        image: '/product1.jpg',
      },
      quantity: 2,
    },
    {
      product: {
        id: 2,
        name: 'Product 2',
        price: 5000,
        image: '/product2.jpg',
      },
      quantity: 1,
    },
  ],
};

describe('OrderModal Component', () => {
  const mockOnClose = vi.fn();

  describe('Modal Visibility', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <OrderModal isOpen={false} onClose={mockOnClose} order={mockOrder} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('renders modal when isOpen is true', () => {
      render(<OrderModal isOpen={true} onClose={mockOnClose} order={mockOrder} />);
      
      expect(screen.getByText(/orden #12345/i)).toBeInTheDocument();
    });
  });

  describe('Order Information', () => {
    it('displays order ID', () => {
      render(<OrderModal isOpen={true} onClose={mockOnClose} order={mockOrder} />);
      
      expect(screen.getByText(/orden #12345/i)).toBeInTheDocument();
    });

    it('displays customer name', () => {
      render(<OrderModal isOpen={true} onClose={mockOnClose} order={mockOrder} />);
      
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    it('displays order total', () => {
      render(<OrderModal isOpen={true} onClose={mockOnClose} order={mockOrder} />);
      
      expect(screen.getByText('$25000')).toBeInTheDocument();
    });

    it('displays order status (pending)', () => {
      render(<OrderModal isOpen={true} onClose={mockOnClose} order={mockOrder} />);
      
      expect(screen.getByText('Pendiente')).toBeInTheDocument();
    });

    it('displays order status (completed)', () => {
      const completedOrder = { ...mockOrder, status: 'completed' };
      render(<OrderModal isOpen={true} onClose={mockOnClose} order={completedOrder} />);
      
      expect(screen.getByText('Completada')).toBeInTheDocument();
    });
  });

  describe('Order Items', () => {
    it('displays all order items', () => {
      render(<OrderModal isOpen={true} onClose={mockOnClose} order={mockOrder} />);
      
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });

    it('displays item quantities and prices', () => {
      render(<OrderModal isOpen={true} onClose={mockOnClose} order={mockOrder} />);
      
      expect(screen.getByText(/2 x \$10000/)).toBeInTheDocument();
      expect(screen.getByText(/1 x \$5000/)).toBeInTheDocument();
    });

    it('displays product images', () => {
      render(<OrderModal isOpen={true} onClose={mockOnClose} order={mockOrder} />);
      
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('src', '/product1.jpg');
      expect(images[1]).toHaveAttribute('src', '/product2.jpg');
    });
  });

  describe('Close Functionality', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<OrderModal isOpen={true} onClose={mockOnClose} order={mockOrder} />);
      
      const closeButton = screen.getByText('✕');
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when "Cerrar" button is clicked', async () => {
      const user = userEvent.setup();
      render(<OrderModal isOpen={true} onClose={mockOnClose} order={mockOrder} />);
      
      const cerrarButton = screen.getByText('Cerrar');
      await user.click(cerrarButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when overlay is clicked', () => {
      render(<OrderModal isOpen={true} onClose={mockOnClose} order={mockOrder} />);
      
      const overlay = screen.getByRole('presentation');
      overlay.click();
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
