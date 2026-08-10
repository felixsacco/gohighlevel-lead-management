'use client';

import React from 'react';

const sizeClasses: Record<string, string> = {
  main: 'max-w-[var(--container-main)] mx-auto',
  wide: 'max-w-[var(--container-wide)] mx-auto',
  narrow: 'max-w-[var(--container-narrow)] mx-auto',
  content: 'max-w-[var(--container-content)] mx-auto',
};

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'main' | 'wide' | 'narrow' | 'content';
  className?: string;
  children?: React.ReactNode;
}

export function Container({
  className = '',
  size = 'main',
  ...props
}: ContainerProps) {
  return (
    <div
      className={`w-full px-[var(--container-padding-x)] sm:px-[var(--container-padding-x-sm)] relative z-10 ${sizeClasses[size]} ${className}`.trim()}
      data-ds="container"
      {...props}
    />
  );
}

export default Container;
