'use client';

import React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'loading-sm',
  md: 'loading-md',
  lg: 'loading-lg',
};

export function Spinner({
  size = 'md',
  className = '',
  label = 'Loading',
}: SpinnerProps) {
  return (
    <div role="status" className={`flex items-center gap-2 ${className}`}>
      <span
        className={`loading loading-spinner ${sizeClasses[size]}`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
