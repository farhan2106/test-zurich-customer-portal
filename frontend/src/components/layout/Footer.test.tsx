import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders copyright text containing "© 2026 Zurich Insurance"', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2026 Zurich Insurance/)).toBeInTheDocument();
  });

  it('applies footer footer-center classes', () => {
    render(<Footer />);
    const footer = screen.getByText(/© 2026 Zurich Insurance/).closest('footer');
    expect(footer).toHaveClass('footer');
    expect(footer).toHaveClass('footer-center');
  });

  it('has centered text (via footer-center implicit)', () => {
    render(<Footer />);
    const footer = screen.getByText(/© 2026 Zurich Insurance/).closest('footer');
    expect(footer).toHaveClass('footer-center');
  });
});
