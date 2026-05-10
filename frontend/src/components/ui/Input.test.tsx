import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renders label text with htmlFor/id association', () => {
    render(<Input label="Email Address" name="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'email');
    const label = document.querySelector('label[for="email"]');
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent('Email Address');
  });

  it('shows error message with input-error class + role="alert" + aria-invalid', () => {
    render(<Input label="Email" name="email" error="Email is required" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('input-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Email is required');
  });

  it('shows helper text (no error styling, no role="alert")', () => {
    render(<Input label="Email" name="email" helperText="We will never share your email" />);
    expect(screen.getByText('We will never share your email')).toBeInTheDocument();
    const input = screen.getByRole('textbox');
    expect(input).not.toHaveClass('input-error');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('fires onChange handler with input value', async () => {
    const onChange = jest.fn();
    render(<Input label="Name" name="name" value="" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'hello');
    expect(onChange).toHaveBeenCalled();
  });

  it('shows required indicator (*) when required=true', () => {
    render(<Input label="Email" name="email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders as type email', () => {
    render(<Input label="Email" name="email" type="email" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
  });

  it('renders as type date', () => {
    render(<Input label="Date" name="date" type="date" />);
    expect(screen.getByLabelText('Date')).toHaveAttribute('type', 'date');
  });

  it('uses name as id when id prop not provided', () => {
    render(<Input label="Username" name="username" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'username');
  });
});
