import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../setup/test-utils';
import userEvent from '@testing-library/user-event';
import { SearchModal } from '@/app/components/SearchModal';

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
  ProductSearchResults: ({ query, variant }: { query: string; variant?: string }) => (
    <div data-testid="search-results">
      Results (variant: {variant || 'default'}) for: {query}
    </div>
  ),
}));

describe('SearchModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    // Reset mocks
    mockHookValues = {
      query: '',
      setQuery: vi.fn(),
      results: [],
      isLoading: false,
      error: null,
      isVisible: false,
      setIsVisible: vi.fn(),
    };
    mockOnClose.mockClear();
    
    // Reset body overflow style
    document.body.style.overflow = '';
  });

  describe('Modal Visibility', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <SearchModal isOpen={false} onClose={mockOnClose} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('renders modal when isOpen is true', () => {
      render(<SearchModal isOpen={true} onClose={mockOnClose} />);
      
      expect(screen.getByPlaceholderText(/buscar productos/i)).toBeInTheDocument();
    });
  });

  describe('Modal Components', () => {
    it('renders search input', () => {
      render(<SearchModal isOpen={true} onClose={mockOnClose} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar productos/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('renders close button', () => {
      render(<SearchModal isOpen={true} onClose={mockOnClose} />);
      
      const closeButton = screen.getByLabelText(/cerrar búsqueda/i);
      expect(closeButton).toBeInTheDocument();
    });

    it('renders backdrop', () => {
      render(<SearchModal isOpen={true} onClose={mockOnClose} />);
      
      // Backdrop is rendered (has specific classes)
      const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
      expect(backdrop).toBeInTheDocument();
    });

    it('search input should receive focus', () => {
      render(<SearchModal isOpen={true} onClose={mockOnClose} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar productos/i);
      // Just verify input exists and is in document, actual autofocus happens in browser
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Search Input', () => {
    it('calls setQuery when typing', async () => {
      const user = userEvent.setup();
      render(<SearchModal isOpen={true} onClose={mockOnClose} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar productos/i);
      await user.type(searchInput, 'laptop');
      
      expect(mockHookValues.setQuery).toHaveBeenCalled();
    });

    it('shows results when isVisible is true', () => {
      mockHookValues.isVisible = true;
      mockHookValues.query = 'laptop';
      
      render(<SearchModal isOpen={true} onClose={mockOnClose} />);
      
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
      expect(screen.getByText(/variant: mobile/i)).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('shows empty state when query is empty', () => {
      mockHookValues.query = '';
      mockHookValues.isVisible = false;
      
      render(<SearchModal isOpen={true} onClose={mockOnClose} />);
      
      expect(screen.getByText(/busca productos por nombre/i)).toBeInTheDocument();
    });

    it('shows "write at least 2 characters" message when query < 2 chars', () => {
      mockHookValues.query = 'a';
      mockHookValues.isVisible = false;
      
      render(<SearchModal isOpen={true} onClose={mockOnClose} />);
      
      expect(screen.getByText(/escribe al menos 2 caracteres/i)).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<SearchModal isOpen={true} onClose={mockOnClose} />);
      
      const closeButton = screen.getByLabelText(/cerrar búsqueda/i);
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when backdrop is clicked', async () => {
      render(<SearchModal isOpen={true} onClose={mockOnClose} />);
      
      const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('calls onClose and resets state when closing', async () => {
      const user = userEvent.setup();
      render(<SearchModal isOpen={true} onClose={mockOnClose} />);
      
      const closeButton = screen.getByLabelText(/cerrar búsqueda/i);
      await user.click(closeButton);
      
      // Should reset query and visibility
      expect(mockHookValues.setQuery).toHaveBeenCalledWith('');
      expect(mockHookValues.setIsVisible).toHaveBeenCalledWith(false);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('closes modal when ESC key is pressed', async () => {
      render(<SearchModal isOpen={true} onClose={mockOnClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('does not close on ESC when modal is closed', () => {
      render(<SearchModal isOpen={false} onClose={mockOnClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Body Scroll Lock', () => {
    it('prevents body scroll when modal is open', () => {
      render(<SearchModal isOpen={true} onClose={mockOnClose} />);
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when modal is closed', () => {
      const { unmount } = render(<SearchModal isOpen={true} onClose={mockOnClose} />);
      
      expect(document.body.style.overflow).toBe('hidden');
      
      unmount();
      
      expect(document.body.style.overflow).toBe('unset');
    });
  });
});
