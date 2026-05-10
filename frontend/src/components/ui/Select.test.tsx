import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

describe('Select', () => {
  const options = [
    { value: 'opt1', label: 'Option One' },
    { value: 'opt2', label: 'Option Two' },
    { value: 'opt3', label: 'Option Three' },
  ];

  it('renders all options from options array', () => {
    render(<Select label="Choose" name="choose" options={options} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Option One')).toBeInTheDocument();
    expect(screen.getByText('Option Two')).toBeInTheDocument();
    expect(screen.getByText('Option Three')).toBeInTheDocument();
  });

  it('renders placeholder as first disabled option', () => {
    render(<Select label="Choose" name="choose" options={options} placeholder="Pick one..." />);
    const select = screen.getByRole('combobox');
    const firstOption = select.querySelector('option[value=""]');
    expect(firstOption).toHaveTextContent('Pick one...');
    expect(firstOption).toBeDisabled();
  });

  it('calls onChange handler when selection changes', async () => {
    const onChange = jest.fn();
    render(<Select label="Choose" name="choose" options={options} onChange={onChange} />);
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'opt2');
    expect(onChange).toHaveBeenCalled();
  });

  it('shows error state with select-error class', () => {
    render(<Select label="Choose" name="choose" options={options} error="Selection required" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('select-error');
    expect(select).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders label with htmlFor association', () => {
    render(<Select label="Choose" name="choose" options={options} />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('id', 'choose');
    const label = document.querySelector('label[for="choose"]');
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent('Choose');
  });

  it('shows required indicator when required=true', () => {
    render(<Select label="Choose" name="choose" options={options} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
