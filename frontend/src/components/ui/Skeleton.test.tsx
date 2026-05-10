import { render } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  describe('text variant', () => {
    it('renders multiple skeleton lines (default 3)', () => {
      const { container } = render(<Skeleton variant="text" />);
      const lines = container.querySelectorAll('.skeleton');
      expect(lines.length).toBe(3);
    });

    it('last line is shorter (70% width)', () => {
      const { container } = render(<Skeleton variant="text" />);
      const lines = container.querySelectorAll('.skeleton');
      const lastLine = lines[lines.length - 1];
      expect(lastLine).toHaveStyle({ width: '70%' });
    });
  });

  describe('card variant', () => {
    it('renders card structure with avatar skeleton + text skeleton lines', () => {
      const { container } = render(<Skeleton variant="card" />);
      const card = container.querySelector('.card');
      expect(card).toBeInTheDocument();
      const avatarSkeleton = card?.querySelector('.rounded-full.skeleton');
      expect(avatarSkeleton).toBeInTheDocument();
      const textSkeletons = card?.querySelectorAll('.space-y-2 .skeleton');
      expect(textSkeletons?.length).toBeGreaterThan(0);
    });
  });

  describe('avatar variant', () => {
    it('renders with rounded-full class, default 48px x 48px', () => {
      const { container } = render(<Skeleton variant="avatar" />);
      const avatar = container.querySelector('[aria-hidden="true"].rounded-full');
      expect(avatar).toHaveClass('rounded-full');
      expect(avatar).toHaveStyle({ width: '48px', height: '48px' });
    });
  });

  describe('rectangle variant', () => {
    it('renders single skeleton div with configurable width/height', () => {
      const { container } = render(<Skeleton variant="rectangle" width="200px" height="100px" />);
      const rect = container.querySelector('[aria-hidden="true"].skeleton');
      expect(rect).toHaveStyle({ width: '200px', height: '100px' });
    });
  });

  it('applies skeleton base class', () => {
    const { container } = render(<Skeleton variant="text" />);
    const firstLine = container.querySelector('.skeleton');
    expect(firstLine).toHaveClass('skeleton');
  });

  it('renders with aria-hidden="true"', () => {
    const { container } = render(<Skeleton variant="text" />);
    const wrapper = container.querySelector('[aria-hidden="true"]');
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
  });
});
