import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from './Toast';

// Helper component that uses the toast hook inside the provider
function ToastTrigger({
  type,
  duration,
}: {
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}) {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast('Test message', type, duration)}>
      Show Toast
    </button>
  );
}

describe('Toast', () => {
  it('renders children within provider', () => {
    render(
      <ToastProvider>
        <div data-testid="child">Child content</div>
      </ToastProvider>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('shows success toast with alert alert-success classes when showToast called', async () => {
    render(
      <ToastProvider>
        <ToastTrigger type="success" />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: /show toast/i }));
    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('alert');
    expect(toast).toHaveClass('alert-success');
    expect(toast).toHaveTextContent('Test message');
  });

  it('shows error toast with alert alert-error classes', async () => {
    render(
      <ToastProvider>
        <ToastTrigger type="error" />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: /show toast/i }));
    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('alert-error');
  });

  it('shows warning toast with alert alert-warning classes', async () => {
    render(
      <ToastProvider>
        <ToastTrigger type="warning" />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: /show toast/i }));
    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('alert-warning');
  });

  it('shows info toast with alert alert-info classes', async () => {
    render(
      <ToastProvider>
        <ToastTrigger type="info" />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: /show toast/i }));
    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('alert-info');
  });

  it('toast container has role="region" and aria-live="polite"', async () => {
    render(
      <ToastProvider>
        <ToastTrigger type="success" />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: /show toast/i }));
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-live', 'polite');
  });

  it('individual toasts have role="alert"', async () => {
    render(
      <ToastProvider>
        <ToastTrigger type="success" />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: /show toast/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('dismiss button removes toast when clicked', async () => {
    render(
      <ToastProvider>
        <ToastTrigger type="info" />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: /show toast/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    const dismissBtn = screen.getByRole('button', { name: /dismiss notification/i });
    await userEvent.click(dismissBtn);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  describe('timer behavior', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('success toast auto-dismisses after 5 seconds', () => {
      render(
        <ToastProvider>
          <ToastTrigger type="success" />
        </ToastProvider>,
      );
      // Direct DOM click to avoid userEvent's internal setTimeout (mocked by fake timers)
      act(() => {
        screen.getByRole('button', { name: /show toast/i }).click();
      });
      expect(screen.getByRole('alert')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('error toast stays (no auto-dismiss — duration 0 means persistent)', () => {
      render(
        <ToastProvider>
          <ToastTrigger type="error" />
        </ToastProvider>,
      );
      act(() => {
        screen.getByRole('button', { name: /show toast/i }).click();
      });
      expect(screen.getByRole('alert')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('throws error when useToast used outside ToastProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    function BrokenComponent() {
      useToast();
      return null;
    }

    expect(() => render(<BrokenComponent />)).toThrow(
      'useToast must be used within a ToastProvider',
    );

    consoleError.mockRestore();
  });
});
