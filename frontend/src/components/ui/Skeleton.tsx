'use client';

import React from 'react';

export type SkeletonVariant = 'text' | 'card' | 'avatar' | 'rectangle';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string;
  height?: string;
  className?: string;
  lines?: number;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  lines = 3,
}: SkeletonProps) {
  const baseClasses = 'skeleton';

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  if (variant === 'avatar') {
    return (
      <div
        className={`${baseClasses} rounded-full ${className}`}
        style={{ width: width || '48px', height: height || '48px', ...style }}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'card') {
    return (
      <div className={`card bg-base-100 shadow-xl ${className}`} aria-hidden="true">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <div className={`${baseClasses} rounded-full`} style={{ width: '48px', height: '48px' }} />
            <div className="flex-1 space-y-2">
              <div className={`${baseClasses}`} style={{ width: '40%', height: '16px' }} />
              <div className={`${baseClasses}`} style={{ width: '60%', height: '12px' }} />
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {Array.from({ length: lines }).map((_, i) => (
              <div
                key={i}
                className={baseClasses}
                style={{
                  width: i === lines - 1 ? '70%' : '100%',
                  height: '14px',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`} aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={baseClasses}
            style={{
              width: i === lines - 1 ? '70%' : '100%',
              height: height || '14px',
              ...style,
            }}
          />
        ))}
      </div>
    );
  }

  // rectangle
  return (
    <div
      className={`${baseClasses} ${className}`}
      style={{ width: width || '100%', height: height || '120px', ...style }}
      aria-hidden="true"
    />
  );
}
