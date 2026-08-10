'use client';

import React from 'react';

type SectionElement = 'section' | 'div' | 'footer';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: SectionElement;
  size?: 'default' | 'large';
  className?: string;
  children?: React.ReactNode;
}

export function Section({
  className = '',
  size = 'default',
  as: Comp = 'section',
  ...props
}: SectionProps) {
  const paddingClass =
    size === 'default' ? 'py-[var(--space-6)]' : 'py-[var(--section-padding-y-lg)]';
  return (
    <Comp
      className={`relative overflow-hidden ${paddingClass} ${className}`.trim()}
      data-ds="section"
      {...props}
    />
  );
}

export default Section;
