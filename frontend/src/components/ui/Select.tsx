'use client';

import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value'> {
  label: string;
  name: string;
  options: SelectOption[];
  error?: string;
  required?: boolean;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  className?: string;
  placeholder?: string;
}

export function Select({
  label,
  name,
  options,
  error,
  required = false,
  value,
  onChange,
  className = '',
  placeholder = 'Select an option...',
  id,
  ...rest
}: SelectProps) {
  const selectId = id || name;

  return (
    <div className={`form-control w-full ${className}`}>
      <label className="label" htmlFor={selectId}>
        <span className="label-text">
          {label}
          {required && <span className="text-error"> *</span>}
        </span>
      </label>
      <select
        id={selectId}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        className={`select select-bordered w-full ${error ? 'select-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...rest}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <label className="label">
          <span id={`${selectId}-error`} className="label-text-alt text-error" role="alert">
            {error}
          </span>
        </label>
      )}
    </div>
  );
}
