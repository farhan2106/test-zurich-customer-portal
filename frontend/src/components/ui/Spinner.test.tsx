import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with role="status"', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has sr-only span with label text for accessibility', () => {
    render(<Spinner label="Fetching data" />);
    expect(screen.getByText('Fetching data')).toHaveClass('sr-only');
  });

  describe('size classes', () => {
    it('renders size sm → loading-sm class', () => {
      render(<Spinner size="sm" />);
      const spinner = screen.getByRole('status').querySelector('span.loading');
      expect(spinner).toHaveClass('loading-sm');
    });

    it('renders size md → loading-md class', () => {
      render(<Spinner size="md" />);
      const spinner = screen.getByRole('status').querySelector('span.loading');
      expect(spinner).toHaveClass('loading-md');
    });

    it('renders size lg → loading-lg class', () => {
      render(<Spinner size="lg" />);
      const spinner = screen.getByRole('status').querySelector('span.loading');
      expect(spinner).toHaveClass('loading-lg');
    });
  });

  it('applies base classes loading loading-spinner', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status').querySelector('span.loading');
    expect(spinner).toHaveClass('loading');
    expect(spinner).toHaveClass('loading-spinner');
  });
});
