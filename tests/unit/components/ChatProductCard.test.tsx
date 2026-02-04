import { describe, it, expect } from 'vitest';
import { render, screen } from '../../setup/test-utils';
import ChatProductCard from '@/app/components/ChatProductCard';

describe('ChatProductCard Component', () => {
  const mockProduct = {
    id: 1,
    name: 'Zapatillas Running Pro',
    price: 15000,
    stock: 10,
    image: '/images/product-1.jpg',
  };

  const mockProductNoImage = {
    id: 2,
    name: 'Remera Deportiva',
    price: 5000,
    stock: 20,
  };

  const mockProductOutOfStock = {
    id: 3,
    name: 'Medias Técnicas',
    price: 3000,
    stock: 0,
    image: '/images/product-3.jpg',
  };

  describe('Rendering', () => {
    it('renders product name', () => {
      render(<ChatProductCard product={mockProduct} />);
      
      expect(screen.getByText('Zapatillas Running Pro')).toBeInTheDocument();
    });

    it('renders product price', () => {
      render(<ChatProductCard product={mockProduct} />);
      
      expect(screen.getByText('$15.000')).toBeInTheDocument();
    });

    it('renders stock information', () => {
      render(<ChatProductCard product={mockProduct} />);
      
      expect(screen.getByText('10 disponibles')).toBeInTheDocument();
    });

    it('renders product image when available', () => {
      const { container } = render(<ChatProductCard product={mockProduct} />);
      
      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();
    });

    it('renders placeholder when no image', () => {
      render(<ChatProductCard product={mockProductNoImage} />);
      
      // Should have shopping cart icon as placeholder
      const { container } = render(<ChatProductCard product={mockProductNoImage} />);
      const placeholder = container.querySelector('.w-full.h-full');
      expect(placeholder).toBeInTheDocument();
    });
  });

  describe('Stock Display', () => {
    it('shows available stock in green', () => {
      render(<ChatProductCard product={mockProduct} />);
      
      const stockText = screen.getByText('10 disponibles');
      expect(stockText).toHaveClass('text-green-600');
    });

    it('shows out of stock message in red', () => {
      render(<ChatProductCard product={mockProductOutOfStock} />);
      
      const stockText = screen.getByText('Sin stock');
      expect(stockText).toHaveClass('text-red-600');
    });
  });

  describe('Navigation', () => {
    it('is a clickable link to product detail', () => {
      render(<ChatProductCard product={mockProduct} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/products/1');
    });

    it('links to correct product ID', () => {
      render(<ChatProductCard product={mockProductNoImage} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/products/2');
    });
  });

  describe('Styling', () => {
    it('has proper card styling', () => {
      const { container } = render(<ChatProductCard product={mockProduct} />);
      
      const card = container.querySelector('.rounded-xl.border');
      expect(card).toBeInTheDocument();
    });

    it('has hover effects', () => {
      const { container } = render(<ChatProductCard product={mockProduct} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('hover:border-gray-300');
      expect(link).toHaveClass('hover:shadow-md');
    });
  });

  describe('Price Formatting', () => {
    it('formats price with thousands separator', () => {
      const expensiveProduct = {
        id: 4,
        name: 'Expensive Item',
        price: 150000,
        stock: 1,
      };

      render(<ChatProductCard product={expensiveProduct} />);
      
      expect(screen.getByText('$150.000')).toBeInTheDocument();
    });

    it('handles small prices correctly', () => {
      const cheapProduct = {
        id: 5,
        name: 'Cheap Item',
        price: 99,
        stock: 100,
      };

      render(<ChatProductCard product={cheapProduct} />);
      
      expect(screen.getByText('$99')).toBeInTheDocument();
    });
  });
});
