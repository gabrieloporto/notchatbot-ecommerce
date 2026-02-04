import { describe, it, expect } from 'vitest';
import { render, screen } from '../../setup/test-utils';
import ChatMessage from '@/app/components/ChatMessage';
import type { ChatMessage as ChatMessageType } from '@/app/context/ChatContext';

describe('ChatMessage Component', () => {
  const userMessage: ChatMessageType = {
    role: 'user',
    content: 'Hello, how can I buy products?',
    timestamp: '2024-01-01T12:00:00Z',
  };

  const assistantMessage: ChatMessageType = {
    role: 'assistant',
    content: 'Hello! I can help you find products.',
    timestamp: '2024-01-01T12:01:00Z',
  };

  const assistantWithProducts: ChatMessageType = {
    role: 'assistant',
    content: 'Here are some products:',
    timestamp: '2024-01-01T12:02:00Z',
    products: [
      {
        id: 1,
        name: 'Test Product',
        price: 10000,
        stock: 5,
        category: 'Test',
        image: '/test-image.jpg',
      },
    ],
  };

  describe('Rendering', () => {
    it('renders user message', () => {
      render(<ChatMessage message={userMessage} />);
      
      expect(screen.getByText(userMessage.content)).toBeInTheDocument();
    });

    it('renders assistant message', () => {
      render(<ChatMessage message={assistantMessage} />);
      
      expect(screen.getByText(assistantMessage.content)).toBeInTheDocument();
    });

    it('displays timestamp', () => {
      render(<ChatMessage message={userMessage} />);
      
      // Should show time (format may vary based on locale)
      const timestampElement = screen.getByText(/\d{1,2}:\d{2}/);
      expect(timestampElement).toBeInTheDocument();
    });

    it('shows user avatar for user messages', () => {
      const { container } = render(<ChatMessage message={userMessage} />);
      
      // User messages have a specific avatar
      const avatar = container.querySelector('.bg-black');
      expect(avatar).toBeInTheDocument();
    });

    it('shows bot avatar for assistant messages', () => {
      const { container } = render(<ChatMessage message={assistantMessage} />);
      
      // Assistant messages have a different avatar style
      const avatar = container.querySelector('.bg-gray-200');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Message Content', () => {
    it('preserves whitespace and line breaks', () => {
      const multilineMessage: ChatMessageType = {
        role: 'user',
        content: 'Line 1\nLine 2\nLine 3',
        timestamp: '2024-01-01T12:00:00Z',
      };

      render(<ChatMessage message={multilineMessage} />);
      
      const content = screen.getByText(/Line 1/);
      expect(content).toHaveClass('whitespace-pre-wrap');
    });
  });

  describe('Product Cards', () => {
    it('renders product cards for assistant messages', () => {
      render(<ChatMessage message={assistantWithProducts} />);
      
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    it('does not render products for user messages', () => {
      const userWithProducts: ChatMessageType = {
        ...userMessage,
        products: [
          {
            id: 1,
            name: 'Should Not Appear',
            price: 10000,
            stock: 5,
            category: 'Test',
          },
        ],
      };

      render(<ChatMessage message={userWithProducts} />);
      
      expect(screen.queryByText('Should Not Appear')).not.toBeInTheDocument();
    });

    it('renders multiple product cards', () => {
      const messageWithMultiple: ChatMessageType = {
        role: 'assistant',
        content: 'Multiple products:',
        timestamp: '2024-01-01T12:00:00Z',
        products: [
          {
            id: 1,
            name: 'Product 1',
            price: 10000,
            stock: 5,
            category: 'Test',
          },
          {
            id: 2,
            name: 'Product 2',
            price: 20000,
            stock: 3,
            category: 'Test',
          },
        ],
      };

      render(<ChatMessage message={messageWithMultiple} />);
      
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });

    it('does not render products section when there are no products', () => {
      render(<ChatMessage message={assistantMessage} />);
      
      // Should not have product card container
      const { container } = render(<ChatMessage message={assistantMessage} />);
      expect(container.querySelector('.space-y-2')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies user styling to user messages', () => {
      const { container } = render(<ChatMessage message={userMessage} />);
      
      const messageBody = container.querySelector('.bg-black.text-white');
      expect(messageBody).toBeInTheDocument();
    });

    it('applies assistant styling to assistant messages', () => {
      const { container } = render(<ChatMessage message={assistantMessage} />);
      
      const messageBody = container.querySelector('.bg-white');
      expect(messageBody).toBeInTheDocument();
    });

    it('aligns user messages to the right', () => {
      const { container } = render(<ChatMessage message={userMessage} />);
      
      const messageContainer = container.firstChild;
      expect(messageContainer).toHaveClass('flex-row-reverse');
    });

    it('aligns assistant messages to the left', () => {
      const { container } = render(<ChatMessage message={assistantMessage} />);
      
      const messageContainer = container.firstChild;
      expect(messageContainer).toHaveClass('flex-row');
    });
  });
});
