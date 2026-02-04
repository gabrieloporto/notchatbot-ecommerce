import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { CartProvider } from '@/app/context/CartContext';
import { ChatProvider } from '@/app/context/ChatContext';

interface AllProvidersProps {
  children: React.ReactNode;
}

const AllProviders = ({ children }: AllProvidersProps) => {
  return (
    <CartProvider>
      <ChatProvider>
        {children}
      </ChatProvider>
    </CartProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
export { userEvent } from '@testing-library/user-event';
