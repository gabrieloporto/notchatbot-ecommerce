import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '../../setup/test-utils';
import { CategoryNav } from '@/app/components/CategoryNav';

// Mock useSearchParams
const mockGet = vi.fn();
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
}));

const CATEGORIES = [
  'Calzado',
  'Buzos y camperas',
  'Remeras y camisas',
  'Ropa interior',
  'Accesorios',
  'Pantalones',
];

describe('CategoryNav Component', () => {
  beforeEach(() => {
    mockGet.mockClear();
  });

  describe('Rendering', () => {
    it('renders "Todos" link', () => {
      mockGet.mockReturnValue(null);
      render(<CategoryNav />);
      
      expect(screen.getByText('Todos')).toBeInTheDocument();
    });

    it('renders all category links', () => {
      mockGet.mockReturnValue(null);
      render(<CategoryNav />);
      
      CATEGORIES.forEach(category => {
        expect(screen.getByText(category)).toBeInTheDocument();
      });
    });

    it('renders correct number of links', () => {
      mockGet.mockReturnValue(null);
      render(<CategoryNav />);
      
      const links = screen.getAllByRole('link');
      // 1 "Todos" link + 6 category links
      expect(links).toHaveLength(7);
    });
  });

  describe('Navigation', () => {
    it('"Todos" link points to home', () => {
      mockGet.mockReturnValue(null);
      render(<CategoryNav />);
      
      const todosLink = screen.getByText('Todos');
      expect(todosLink).toHaveAttribute('href', '/');
    });

    it('category links have correct hrefs', () => {
      mockGet.mockReturnValue(null);
      render(<CategoryNav />);
      
      const calzadoLink = screen.getByText('Calzado');
      expect(calzadoLink).toHaveAttribute('href', '/?category=Calzado');
      
      const accesoriosLink = screen.getByText('Accesorios');
      expect(accesoriosLink).toHaveAttribute('href', '/?category=Accesorios');
    });

    it('encodes category names in URLs', () => {
      mockGet.mockReturnValue(null);
      render(<CategoryNav />);
      
      const buzosLink = screen.getByText('Buzos y camperas');
      // Space should be encoded
      expect(buzosLink).toHaveAttribute('href', '/?category=Buzos%20y%20camperas');
    });
  });

  describe('Active State', () => {
    it('"Todos" is active when no category selected', () => {
      mockGet.mockReturnValue(null);
      render(<CategoryNav />);
      
      const todosLink = screen.getByText('Todos');
      expect(todosLink).toHaveClass('text-primary');
    });

    it('selected category is active', () => {
      mockGet.mockReturnValue('Calzado');
      render(<CategoryNav />);
      
      const calzadoLink = screen.getByText('Calzado');
      expect(calzadoLink).toHaveClass('text-primary');
    });

    it('other categories are not active', () => {
      mockGet.mockReturnValue('Calzado');
      render(<CategoryNav />);
      
      const accesoriosLink = screen.getByText('Accesorios');
      expect(accesoriosLink).toHaveClass('text-gray-500');
      expect(accesoriosLink).not.toHaveClass('text-primary');
    });

    it('"Todos" is not active when category is selected', () => {
      mockGet.mockReturnValue('Calzado');
      render(<CategoryNav />);
      
      const todosLink = screen.getByText('Todos');
      expect(todosLink).toHaveClass('text-gray-500');
      expect(todosLink).not.toHaveClass('text-primary');
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      mockGet.mockReturnValue(null);
      const { container } = render(<CategoryNav className="custom-class" />);
      
      const nav = container.firstChild;
      expect(nav).toHaveClass('custom-class');
    });

    it('applies base styling classes', () => {
      mockGet.mockReturnValue(null);
      const { container } = render(<CategoryNav />);
      
      const nav = container.firstChild;
      expect(nav).toHaveClass('flex', 'items-center');
    });
  });
});
