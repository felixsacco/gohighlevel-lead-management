"use client";

import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'hero' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  className?: string;
  glowEffect?: boolean;
  magneticEffect?: boolean;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  variant = 'default',
  size = 'default',
  children,
  className,
  glowEffect = false,
  magneticEffect = false,
  ...props
}) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magneticEffect || !buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    setMousePosition({ x: x * 0.1, y: y * 0.1 });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const baseClasses = cn(
    "relative overflow-hidden transition-all duration-300 ease-out",
    "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
    "before:translate-x-[-100%] before:transition-transform before:duration-700",
    "hover:before:translate-x-[100%]",
    glowEffect && [
      "shadow-lg hover:shadow-2xl",
      variant === 'hero' && "hover:shadow-yellow-400/25",
      variant === 'default' && "hover:shadow-blue-400/25"
    ],
    magneticEffect && "transform-gpu",
    className
  );

  const style = magneticEffect ? {
    transform: `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale(${isHovered ? 1.05 : 1})`,
  } : {};

  return (
    <Button
      ref={buttonRef}
      variant={variant as any}
      size={size as any}
      className={baseClasses}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
      
      {/* Ripple effect */}
      <span className="absolute inset-0 overflow-hidden rounded-inherit">
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] transition-transform duration-1000 ease-out hover:translate-x-[100%]" />
      </span>
    </Button>
  );
};