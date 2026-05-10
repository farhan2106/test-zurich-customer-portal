import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  describe('variant classes', () => {
    it('renders with primary variant → className contains btn-primary', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-primary');
    });

    it('renders secondary variant → className contains btn-outline', () => {
      render(<Button variant="secondary">Click me</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-outline');
    });

    it('renders ghost variant → className contains btn-ghost', () => {
      render(<Button variant="ghost">Click me</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-ghost');
    });

    it('renders danger variant → className contains btn-error', () => {
      render(<Button variant="danger">Click me</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-error');
    });
  });

  describe('size classes', () => {
    it('renders size sm → className contains btn-sm', () => {
      render(<Button size="sm">Click me</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-sm');
    });

    it('renders size md → no size class (md is default, empty string)', () => {
      render(<Button size="md">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('btn-sm');
      expect(button).not.toHaveClass('btn-lg');
    });

    it('renders size lg → className contains btn-lg', () => {
      render(<Button size="lg">Click me</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-lg');
    });
  });

  describe('loading state', () => {
    it('shows spinner span with loading loading-spinner classes + aria-busy="true"', () => {
      render(<Button loading>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      const spinner = button.querySelector('span.loading');
      expect(spinner).toHaveClass('loading');
      expect(spinner).toHaveClass('loading-spinner');
    });

    it('is disabled when loading=true', () => {
      render(<Button loading>Click me</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('disabled state', () => {
    it('has disabled attribute when disabled=true', () => {
      render(<Button disabled>Click me</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('interactions', () => {
    it('fires onClick handler when clicked', async () => {
      const onClick = jest.fn();
      render(<Button onClick={onClick}>Click me</Button>);
      await userEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('content', () => {
    it('renders children text content', () => {
      render(<Button>Submit Form</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Submit Form');
    });

    it('base class btn always present', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn');
    });
  });
});
