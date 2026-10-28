'use client';

import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'indigo';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, { badge: string; dot: string }> = {
  success: {
    badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200/60',
    dot: 'bg-emerald-500',
  },
  warning: {
    badge: 'bg-amber-100 text-amber-700 border border-amber-200/60',
    dot: 'bg-amber-500',
  },
  error: {
    badge: 'bg-red-100 text-red-700 border border-red-200/60',
    dot: 'bg-red-500',
  },
  info: {
    badge: 'bg-blue-100 text-blue-700 border border-blue-200/60',
    dot: 'bg-blue-500',
  },
  neutral: {
    badge: 'bg-slate-100 text-slate-600 border border-slate-200/80',
    dot: 'bg-slate-400',
  },
  indigo: {
    badge: 'bg-indigo-100 text-indigo-700 border border-indigo-200/60',
    dot: 'bg-indigo-500',
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs font-medium px-2.5 py-1',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  className = '',
  ...rest
}) => {
  const currentVariant = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium select-none transition-colors ${currentVariant.badge} ${sizeStyles[size]} ${className}`}
      {...rest}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${currentVariant.dot}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
