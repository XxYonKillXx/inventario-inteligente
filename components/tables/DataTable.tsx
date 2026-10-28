"use client";

import { useState, useMemo } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Columna<T> {
  key: string;
  titulo: string;
  render?: (fila: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columnas: Columna<T>[];
  datos: T[];
  cargando?: boolean;
  keyField?: string;
  busqueda?: string;
  onBusqueda?: (valor: string) => void;
  paginaActual?: number;
  totalPaginas?: number;
  onPaginaAnterior?: () => void;
  onPaginaSiguiente?: () => void;
  totalRegistros?: number;
  porPagina?: number;
  acciones?: (fila: T) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
}

// ─── Icono de ordenamiento ────────────────────────────────────────────────────

function IconSort({ activo, dir }: { activo: boolean; dir?: "asc" | "desc" }) {
  return (
    <span className={`ml-1.5 inline-flex flex-col gap-[2px] transition-opacity ${activo ? "opacity-100" : "opacity-30"}`}>
      <svg width="8" height="5" viewBox="0 0 8 5" fill={activo && dir === "asc" ? "#6366f1" : "currentColor"}>
        <path d="M4 0L8 5H0L4 0Z" />
      </svg>
      <svg width="8" height="5" viewBox="0 0 8 5" fill={activo && dir === "desc" ? "#6366f1" : "currentColor"}>
        <path d="M4 5L0 0H8L4 5Z" />
      </svg>
    </span>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 rounded" style={{ width: i === 0 ? "60%" : i === cols - 1 ? "40%" : "80%" }} />
        </td>
      ))}
    </tr>
  );
}

// ─── DataTable ────────────────────────────────────────────────────────────────

export default function DataTable<T extends Record<string, unknown>>({
  columnas,
  datos,
  cargando = false,
  keyField = "id",
  busqueda = "",
  onBusqueda,
  paginaActual = 1,
  totalPaginas = 1,
  onPaginaAnterior,
  onPaginaSiguiente,
  totalRegistros = 0,
  porPagina = 10,
  acciones,
  emptyTitle = "Sin resultados",
  emptyDescription = "No se encontraron registros.",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Ordenamiento local
  const datosSorted = useMemo(() => {
    if (!sortKey) return datos;
    return [...datos].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      const strA = String(valA ?? "").toLowerCase();
      const strB = String(valB ?? "").toLowerCase();
      return sortDir === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [datos, sortKey, sortDir]);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const inicio = (paginaActual - 1) * porPagina + 1;
  const fin    = Math.min(paginaActual * porPagina, totalRegistros || datos.length);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Barra de búsqueda */}
      {onBusqueda !== undefined && (
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="relative max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => onBusqueda(e.target.value)}
              className="
                w-full pl-9 pr-4 py-2 text-sm text-slate-700 placeholder:text-slate-400
                border border-slate-200 rounded-lg bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                transition-all duration-200
              "
            />
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {columnas.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={`
                    px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider
                    whitespace-nowrap
                    ${col.sortable ? "cursor-pointer select-none hover:text-slate-700 hover:bg-slate-100 transition-colors" : ""}
                  `}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center">
                    {col.titulo}
                    {col.sortable && (
                      <IconSort
                        activo={sortKey === col.key}
                        dir={sortKey === col.key ? sortDir : undefined}
                      />
                    )}
                  </span>
                </th>
              ))}
              {acciones && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cargando ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={columnas.length + (acciones ? 1 : 0)} />
              ))
            ) : datosSorted.length === 0 ? (
              <tr>
                <td
                  colSpan={columnas.length + (acciones ? 1 : 0)}
                  className="px-4 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{emptyTitle}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{emptyDescription}</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              datosSorted.map((fila, index) => (
                <tr
                  key={String(fila[keyField] ?? index)}
                  className="hover:bg-slate-50 transition-colors"
                >
                  {columnas.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {col.render ? col.render(fila) : String(fila[col.key] ?? "—")}
                    </td>
                  ))}
                  {acciones && (
                    <td className="px-4 py-3 text-right">
                      {acciones(fila)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalRegistros > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-500">
            Mostrando <span className="font-medium text-slate-700">{inicio}–{fin}</span> de{" "}
            <span className="font-medium text-slate-700">{totalRegistros}</span> registros
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onPaginaAnterior}
              disabled={paginaActual <= 1 || cargando}
              className="
                flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg
                border border-slate-200 text-slate-600
                hover:bg-white hover:border-slate-300
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-150
              "
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Anterior
            </button>
            <span className="text-xs text-slate-500 px-1">
              {paginaActual} / {totalPaginas}
            </span>
            <button
              onClick={onPaginaSiguiente}
              disabled={paginaActual >= totalPaginas || cargando}
              className="
                flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg
                border border-slate-200 text-slate-600
                hover:bg-white hover:border-slate-300
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-150
              "
            >
              Siguiente
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
