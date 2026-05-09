'use client';

import React from 'react';

export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hoverable?: boolean;
  bordered?: boolean;
  className?: string;
}

export function Card({
  title,
  subtitle,
  children,
  footer,
  hoverable = false,
  bordered = false,
  className = '',
}: CardProps) {
  const cardClasses = [
    'card',
    'bg-base-100',
    hoverable ? 'shadow-xl hover:shadow-2xl transition-shadow duration-200' : 'shadow-xl',
    bordered ? 'card-bordered' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses}>
      <div className="card-body">
        {(title || subtitle) && (
          <div className="card-header">
            {title && (
              <h2 className="card-title">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-base-content/60">{subtitle}</p>
            )}
          </div>
        )}
        {children}
        {footer && (
          <div className="card-actions">{footer}</div>
        )}
      </div>
    </div>
  );
}
