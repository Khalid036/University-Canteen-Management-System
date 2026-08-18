import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price);
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    bg: 'bg-neo-yellow',
    color: 'text-black',
    border: 'border-black',
    description: 'Order received and awaiting kitchen preparation'
  },
  PREPARING: {
    label: 'Preparing',
    bg: 'bg-neo-blue',
    color: 'text-black',
    border: 'border-black',
    description: 'Chef is cooking your meal right now'
  },
  READY: {
    label: 'Ready for Pickup',
    bg: 'bg-neo-green',
    color: 'text-black',
    border: 'border-black',
    description: 'Fresh and hot! Please collect at the counter'
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-neo-muted',
    color: 'text-black',
    border: 'border-black',
    description: 'Order collected and completed'
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-neo-red',
    color: 'text-white',
    border: 'border-black',
    description: 'Order has been cancelled'
  }
};
