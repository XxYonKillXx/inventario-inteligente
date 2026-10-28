"use client";

import Link from "next/link";

// ─── Iconos ───────────────────────────────────────────────────────────────────

const IconEntrada = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
  </svg>
);

const IconSalida = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5" /><path d="m5 12 7-7 7 7" />
  </svg>
);

const IconAjuste = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);

// ─── Placeholder de movimientos ───────────────────────────────────────────────

const movimientosPlaceholder = [
  { id: 1, tipo: "entrada",  producto: "Ejemplo: Arroz 500g",      cantidad: 50,  usuario: "—", hora: "—" },
  { id: 2, tipo: "salida",   producto: "Ejemplo: Aceite de cocina", cantidad: 12,  usuario: "—", hora: "—" },
  { id: 3, tipo: "ajuste",   producto: "Ejemplo: Harina de trigo",  cantidad: 30,  usuario: "—", hora: "—" },
  { id: 4, tipo: "entrada",  producto: "Ejemplo: Azúcar morena",    cantidad: 100, usuario: "—", hora: "—" },
  { id: 5, tipo: "salida",   producto: "Ejemplo: Sal refinada",     cantidad: 8,   usuario: "—", hora: "—" },
];

const tipoConfig = {
  entrada: {
    label: "Entrada",
    icon: <IconEntrada />,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  salida: {
    label: "Salida",
    icon: <IconSalida />,
    color: "text-red-500",
    bg: "bg-red-100",
  },
  ajuste: {
    label: "Ajuste",
    icon: <IconAjuste />,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function MovimientosRecientes() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Movimientos recientes
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Últimas entradas, salidas y ajustes
          </p>
        </div>
        <Link
          href="/movimientos"
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Ver todos
          <IconArrow />
        </Link>
      </div>

      {/* Banner de BD pendiente */}
      <div className="px-5 py-3 bg-amber-50 border-b border-amber-100">
        <p className="text-xs text-amber-700">
          <span className="font-semibold">Pendiente de base de datos:</span> aquí
          aparecerán los últimos movimientos cuando MySQL esté configurado.
          Los datos de ejemplo son solo ilustrativos.
        </p>
      </div>

      {/* Lista de movimientos */}
      <div className="divide-y divide-slate-100">
        {movimientosPlaceholder.map((mov) => {
          const config = tipoConfig[mov.tipo as keyof typeof tipoConfig];
          return (
            <div
              key={mov.id}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
            >
              {/* Ícono del tipo */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${config.bg} ${config.color} flex items-center justify-center`}>
                {config.icon}
              </div>

              {/* Info del movimiento */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {mov.producto}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs font-medium ${config.color}`}>
                    {config.label}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-400">
                    {mov.usuario !== "—" ? `por ${mov.usuario}` : "Usuario pendiente"}
                  </span>
                </div>
              </div>

              {/* Cantidad + hora */}
              <div className="flex-shrink-0 text-right">
                <span className={`text-sm font-semibold ${config.color}`}>
                  {mov.tipo === "salida" ? "−" : "+"}{mov.cantidad}
                </span>
                <p className="text-xs text-slate-400 mt-0.5">{mov.hora}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center">
          Mostrando datos de ejemplo — se actualizará con datos reales
        </p>
      </div>
    </div>
  );
}
