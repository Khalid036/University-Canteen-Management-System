import React from 'react';
import { cn } from '../../lib/utils';

export const NeoInput = React.forwardRef(({
  label,
  error,
  helperText,
  className,
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-black uppercase tracking-wider text-black">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full bg-white px-3.5 py-2.5 text-sm font-bold text-black placeholder-neutral-500',
          'border-3 border-black shadow-neo-sm focus:shadow-neo focus:-translate-x-0.5 focus:-translate-y-0.5 focus:outline-none transition-all',
          error && 'border-neo-red bg-red-50',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-bold text-red-600 tracking-tight">{error}</p>}
      {helperText && !error && <p className="text-xs font-semibold text-neutral-600">{helperText}</p>}
    </div>
  );
});
NeoInput.displayName = 'NeoInput';
