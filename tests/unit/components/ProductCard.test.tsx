import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../setup/test-utils';
import userEvent from '@testing-library/user-event';
import ProductCard from '@/app/components/ProductCard';

// Mock product data
const mockProduct = {
  id: 1,
  name: 'Zapatillas Urbanas',
  description: 'Zapatillas cómodas para uso diario',
  price: 24999,
  image: '/test-image.jpg',
  stock: 10,
  category: 'Calzado',
};

const outOfStockProduct = {
  ...mockProduct,
  id: 2,
  stock: 0,
};

describe('ProductCard Component', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
  });

  describe('Product Information Display', () => {
    it('renders product name', () => {
      render(<ProductCard product={mockProduct} />);
      expect(screen.getByText('Zapatillas Urbanas')).toBeInTheDocument();
    });

    it('renders product price correctly formatted', () => {
      render(<ProductCard product={mockProduct} />);
      // Price is rendered as "$ 24.999" with whitespace/newline between $ and number
      expect(screen.getByText(/24\.999/)).toBeInTheDocument();
    });

    it('renders product category', () => {
      render(<ProductCard product={mockProduct} />);
      expect(screen.getByText('Calzado')).toBeInTheDocument();
    });

    it('renders stock information', () => {
      render(<ProductCard product={mockProduct} />);
      expect(screen.getByText('Stock: 10')).toBeInTheDocument();
    });

    it('displays product image alt text', () => {
      render(<ProductCard product={mockProduct} />);
      const image = screen.getByAltText('Zapatillas Urbanas');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Add to Cart Button', () => {
    it('shows "Agregar" button when product not in cart', () => {
      render(<ProductCard product={mockProduct} />);
      expect(screen.getByRole('button', { name: /agregar/i })).toBeInTheDocument();
    });

    it('disables add button when out of stock', () => {
      render(<ProductCard product={outOfStockProduct} />);
      const addButton = screen.getByRole('button', { name: /producto agotado/i });
      expect(addButton).toBeDisabled();
    });

    it('adds product to cart when clicked', async () => {
      const user = userEvent.setup();
      render(<ProductCard product={mockProduct} />);

      const addButton = screen.getByRole('button', { name: /agregar/i });
      await user.click(addButton);

      // Should show quantity controls after adding
      await waitFor(() => {
        expect(screen.getByLabelText(/aumentar cantidad/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/disminuir cantidad/i)).toBeInTheDocument();
      });
    });
  });

  describe('Quantity Controls', () => {
    it('shows quantity controls when product is in cart', async () => {
      const user = userEvent.setup();
      render(<ProductCard product={mockProduct} />);

      // Add to cart
      const addButton = screen.getByRole('button', { name: /agregar/i });
      await user.click(addButton);

      // Check for quantity controls
      await waitFor(() => {
        expect(screen.getByLabelText(/aumentar cantidad/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/disminuir cantidad/i)).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument(); // quantity display
      });
    });

    it('increments quantity when plus button clicked', async () => {
      const user = userEvent.setup();
      render(<ProductCard product={mockProduct} />);

      // Add to cart
      await user.click(screen.getByRole('button', { name: /agregar/i }));

      // Click increment
      await waitFor(async () => {
        const incrementButton = screen.getByLabelText(/aumentar cantidad/i);
        await user.click(incrementButton);
      });

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('decrements quantity when minus button clicked', async () => {
      const user = userEvent.setup();
      render(<ProductCard product={mockProduct} />);

      // Add 2 to cart
      await user.click(screen.getByRole('button', { name: /agregar/i }));
      await waitFor(async () => {
        await user.click(screen.getByLabelText(/aumentar cantidad/i));
      });

      // Decrement
      await waitFor(async () => {
        await user.click(screen.getByLabelText(/disminuir cantidad/i));
      });

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });

    it('disables decrement button at quantity 1', async () => {
      const user = userEvent.setup();
      render(<ProductCard product={mockProduct} />);

      await user.click(screen.getByRole('button', { name: /agregar/i }));

      await waitFor(() => {
        const decrementButton = screen.getByLabelText(/disminuir cantidad/i);
        expect(decrementButton).toBeDisabled();
      });
    });

    it('disables increment button at max stock', async () => {
      const limitedStockProduct = { ...mockProduct, stock: 1 };
      const user = userEvent.setup();
      render(<ProductCard product={limitedStockProduct} />);

      await user.click(screen.getByRole('button', { name: /agregar/i }));

      await waitFor(() => {
        const incrementButton = screen.getByLabelText(/aumentar cantidad/i);
        expect(incrementButton).toBeDisabled();
      });
    });
  });

  describe('Remove Button', () => {
    it('shows remove button when product is in cart', async () => {
      const user = userEvent.setup();
      render(<ProductCard product={mockProduct} />);

      await user.click(screen.getByRole('button', { name: /agregar/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/eliminar del carrito/i)).toBeInTheDocument();
      });
    });

    it('removes product when remove button clicked', async () => {
      const user = userEvent.setup();
      render(<ProductCard product={mockProduct} />);

      // Add to cart
      await user.click(screen.getByRole('button', { name: /agregar/i }));

      // Remove from cart
      await waitFor(async () => {
        await user.click(screen.getByLabelText(/eliminar del carrito/i));
      });

      // Should show add button again
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /agregar/i })).toBeInTheDocument();
      });
    });
  });

  describe('Product Link', () => {
    it('links to product detail page', () => {
      render(<ProductCard product={mockProduct} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/products/1');
    });
  });
});
