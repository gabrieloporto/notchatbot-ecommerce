import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../setup/test-utils';
import userEvent from '@testing-library/user-event';
import ChatInput from '@/app/components/ChatInput';

describe('ChatInput Component', () => {
  const mockOnSend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders input field', () => {
      render(<ChatInput onSend={mockOnSend} />);
      
      const input = screen.getByPlaceholderText(/escribe un mensaje/i);
      expect(input).toBeInTheDocument();
    });

    it('renders send button', () => {
      render(<ChatInput onSend={mockOnSend} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('shows keyboard shortcut hint', () => {
      render(<ChatInput onSend={mockOnSend} />);
      
      expect(screen.getByText(/presiona/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('allows typing in the input', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);
      
      const input = screen.getByPlaceholderText(/escribe un mensaje/i);
      await user.type(input, 'Hello world');
      
      expect(input).toHaveValue('Hello world');
    });

    it('sends message on button click', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);
      
      const input = screen.getByPlaceholderText(/escribe un mensaje/i);
      const button = screen.getByRole('button');
      
      await user.type(input, 'Test message');
      await user.click(button);
      
      expect(mockOnSend).toHaveBeenCalledWith('Test message');
    });

    it('sends message on Enter key', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);
      
      const input = screen.getByPlaceholderText(/escribe un mensaje/i);
      
      await user.type(input, 'Test message{Enter}');
      
      expect(mockOnSend).toHaveBeenCalledWith('Test message');
    });

    it('does not send on Shift+Enter', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);
      
      const input = screen.getByPlaceholderText(/escribe un mensaje/i);
      
      await user.type(input, 'Line 1{Shift>}{Enter}{/Shift}Line 2');
      
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('clears input after sending', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);
      
      const input = screen.getByPlaceholderText(/escribe un mensaje/i) as HTMLTextAreaElement;
      const button = screen.getByRole('button');
      
      await user.type(input, 'Test');
      await user.click(button);
      
      expect(input.value).toBe('');
    });

    it('trims whitespace from message', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);
      
      const input = screen.getByPlaceholderText(/escribe un mensaje/i);
      const button = screen.getByRole('button');
      
      await user.type(input, '  Test message  ');
      await user.click(button);
      
      expect(mockOnSend).toHaveBeenCalledWith('Test message');
    });

    it('does not send empty messages', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);
      
      const input = screen.getByPlaceholderText(/escribe un mensaje/i);
      const button = screen.getByRole('button');
      
      await user.type(input, '   ');
      await user.click(button);
      
      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      render(<ChatInput onSend={mockOnSend} disabled={true} />);
      
      const input = screen.getByPlaceholderText(/escribe un mensaje/i);
      expect(input).toBeDisabled();
    });

    it('disables button when disabled prop is true', () => {
      render(<ChatInput onSend={mockOnSend} disabled={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('disables button when input is empty', () => {
      render(<ChatInput onSend={mockOnSend} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('enables button when input has text', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);
      
      const input = screen.getByPlaceholderText(/escribe un mensaje/i);
      const button = screen.getByRole('button');
      
      await user.type(input, 'Test');
      
      expect(button).toBeEnabled();
    });

    it('does not send when disabled', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} disabled={true} />);
      
      const input = screen.getByPlaceholderText(/escribe un mensaje/i);
      
      await user.type(input, 'Test{Enter}');
      
      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });
});
