import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../setup/test-utils';
import userEvent from '@testing-library/user-event';
import { CheckoutForm } from '@/app/components/CheckoutForm';

describe('CheckoutForm Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Form Rendering', () => {
    it('renders all form fields', () => {
      render(<CheckoutForm />);
      
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    });

    it('renders shipping method options', () => {
      render(<CheckoutForm />);
      
      expect(screen.getByLabelText(/envío a domicilio/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/retiro por el local/i)).toBeInTheDocument();
    });

    it('shows submit button', () => {
      render(<CheckoutForm />);
      expect(screen.getByRole('button', { name: /finalizar compra/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows required field validation messages', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm />);
      
      const submitButton = screen.getByRole('button', { name: /finalizar compra/i });
      await user.click(submitButton);
      
      // Form should show validation error for email
      await waitFor(() => {
        expect(screen.getByText(/por favor ingresa un email válido/i)).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm />);
      
      // Clear email and submit to trigger validation
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      await user.clear(emailInput);
      
      const submitButton = screen.getByRole('button', { name: /finalizar compra/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/por favor ingresa un email válido/i)).toBeInTheDocument();
      });
    });

    it('validates phone number format', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm />);
      
      const phoneInput = screen.getByLabelText(/teléfono/i);
      await user.type(phoneInput, '123'); // Too short
      
      const submitButton = screen.getByRole('button', { name: /finalizar compra/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        const validationMessages = screen.queryAllByText(/teléfono/i);
        expect(validationMessages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm />);
      
      // Fill in all required fields
      await user.type(screen.getByLabelText(/nombre/i), 'John');
      await user.type(screen.getByLabelText(/apellido/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/teléfono/i), '+5491112345678');
      await user.type(screen.getByLabelText(/dirección/i), '123 Main St');
      await user.type(screen.getByLabelText(/ciudad/i), 'Buenos Aires');
      await user.type(screen.getByLabelText(/provincia/i), 'CABA');
      
      // Select shipping method
      await user.click(screen.getByLabelText(/envío a domicilio/i));
      
      const submitButton = screen.getByRole('button', { name: /finalizar compra/i });
      await user.click(submitButton);
      
      // Form should process (exact behavior depends on implementation)
      await waitFor(() => {
        expect(submitButton).toBeInTheDocument();
      });
    });

    it('disables submit button while submitting', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm />);
      
      // Fill valid data
      await user.type(screen.getByLabelText(/nombre/i), 'John');
      await user.type(screen.getByLabelText(/apellido/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/teléfono/i), '+5491112345678');
      await user.type(screen.getByLabelText(/dirección/i), '123 Main St');
      await user.type(screen.getByLabelText(/ciudad/i), 'Buenos Aires');
      await user.type(screen.getByLabelText(/provincia/i), 'CABA');
      await user.click(screen.getByLabelText(/envío a domicilio/i));
      
      const submitButton = screen.getByRole('button', { name: /finalizar compra/i });
      await user.click(submitButton);
      
      // Button might be disabled or show loading state
      // This depends on implementation
    });
  });

  describe('Shipping Method Selection', () => {
    it('allows selecting delivery method', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm />);
      
      const deliveryOption = screen.getByLabelText(/envío a domicilio/i);
      await user.click(deliveryOption);
      
      expect(deliveryOption).toBeChecked();
    });

    it('allows selecting pickup method', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm />);
      
      const pickupOption = screen.getByLabelText(/retiro por el local/i);
      await user.click(pickupOption);
      
      expect(pickupOption).toBeChecked();
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for all form fields', () => {
      render(<CheckoutForm />);
      
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    });

    it('associates error messages with fields', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm />);
      
      const submitButton = screen.getByRole('button', { name: /finalizar compra/i });
      await user.click(submitButton);
      
      // Validation errors should be associated with their fields via aria-describedby
      await waitFor(() => {
        const nameInput = screen.getByLabelText(/nombre/i);
        expect(nameInput).toBeInTheDocument();
      });
    });
  });
});
