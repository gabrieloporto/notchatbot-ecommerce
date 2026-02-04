import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '../../setup/test-utils';
import userEvent from '@testing-library/user-event';
import { ProductSearch } from '@/app/components/ProductSearch';

// Mock values for useProductSearch hook
let mockHookValues = {
  query: '',
  setQuery: vi.fn(),
  results: [],
  isLoading: false,
  error: null,
  isVisible: false,
  setIsVisible: vi.fn(),
};

// Mock the useProductSearch hook
vi.mock('@/app/hooks/useProductSearch', () => ({
  useProductSearch: () => mockHookValues,
}));

// Mock ProductSearchResults component
vi.mock('@/app/components/ProductSearchResults', () => ({
  ProductSearchResults: ({ query }: { query: string }) => (
    <div data-testid="search-results">Results for: {query}</div>
  ),
}));

describe('ProductSearch Component', () => {
  beforeEach(() => {
    // Reset mock values
    mockHookValues = {
      query: '',
      setQuery: vi.fn(),
      results: [],
      isLoading: false,
      error: null,
      isVisible: false,
      setIsVisible: vi.fn(),
    };
  });

  describe('Rendering', () => {
    it('renders search input field', () => {
      render(<ProductSearch />);
      
      const searchInput = screen.getByPlaceholderText(/buscar productos/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('has proper accessibility label', () => {
      render(<ProductSearch />);
      
      const searchInput = screen.getByLabelText(/buscar productos/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Search Input', () => {
    it('calls setQuery when typing', async () => {
      const user = userEvent.setup();
      render(<ProductSearch />);
      
      const searchInput = screen.getByPlaceholderText(/buscar productos/i);
      await user.type(searchInput, 'laptop');
      
      expect(mockHookValues.setQuery).toHaveBeenCalled();
    });

    it('calls setIsVisible when query length changes', async () => {
      const user = userEvent.setup();
      render(<ProductSearch />);
      
      const searchInput = screen.getByPlaceholderText(/buscar productos/i);
      await user.type(searchInput, 'la');
      
      // setIsVisible gets called for each character typed
      expect(mockHookValues.setIsVisible).toHaveBeenCalled();
    });

    it('calls setIsVisible(false) when query < 2 characters', async () => {
      const user = userEvent.setup();
      render(<ProductSearch />);
      
      const searchInput = screen.getByPlaceholderText(/buscar productos/i);
      await user.type(searchInput, 'a');
      
      expect(mockHookValues.setIsVisible).toHaveBeenCalledWith(false);
    });
  });

  describe('Results Visibility', () => {
    it('shows results panel when isVisible is true', () => {
      mockHookValues.isVisible = true;
      mockHookValues.query = 'laptop';

      render(<ProductSearch />);
      
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
    });

    it('hides results panel when isVisible is false', () => {
      mockHookValues.isVisible = false;
      
      render(<ProductSearch />);
      
      expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
    });
  });

  describe('Focus Behavior', () => {
    it('shows results on focus if query >= 2 characters', async () => {
      mockHookValues.query = 'laptop';
      
      const user = userEvent.setup();
      render(<ProductSearch />);
      
      const searchInput = screen.getByPlaceholderText(/buscar productos/i);
      await user.click(searchInput);
      
      expect(mockHookValues.setIsVisible).toHaveBeenCalledWith(true);
    });

    it('does not show results on focus if query < 2 characters', async () => {
      mockHookValues.query = 'a';
      
      const user = userEvent.setup();
      render(<ProductSearch />);
      
      const searchInput = screen.getByPlaceholderText(/buscar productos/i);
      await user.click(searchInput);
      
      expect(mockHookValues.setIsVisible).not.toHaveBeenCalledWith(true);
    });
  });

  describe('Click Outside', () => {
    it('hides results when clicking outside search area', async () => {
      mockHookValues.isVisible = true;
      mockHookValues.query = 'laptop';

      render(
        <div>
          <ProductSearch />
          <div data-testid="outside-element">Outside</div>
        </div>
      );
      
      const outsideElement = screen.getByTestId('outside-element');
      fireEvent.mouseDown(outsideElement);
      
      expect(mockHookValues.setIsVisible).toHaveBeenCalledWith(false);
    });

    it('does not hide results when clicking inside search area', async () => {
      mockHookValues.isVisible = true;
      
      render(<ProductSearch />);
      
      const searchInput = screen.getByPlaceholderText(/buscar productos/i);
      fireEvent.mouseDown(searchInput);
      
      // Should NOT call setIsVisible at all from mousedown inside
      const callsToFalse = (mockHookValues.setIsVisible as any).mock.calls.filter(
        (call: any[]) => call[0] === false
      );
      expect(callsToFalse.length).toBe(0);
    });
  });
});

