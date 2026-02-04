import { describe, it, expect } from 'vitest';
import { render, screen } from '../../setup/test-utils';
import { ShippingBanner } from '@/app/components/ShippingBanner';

describe('ShippingBanner Component', () => {
  describe('Rendering', () => {
    it('renders the banner', () => {
      render(<ShippingBanner />);
      
      const banner = screen.getByText(/envío gratis/i);
      expect(banner).toBeInTheDocument();
    });

    it('displays shipping threshold information', () => {
      render(<ShippingBanner />);
      
      expect(screen.getByText(/100\.000/)).toBeInTheDocument();
    });

    it('has proper styling', () => {
      const { container } = render(<ShippingBanner />);
      
      const banner = container.firstChild;
      expect(banner).toHaveClass('bg-black');
      expect(banner).toHaveClass('text-white');
    });
  });
});
