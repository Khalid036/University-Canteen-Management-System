import React from 'react';
import { cn } from '../../lib/utils';

export const NeoBadge = ({ children, className, variant = 'yellow', size = 'md' }) => {
  const variants = {
    yellow: 'bg-neo-yellow text-black',
    pink: 'bg-neo-pink text-black',
    green: 'bg-neo-green text-black',
    blue: 'bg-neo-blue text-black',
    purple: 'bg-neo-purple text-black',
    orange: 'bg-neo-orange text-black',
    red: 'bg-neo-red text-white',
    dark: 'bg-black text-white',
    white: 'bg-white text-black',
    muted: 'bg-neo-muted text-black'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs tracking-wider',
    lg: 'px-3 py-1.5 text-sm tracking-wide'
  };

  return (
    <span
      className={cn(
        'neo-badge inline-flex items-center gap-1 border-2 border-black font-extrabold select-none',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};
