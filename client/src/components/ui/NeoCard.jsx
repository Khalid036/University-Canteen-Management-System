import React from 'react';
import { cn } from '../../lib/utils';

export const NeoCard = ({ children, className, color = 'bg-white', hoverEffect = false, ...props }) => {
  return (
    <div
      className={cn(
        'neo-card p-5 transition-transform',
        color,
        hoverEffect && 'hover:-translate-x-1 hover:-translate-y-1 hover:shadow-neo-lg duration-150',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const NeoCardHeader = ({ children, className }) => (
  <div className={cn('mb-4 pb-3 border-b-2 border-black flex items-center justify-between', className)}>
    {children}
  </div>
);

export const NeoCardTitle = ({ children, className }) => (
  <h3 className={cn('font-extrabold text-xl tracking-tight uppercase', className)}>
    {children}
  </h3>
);
