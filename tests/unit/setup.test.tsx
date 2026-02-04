import { describe, it, expect } from 'vitest';
import { render, screen } from '../setup/test-utils';

// Simple component for testing setup
function HelloWorld() {
  return <div>Hello World</div>;
}

describe('Testing Setup', () => {
  it('renders hello world', () => {
    render(<HelloWorld />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('can perform basic assertions', () => {
    expect(1 + 1).toBe(2);
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
  });
});
