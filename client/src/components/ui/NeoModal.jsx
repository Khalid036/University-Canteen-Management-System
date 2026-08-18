import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { NeoButton } from './NeoButton';

export const NeoModal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
  className
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div
        className={cn(
          'relative w-full bg-white border-4 border-black shadow-neo-xl z-10 max-h-[90vh] flex flex-col',
          maxWidth,
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-3 border-black bg-neo-yellow p-4">
          <h3 className="font-black text-xl uppercase tracking-tight text-black flex items-center gap-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 bg-white border-2 border-black shadow-neo-sm hover:bg-neo-red hover:text-white transition-colors"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};
