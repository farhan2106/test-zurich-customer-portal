import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders title content in h2.card-title', () => {
    render(<Card title="Card Title">Body content</Card>);
    const title = screen.getByRole('heading', { level: 2, name: /card title/i });
    expect(title).toHaveClass('card-title');
    expect(title).toHaveTextContent('Card Title');
  });

  it('renders subtitle content', () => {
    render(<Card title="Title" subtitle="This is a subtitle">Body</Card>);
    expect(screen.getByText('This is a subtitle')).toBeInTheDocument();
  });

  it('renders body children', () => {
    render(<Card title="Title"><p>Body paragraph</p></Card>);
    expect(screen.getByText('Body paragraph')).toBeInTheDocument();
  });

  it('renders footer content in card-actions', () => {
    render(<Card title="Title" footer={<button>Action</button>}>Body</Card>);
    const footer = screen.getByText('Action').closest('.card-actions');
    expect(footer).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
  });

  it('applies base class card and bg-base-100', () => {
    render(<Card title="Title">Body</Card>);
    const card = screen.getByText('Body').closest('.card');
    expect(card).toHaveClass('card');
    expect(card).toHaveClass('bg-base-100');
  });

  it('applies card-bordered class when bordered=true', () => {
    render(<Card title="Title" bordered>Body</Card>);
    const card = screen.getByText('Body').closest('.card');
    expect(card).toHaveClass('card-bordered');
  });

  it('does NOT apply card-bordered when bordered=false', () => {
    render(<Card title="Title" bordered={false}>Body</Card>);
    const card = screen.getByText('Body').closest('.card');
    expect(card).not.toHaveClass('card-bordered');
  });

  it('renders without title/subtitle section when neither provided', () => {
    render(<Card>Body only</Card>);
    const card = screen.getByText('Body only').closest('.card');
    const header = card?.querySelector('.card-header');
    expect(header).not.toBeInTheDocument();
  });
});
