import React from 'react';
import { cn } from '../../lib/utils';

export const NeoButton = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}, ref) => {
  const variants = {
    primary: 'bg-neo-yellow text-black hover:bg-yellow-300',
    secondary: 'bg-white text-black hover:bg-gray-50',
    pink: 'bg-neo-pink text-black hover:bg-pink-400',
    green: 'bg-neo-green text-black hover:bg-emerald-400',
    blue: 'bg-neo-blue text-black hover:bg-cyan-300',
    purple: 'bg-neo-purple text-black hover:bg-purple-300',
    destructive: 'bg-neo-red text-white hover:bg-red-600',
    dark: 'bg-black text-white hover:bg-neutral-800',
    outline: 'bg-transparent text-black hover:bg-black/5'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-bold',
    md: 'px-4 py-2 text-sm font-bold',
    lg: 'px-6 py-3 text-base font-extrabold',
    icon: 'p-2'
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'neo-btn inline-flex items-center justify-center gap-2 rounded-none transition-transform select-none cursor-pointer',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed transform-none hover:transform-none hover:shadow-[4px_4px_0px_0px_#000]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
NeoButton.displayName = 'NeoButton';
