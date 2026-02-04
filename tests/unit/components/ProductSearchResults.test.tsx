import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../setup/test-utils';
import { ProductSearchResults } from '@/app/components/ProductSearchResults';

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

const mockProducts = [
  {
    id: 1,
    name: 'Laptop HP',
    price: 150000,
    image: '/laptop.jpg',
    category: 'Computadoras',
  },
  {
    id: 2,
    name: 'Mouse Logitech',
    price: 5000,
    image: null,
    category: 'Accesorios',
  },
];

describe('ProductSearchResults Component', () => {
  describe('Query Validation', () => {
    it('renders nothing when query is less than 2 characters', () => {
      const { container } = render(
        <ProductSearchResults
          results={mockProducts}
          isLoading={false}
          error={null}
          query="a"
        />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('renders when query is 2 or more characters', () => {
      render(
        <ProductSearchResults
          results={mockProducts}
          isLoading={false}
          error={null}
          query="laptop"
        />
      );
      
      expect(screen.getByText(/2 resultados encontrados/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator', () => {
      render(
        <ProductSearchResults
          results={[]}
          isLoading={true}
          error={null}
          query="laptop"
        />
      );
      
      expect(screen.getByText(/buscando productos/i)).toBeInTheDocument();
    });

    it('does not show results while loading', () => {
      render(
        <ProductSearchResults
          results={mockProducts}
          isLoading={true}
          error={null}
          query="laptop"
        />
      );
      
      expect(screen.queryByText(/resultados encontrados/i)).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message', () => {
      render(
        <ProductSearchResults
          results={[]}
          isLoading={false}
          error="Error al cargar los resultados"
          query="laptop"
        />
      );
      
      expect(screen.getByText(/error al cargar los resultados/i)).toBeInTheDocument();
    });

    it('does not show results when error', () => {
      render(
        <ProductSearchResults
          results={mockProducts}
          isLoading={false}
          error="Error"
          query="laptop"
        />
      );
      
      expect(screen.queryByText(/laptop hp/i)).not.toBeInTheDocument();
    });
  });

  describe('No Results State', () => {
    it('shows no results message', () => {
      render(
        <ProductSearchResults
          results={[]}
          isLoading={false}
          error={null}
          query="xyz123"
        />
      );
      
      expect(screen.getByText(/no se encontraron productos para "xyz123"/i)).toBeInTheDocument();
    });
  });

  describe('Results Display', () => {
    it('displays all product results', () => {
      render(
        <ProductSearchResults
          results={mockProducts}
          isLoading={false}
          error={null}
          query="laptop"
        />
      );
      
      expect(screen.getByText('Laptop HP')).toBeInTheDocument();
      expect(screen.getByText('Mouse Logitech')).toBeInTheDocument();
    });

    it('displays product prices', () => {
      render(
        <ProductSearchResults
          results={mockProducts}
          isLoading={false}
          error={null}
          query="laptop"
        />
      );
      
      expect(screen.getByText('$150000')).toBeInTheDocument();
      expect(screen.getByText('$5000')).toBeInTheDocument();
    });

    it('shows result count (singular)', () => {
      render(
        <ProductSearchResults
          results={[mockProducts[0]!]}
          isLoading={false}
          error={null}
          query="laptop"
        />
      );
      
      expect(screen.getByText(/1 resultado encontrado/i)).toBeInTheDocument();
    });

    it('shows result count (plural)', () => {
      render(
        <ProductSearchResults
          results={mockProducts}
          isLoading={false}
          error={null}
          query="laptop"
        />
      );
      
      expect(screen.getByText(/2 resultados encontrados/i)).toBeInTheDocument();
    });

    it('displays product images when available', () => {
      render(
        <ProductSearchResults
          results={[mockProducts[0]!]}
          isLoading={false}
          error={null}
          query="laptop"
        />
      );
      
      const image = screen.getByAltText('Laptop HP');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/laptop.jpg');
    });

    it('shows placeholder when image is null', () => {
      render(
        <ProductSearchResults
          results={[mockProducts[1]!]}
          isLoading={false}
          error={null}
          query="mouse"
        />
      );
      
      // Product without image should still render
      expect(screen.getByText('Mouse Logitech')).toBeInTheDocument();
    });
  });

  describe('Variant Styling', () => {
    it('applies desktop variant classes by default', () => {
      const { container } = render(
        <ProductSearchResults
          results={mockProducts}
          isLoading={false}
          error={null}
          query="laptop"
        />
      );
      
      const resultContainer = container.firstChild;
      expect(resultContainer).toHaveClass('absolute');
    });

    it('applies mobile variant classes when specified', () => {
      const { container } = render(
        <ProductSearchResults
          results={mockProducts}
          isLoading={false}
          error={null}
          query="laptop"
          variant="mobile"
        />
      );
      
      const resultContainer = container.firstChild;
      expect(resultContainer).not.toHaveClass('absolute');
    });
  });

  describe('Navigation', () => {
    it('renders links to product pages', () => {
      render(
        <ProductSearchResults
          results={mockProducts}
          isLoading={false}
          error={null}
          query="laptop"
        />
      );
      
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/products/1');
      expect(links[1]).toHaveAttribute('href', '/products/2');
    });

    it('calls onResultClick when product is clicked', async () => {
      const mockOnClick = vi.fn();
      render(
        <ProductSearchResults
          results={mockProducts}
          isLoading={false}
          error={null}
          query="laptop"
          onResultClick={mockOnClick}
        />
      );
      
      const firstLink = screen.getAllByRole('link')[0]!;
      firstLink.click();
      
      expect(mockOnClick).toHaveBeenCalled();
    });
  });
});
