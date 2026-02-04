import { describe, it, expect } from 'vitest';
import { render, screen } from '../../setup/test-utils';
import SuccessPageContent from '@/app/components/SuccessPageContent';

describe('SuccessPageContent Component', () => {
  const mockOrder = {
    id: 'ORD-123456',
    contactEmail: 'test@example.com',
    items: [
      {
        id: 1,
        name: 'Zapatillas Running Pro',
        price: 15000,
        quantity: 2,
      },
    ],
    total: 31500,
    shippingMethod: 'delivery' as const,
  };

  describe('Rendering', () => {
    it('renders success message', () => {
      render(<SuccessPageContent order={mockOrder} />);
      
      expect(screen.getByText(/compra exitosa/i)).toBeInTheDocument();
    });

    it('displays order ID', () => {
      render(<SuccessPageContent order={mockOrder} />);
      
      expect(screen.getByText(/ORD-123456/)).toBeInTheDocument();
    });

    it('displays contact email', () => {
      render(<SuccessPageContent order={mockOrder} />);
      
      expect(screen.getByText(/test@example\.com/)).toBeInTheDocument();
    });

    it('displays order total', () => {
      render(<SuccessPageContent order={mockOrder} />);
      
      expect(screen.getByText(/31\.500/)).toBeInTheDocument();
    });

    it('shows link to continue shopping', () => {
      render(<SuccessPageContent order={mockOrder} />);
      
      const link = screen.getByRole('link', { name: /seguir comprando/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/');
    });
  });

  describe('Order Items', () => {
    it('displays order items', () => {
      render(<SuccessPageContent order={mockOrder} />);
      
      expect(screen.getByText('Zapatillas Running Pro')).toBeInTheDocument();
    });

    it('displays item quantity', () => {
      render(<SuccessPageContent order={mockOrder} />);
      
      expect(screen.getByText(/x2/i)).toBeInTheDocument();
    });

    it('displays item price', () => {
      render(<SuccessPageContent order={mockOrder} />);
      
      expect(screen.getByText(/15\.000/)).toBeInTheDocument();
    });
  });

  describe('Shipping Method', () => {
    it('displays delivery method', () => {
      render(<SuccessPageContent order={mockOrder} />);
      
      expect(screen.getByText(/envío a domicilio/i)).toBeInTheDocument();
    });

    it('displays pickup method', () => {
      const pickupOrder = {
        ...mockOrder,
        shippingMethod: 'pickup' as const,
      };

      render(<SuccessPageContent order={pickupOrder} />);
      
      expect(screen.getByText(/retiro en local/i)).toBeInTheDocument();
    });
  });

  describe('Multiple Items', () => {
    it('renders all order items', () => {
      const multiItemOrder = {
        ...mockOrder,
        items: [
          {
            id: 1,
            name: 'Product 1',
            price: 10000,
            quantity: 1,
          },
          {
            id: 2,
            name: 'Product 2',
            price: 20000,
            quantity: 2,
          },
        ],
      };

      render(<SuccessPageContent order={multiItemOrder} />);
      
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });
});
