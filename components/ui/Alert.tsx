'use client';

import React from 'react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  type?: AlertType;
  message?: string;
  title?: string;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
}

const alertConfig: Record<
  AlertType,
  {
    container: string;
    iconColor: string;
    closeColor: string;
    icon: React.ReactNode;
  }
> = {
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    iconColor: 'text-emerald-500',
    closeColor: 'text-emerald-600 hover:bg-emerald-100 hover:text-emerald-800',
    icon: (
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-900',
    iconColor: 'text-red-500',
    closeColor: 'text-red-600 hover:bg-red-100 hover:text-red-800',
    icon: (
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-900',
    iconColor: 'text-amber-500',
    closeColor: 'text-amber-600 hover:bg-amber-100 hover:text-amber-800',
    icon: (
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    ),
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-900',
    iconColor: 'text-blue-500',
    closeColor: 'text-blue-600 hover:bg-blue-100 hover:text-blue-800',
    icon: (
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
        />
      </svg>
    ),
  },
};

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  message,
  title,
  onClose,
  children,
  className = '',
}) => {
  const config = alertConfig[type];

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 rounded-xl border p-4 shadow-sm transition-all duration-200 animate-fadeIn ${config.container} ${className}`}
    >
      <div className={`${config.iconColor} mt-0.5`}>{config.icon}</div>

      <div className="flex-1 text-sm">
        {title && <h4 className="font-semibold text-slate-900 mb-0.5">{title}</h4>}
        {message && <div className="leading-relaxed">{message}</div>}
        {children && <div className="leading-relaxed mt-1">{children}</div>}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={`-mr-1 -mt-1 rounded-lg p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${config.closeColor}`}
          aria-label="Cerrar alerta"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;
