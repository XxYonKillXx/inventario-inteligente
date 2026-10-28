"use client";

import Link from "next/link";

// ─── Iconos ───────────────────────────────────────────────────────────────────

const IconWarning = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);

const IconEmpty = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" x2="19.07" y1="4.93" y2="19.07" />
  </svg>
);

const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);

// ─── Alertas placeholder ──────────────────────────────────────────────────────

const alertasPlaceholder = [
  { id: 1, tipo: "agotado",    producto: "Ejemplo: Producto A", stock: 0,  stockMinimo: 10 },
  { id: 2, tipo: "stock_bajo", producto: "Ejemplo: Producto B", stock: 3,  stockMinimo: 15 },
  { id: 3, tipo: "agotado",    producto: "Ejemplo: Producto C", stock: 0,  stockMinimo: 5  },
  { id: 4, tipo: "stock_bajo", producto: "Ejemplo: Producto D", stock: 7,  stockMinimo: 20 },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AlertasPanel() {
  const agotados  = alertasPlaceholder.filter((a) => a.tipo === "agotado").length;
  const stockBajo = alertasPlaceholder.filter((a) => a.tipo === "stock_bajo").length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Alertas de inventario
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Productos que requieren atención
          </p>
        </div>
        <Link
          href="/alertas"
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Ver todas
          <IconArrow />
        </Link>
      </div>

      {/* Contadores rápidos */}
      <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
        <div className="px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-red-500"><IconEmpty /></span>
            <span className="text-lg font-bold text-slate-800">{agotados}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Agotados</p>
        </div>
        <div className="px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-500"><IconWarning /></span>
            <span className="text-lg font-bold text-slate-800">{stockBajo}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Stock bajo</p>
        </div>
      </div>

      {/* Banner BD pendiente */}
      <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100">
        <p className="text-xs text-amber-700">
          <span className="font-semibold">Datos de ejemplo.</span> Las alertas reales
          se generarán al conectar la base de datos.
        </p>
      </div>

      {/* Lista de alertas */}
      <div className="divide-y divide-slate-100">
        {alertasPlaceholder.map((alerta) => {
          const esAgotado = alerta.tipo === "agotado";
          return (
            <div
              key={alerta.id}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors"
            >
              {/* Ícono */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                esAgotado ? "bg-red-100 text-red-500" : "bg-amber-100 text-amber-600"
              }`}>
                {esAgotado ? <IconEmpty /> : <IconWarning />}
              </div>

              {/* Producto */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {alerta.producto}
                </p>
                <p className={`text-xs mt-0.5 ${esAgotado ? "text-red-500" : "text-amber-600"}`}>
                  {esAgotado ? "Sin existencias" : `Stock: ${alerta.stock} / mín: ${alerta.stockMinimo}`}
                </p>
              </div>

              {/* Badge */}
              <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                esAgotado
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {esAgotado ? "Agotado" : "Bajo"}
              </span>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
        <Link
          href="/alertas"
          className="flex items-center justify-center gap-1.5 w-full text-xs font-medium text-indigo-600 hover:text-indigo-700 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          Gestionar alertas
          <IconArrow />
        </Link>
      </div>
    </div>
  );
}
