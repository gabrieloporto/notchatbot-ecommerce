import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../setup/test-utils';
import { MobileNav } from '@/app/components/MobileNav';

// Mock useSearchParams
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null }),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}));

describe('MobileNav Component', () => {
  it('renders menu trigger button', () => {
    render(<MobileNav />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has accessibility label', () => {
    render(<MobileNav />);
    expect(screen.getByText('Toggle menu')).toBeInTheDocument();
  });

  it('renders hamburger icon', () => {
    const { container } = render(<MobileNav />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
