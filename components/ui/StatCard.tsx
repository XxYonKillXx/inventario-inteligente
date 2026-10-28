'use client';

import React from 'react';

export type StatCardColor = 'indigo' | 'emerald' | 'amber' | 'red' | 'blue' | 'violet';
export type StatCardTrend = 'up' | 'down' | 'neutral';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: StatCardTrend;
  trendValue?: string;
  color?: StatCardColor;
  className?: string;
  onClick?: () => void;
}

const colorMap: Record<
  StatCardColor,
  {
    iconBg: string;
    iconColor: string;
  }
> = {
  indigo: {
    iconBg: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    iconColor: 'text-indigo-600',
  },
  emerald: {
    iconBg: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    iconColor: 'text-emerald-600',
  },
  amber: {
    iconBg: 'bg-amber-50 border-amber-100 text-amber-600',
    iconColor: 'text-amber-600',
  },
  red: {
    iconBg: 'bg-red-50 border-red-100 text-red-600',
    iconColor: 'text-red-600',
  },
  blue: {
    iconBg: 'bg-blue-50 border-blue-100 text-blue-600',
    iconColor: 'text-blue-600',
  },
  violet: {
    iconBg: 'bg-violet-50 border-violet-100 text-violet-600',
    iconColor: 'text-violet-600',
  },
};

const trendConfig: Record<
  StatCardTrend,
  {
    container: string;
    icon: React.ReactNode;
  }
> = {
  up: {
    container: 'text-emerald-600 bg-emerald-50',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
      </svg>
    ),
  },
  down: {
    container: 'text-red-600 bg-red-50',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
      </svg>
    ),
  },
  neutral: {
    container: 'text-slate-600 bg-slate-100',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
      </svg>
    ),
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'indigo',
  className = '',
  onClick,
}) => {
  const colorStyles = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 line-clamp-1">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>

        {icon && (
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${colorStyles.iconBg}`}
          >
            {icon}
          </div>
        )}
      </div>

      {(trend || subtitle || trendValue) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {trend && trendValue && (
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${trendConfig[trend].container}`}
            >
              {trendConfig[trend].icon}
              {trendValue}
            </span>
          )}

          {subtitle && (
            <span className="text-xs text-slate-500 font-normal">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
