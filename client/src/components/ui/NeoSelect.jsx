import React from 'react';
import { cn } from '../../lib/utils';

export const NeoSelect = React.forwardRef(({
  label,
  error,
  options = [],
  children,
  className,
  ...props
}, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-black uppercase tracking-wider text-black">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'w-full bg-white px-3.5 py-2.5 text-sm font-bold text-black cursor-pointer',
          'border-3 border-black shadow-neo-sm focus:shadow-neo focus:outline-none transition-all',
          error && 'border-neo-red bg-red-50',
          className
        )}
        {...props}
      >
        {children || options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
});
NeoSelect.displayName = 'NeoSelect';
