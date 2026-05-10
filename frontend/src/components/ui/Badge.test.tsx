import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  describe('variant classes', () => {
    it('renders with success variant → badge-success', () => {
      render(<Badge variant="success">Active</Badge>);
      expect(screen.getByText('Active')).toHaveClass('badge-success');
    });

    it('renders with warning variant → badge-warning', () => {
      render(<Badge variant="warning">Pending</Badge>);
      expect(screen.getByText('Pending')).toHaveClass('badge-warning');
    });

    it('renders with error variant → badge-error', () => {
      render(<Badge variant="error">Failed</Badge>);
      expect(screen.getByText('Failed')).toHaveClass('badge-error');
    });

    it('renders with info variant → badge-info', () => {
      render(<Badge variant="info">Info</Badge>);
      expect(screen.getByText('Info')).toHaveClass('badge-info');
    });

    it('renders with neutral variant (default) → badge-ghost', () => {
      render(<Badge>Default</Badge>);
      expect(screen.getByText('Default')).toHaveClass('badge-ghost');
    });
  });

  describe('content', () => {
    it('renders children text', () => {
      render(<Badge variant="success">Completed</Badge>);
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('applies base class badge', () => {
      render(<Badge>Test</Badge>);
      expect(screen.getByText('Test')).toHaveClass('badge');
    });
  });
});
