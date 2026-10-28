"use client";

import Link from "next/link";

// ─── Iconos ───────────────────────────────────────────────────────────────────

const IconTrend = ({ direction }: { direction: "up" | "down" | "neutral" }) => {
  if (direction === "up") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
  );
  if (direction === "down") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" />
    </svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
};

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface StatCardProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icon: React.ReactNode;
  color: "indigo" | "emerald" | "amber" | "red" | "blue" | "violet";
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  href?: string;
}

// ─── Paleta de colores ────────────────────────────────────────────────────────

const colorMap = {
  indigo:  { bg: "bg-indigo-50",  icon: "bg-indigo-100  text-indigo-600",  trend: "text-indigo-600" },
  emerald: { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", trend: "text-emerald-600" },
  amber:   { bg: "bg-amber-50",   icon: "bg-amber-100   text-amber-600",   trend: "text-amber-600" },
  red:     { bg: "bg-red-50",     icon: "bg-red-100     text-red-600",     trend: "text-red-600" },
  blue:    { bg: "bg-blue-50",    icon: "bg-blue-100    text-blue-600",    trend: "text-blue-600" },
  violet:  { bg: "bg-violet-50",  icon: "bg-violet-100  text-violet-600",  trend: "text-violet-600" },
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

export function StatCard({
  titulo, valor, subtitulo, icon, color, trend = "neutral", trendLabel, href,
}: StatCardProps) {
  const c = colorMap[color];

  const inner = (
    <>
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        {trendLabel && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-slate-500"
          }`}>
            <IconTrend direction={trend} />
            {trendLabel}
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800 leading-tight">{valor}</div>
        <div className="text-sm font-medium text-slate-600 mt-0.5">{titulo}</div>
        {subtitulo && <div className="text-xs text-slate-400 mt-0.5">{subtitulo}</div>}
      </div>
    </>
  );

  const cls = `group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 ${href ? "hover:-translate-y-0.5 cursor-pointer" : ""} flex flex-col gap-4`;

  return href ? (
    <Link href={href} className={cls}>{inner}</Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

// ─── Fila de stats del dashboard ──────────────────────────────────────────────

export default function StatsRow() {
  // Estos valores vendrán del backend cuando la BD esté lista
  const stats: StatCardProps[] = [
    {
      titulo: "Total de productos",
      valor: "—",
      subtitulo: "Catálogo activo",
      href: "/productos",
      color: "indigo",
      trend: "neutral",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      ),
    },
    {
      titulo: "Stock bajo",
      valor: "—",
      subtitulo: "Requieren reposición",
      href: "/alertas",
      color: "amber",
      trend: "neutral",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
        </svg>
      ),
    },
    {
      titulo: "Agotados",
      valor: "—",
      subtitulo: "Sin existencias",
      href: "/alertas",
      color: "red",
      trend: "neutral",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      ),
    },
    {
      titulo: "Valor del inventario",
      valor: "—",
      subtitulo: "Estimado total",
      color: "emerald",
      trend: "neutral",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" x2="12" y1="1" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      titulo: "Movimientos (mes)",
      valor: "—",
      subtitulo: "Entradas y salidas",
      href: "/movimientos",
      color: "blue",
      trend: "neutral",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 16V4m0 0L3 8m4-4 4 4" /><path d="M17 8v12m0 0 4-4m-4 4-4-4" />
        </svg>
      ),
    },
    {
      titulo: "Compras (mes)",
      valor: "—",
      subtitulo: "Órdenes registradas",
      href: "/compras",
      color: "violet",
      trend: "neutral",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" x2="21" y1="6" y2="6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.titulo} {...stat} />
      ))}
    </div>
  );
}
