'use client';

import React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerColor = 'indigo' | 'white' | 'slate';

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  text?: string;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const colorClasses: Record<SpinnerColor, string> = {
  indigo: 'text-indigo-600',
  white: 'text-white',
  slate: 'text-slate-500',
};

const textSizeClasses: Record<SpinnerSize, string> = {
  sm: 'text-xs text-slate-500',
  md: 'text-sm text-slate-600 font-medium',
  lg: 'text-base text-slate-600 font-medium',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'indigo',
  text,
  className = '',
}) => {
  return (
    <div
      role="status"
      className={`inline-flex flex-col items-center justify-center gap-2 ${className}`}
    >
      <svg
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && <span className={textSizeClasses[size]}>{text}</span>}
      <span className="sr-only">{text || 'Cargando...'}</span>
    </div>
  );
};

export interface LoadingPageProps {
  text?: string;
  description?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  text = 'Cargando datos...',
  description = 'Por favor espera un momento mientras preparamos la información.',
}) => {
  return (
    <div className="min-h-[50vh] w-full flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
      <div className="relative mb-4">
        <LoadingSpinner size="lg" color="indigo" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{text}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
