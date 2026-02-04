import { describe, it, expect } from 'vitest';
import { render } from '../../setup/test-utils';
import TypingIndicator from '@/app/components/TypingIndicator';

describe('TypingIndicator Component', () => {
  it('renders the component', () => {
    const { container } = render(<TypingIndicator />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays three animated dots', () => {
    const { container } = render(<TypingIndicator />);
    const dots = container.querySelectorAll('.animate-bounce');
    expect(dots).toHaveLength(3);
  });

  it('applies different animation delays', () => {
    const { container } = render(<TypingIndicator />);
    const dots = container.querySelectorAll('.animate-bounce');
    
    expect(dots[0]).toHaveStyle({ animationDelay: '0ms' });
    expect(dots[1]).toHaveStyle({ animationDelay: '150ms' });
    expect(dots[2]).toHaveStyle({ animationDelay: '300ms' });
  });
});
