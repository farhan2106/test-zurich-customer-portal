'use client';

import React from 'react';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  className?: string;
}

export function Input({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  helperText,
  required = false,
  value,
  onChange,
  className = '',
  id,
  ...rest
}: InputProps) {
  const inputId = id || name;

  return (
    <div className={`form-control w-full ${className}`}>
      <label className="label" htmlFor={inputId}>
        <span className="label-text">
          {label}
          {required && <span className="text-error"> *</span>}
        </span>
      </label>
      <input
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...rest}
      />
      <label className="label">
        {error ? (
          <span id={`${inputId}-error`} className="label-text-alt text-error" role="alert">
            {error}
          </span>
        ) : helperText ? (
          <span id={`${inputId}-helper`} className="label-text-alt">
            {helperText}
          </span>
        ) : null}
      </label>
    </div>
  );
}
