import React from 'react';
import { NeoBadge } from '../ui/NeoBadge';
import { STATUS_CONFIG } from '../../lib/utils';
import { Clock, ChefHat, CheckCircle2, CheckCheck, XCircle } from 'lucide-react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  const icons = {
    PENDING: <Clock size={12} strokeWidth={3} />,
    PREPARING: <ChefHat size={12} strokeWidth={3} />,
    READY: <CheckCircle2 size={12} strokeWidth={3} />,
    COMPLETED: <CheckCheck size={12} strokeWidth={3} />,
    CANCELLED: <XCircle size={12} strokeWidth={3} />
  };

  const variants = {
    PENDING: 'yellow',
    PREPARING: 'blue',
    READY: 'green',
    COMPLETED: 'muted',
    CANCELLED: 'red'
  };

  return (
    <NeoBadge variant={variants[status] || 'yellow'} size={size} className="gap-1.5">
      {icons[status]}
      <span>{config.label}</span>
    </NeoBadge>
  );
};
