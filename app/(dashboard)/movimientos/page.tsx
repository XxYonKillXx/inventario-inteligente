"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  History,
  Package,
  CalendarDays,
} from "lucide-react";
import {
  listarMovimientos,
} from "@/services/movimientos.service";
import type {
  Movimiento,
} from "@/services/movimientos.service";

const TIPO_CFG = {
  ENTRADA: {
    label: "Entrada",
    bg: "bg-[#e6eee5]",
    text: "text-[#315b3b]",
    icon: ArrowDownToLine,
    numColor: "text-[#477b58]",
  },
  SALIDA: {
    label: "Salida",
    bg: "bg-[#f7e9e1]",
    text: "text-[#85462f]",
    icon: ArrowUpFromLine,
    numColor: "text-[#a45d40]",
  },
  AJUSTE: {
    label: "Ajuste",
    bg: "bg-[#f7efd9]",
    text: "text-[#805e27]",
    icon: ArrowLeftRight,
    numColor: "text-[#98702d]",
  },
};

const OPCIONES_FILTRO = [
  "todos",
  "ENTRADA",
  "SALIDA",
  "AJUSTE",
] as const;

export default function MovimientosPage() {
  const router = useRouter();

  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  async function cargar() {
    setCargando(true);
    setError(null);

    try {
      const filtros: Record<string, string> = {};

      if (tipoFiltro !== "todos") {
        filtros.tipo = tipoFiltro;
      }

      if (desde) {
        filtros.desde = desde;
      }

      if (hasta) {
        filtros.hasta = hasta;
      }

      const resultado = await listarMovimientos(filtros);
      setMovimientos(resultado);
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : "No fue posible cargar los movimientos.";

      if (msg.includes("401") || msg.includes("Token")) {
        router.replace("/login");
        return;
      }

      setError(msg);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargar();

    // Actualizar el historial cuando cambien los filtros.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoFiltro, desde, hasta]);

  function limpiarFiltros() {
    setTipoFiltro("todos");
    setDesde("");
    setHasta("");
  }

  const cantidadFiltrosActivos =
    Number(tipoFiltro !== "todos") +
    Number(Boolean(desde)) +
    Number(Boolean(hasta));

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">

      {/* Encabezado */}
      <div>
        <p className="mt-3 text-xs text-[#929487]">
          Historial de solo lectura: los movimientos registrados no se
          pueden modificar desde esta pantalla.
        </p>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-[#e8c7b7] bg-[#f7e9e1] px-4 py-3">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 text-[#a45d40]"
          />

          <div className="text-sm text-[#85462f]">
            <p className="font-semibold">
              No se pudieron cargar los movimientos
            </p>

            <p className="mt-1">{error}</p>

            <button
              type="button"
              onClick={() => void cargar()}
              className="mt-1 font-semibold underline underline-offset-2 hover:text-[#693723]"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <section className="rounded-xl border border-[#e5dfd2] bg-[#fffdf8] p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#29382e]">
            Filtrar movimientos
          </h2>

          {cantidadFiltrosActivos > 0 && (
            <span className="rounded-full bg-[#f7e9e1] px-2.5 py-1 text-xs font-semibold text-[#85462f]">
              {cantidadFiltrosActivos} filtro
              {cantidadFiltrosActivos !== 1 ? "s" : ""} activo
              {cantidadFiltrosActivos !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">

          {/* Tipo de movimiento */}
          <div className="flex flex-wrap gap-1 rounded-xl bg-[#eee9de] p-1">
            {OPCIONES_FILTRO.map((tipo) => {
              const activo = tipoFiltro === tipo;

              const etiqueta =
                tipo === "todos"
                  ? "Todos"
                  : tipo.charAt(0) + tipo.slice(1).toLowerCase();

              return (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setTipoFiltro(tipo)}
                  aria-pressed={activo}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    activo
                      ? "bg-[#fffdf8] text-[#243c32] shadow-sm"
                      : "text-[#667064] hover:text-[#29382e]"
                  }`}
                >
                  {etiqueta}
                </button>
              );
            })}
          </div>

          {/* Fecha inicial y final */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">

            <label className="flex items-center gap-2 text-xs font-medium text-[#667064]">
              <CalendarDays
                size={15}
                className="shrink-0 text-[#929487]"
              />

              Desde

              <input
                type="date"
                value={desde}
                max={hasta || undefined}
                onChange={(e) => setDesde(e.target.value)}
                className="min-w-0 rounded-lg border border-[#d8d0c1] bg-[#fffdf8] px-2.5 py-2 text-sm text-[#29382e] outline-none transition-colors focus:border-[#b96f50] focus:ring-2 focus:ring-[#b96f50]/20"
              />
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-[#667064]">
              <CalendarDays
                size={15}
                className="shrink-0 text-[#929487]"
              />

              Hasta

              <input
                type="date"
                value={hasta}
                min={desde || undefined}
                onChange={(e) => setHasta(e.target.value)}
                className="min-w-0 rounded-lg border border-[#d8d0c1] bg-[#fffdf8] px-2.5 py-2 text-sm text-[#29382e] outline-none transition-colors focus:border-[#b96f50] focus:ring-2 focus:ring-[#b96f50]/20"
              />
            </label>
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap items-center gap-2 xl:ml-auto">
            {cantidadFiltrosActivos > 0 && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#85462f] transition-colors hover:bg-[#f7e9e1]"
              >
                <RotateCcw size={14} />
                Limpiar filtros
              </button>
            )}

            <button
              type="button"
              onClick={() => void cargar()}
              disabled={cargando}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e5dfd2] bg-[#fffdf8] px-3 py-2 text-xs font-semibold text-[#243c32] transition-colors hover:bg-[#e6eee5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={14}
                className={cargando ? "animate-spin" : ""}
              />

              {cargando ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>
      </section>

      {/* Tabla de movimientos */}
      <section className="overflow-hidden rounded-xl border border-[#e5dfd2] bg-[#fffdf8] shadow-sm">

        {/* Cabecera de la tabla */}
        <div className="flex flex-col gap-2 border-b border-[#eee9de] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-sm font-bold text-[#29382e]">
              Historial de movimientos
            </h2>

            <p className="mt-1 text-xs text-[#667064]">
              {cargando
                ? "Cargando registros..."
                : `${movimientos.length} movimiento${
                    movimientos.length !== 1 ? "s" : ""
                  } encontrado${
                    movimientos.length !== 1 ? "s" : ""
                  }`}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-lg bg-[#e6eee5] px-3 py-2 text-xs font-medium text-[#315b3b] sm:self-auto">
            <ShieldCheck size={16} />
            Solo lectura
          </div>
        </div>

        {/* Contenido de la tabla */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-sm">

            <thead>
              <tr className="border-b border-[#e5dfd2] bg-[#f7f4ec]">
                {[
                  "Fecha y hora",
                  "Producto",
                  "Tipo",
                  "Cantidad",
                  "Antes",
                  "Después",
                  "Usuario",
                  "Motivo",
                ].map((columna) => (
                  <th
                    key={columna}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#667064]"
                  >
                    {columna}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#eee9de]">

              {/* Cargando */}
              {cargando ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-4 py-4">
                      <div className="h-4 animate-pulse rounded bg-[#eee9de]" />
                    </td>
                  </tr>
                ))

              ) : movimientos.length === 0 ? (

                /* Sin resultados */
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eee9de] text-[#667064]">
                      <History size={22} />
                    </div>

                    <p className="font-semibold text-[#29382e]">
                      No hay movimientos para mostrar
                    </p>

                    <p className="mt-1 text-xs text-[#667064]">
                      Prueba cambiando los filtros o seleccionando otro
                      rango de fechas.
                    </p>

                    {cantidadFiltrosActivos > 0 && (
                      <button
                        type="button"
                        onClick={limpiarFiltros}
                        className="mt-3 text-xs font-semibold text-[#85462f] underline underline-offset-2 hover:text-[#a45d40]"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </td>
                </tr>

              ) : (

                /* Registros */
                movimientos.map((m) => {
                  const cfg =
                    TIPO_CFG[m.tipo as keyof typeof TIPO_CFG] ??
                    TIPO_CFG.AJUSTE;

                  const TipoIcon = cfg.icon;

                  return (
                    <tr
                      key={m.id}
                      className="transition-colors hover:bg-[#f7f4ec]/70"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[#667064]">
                        {new Date(m.fecha_movimiento).toLocaleString("es-CO")}
                      </td>

                      <td
                        className="max-w-[200px] truncate px-4 py-3 font-semibold text-[#29382e]"
                        title={m.producto_nombre}
                      >
                        {m.producto_nombre}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}
                        >
                          <TipoIcon size={13} strokeWidth={2.5} />
                          {cfg.label}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`text-sm font-bold tabular-nums ${cfg.numColor}`}
                        >
                          {m.tipo === "SALIDA"
                            ? "−"
                            : m.tipo === "ENTRADA"
                              ? "+"
                              : ""}
                          {Number(m.cantidad).toLocaleString("es-CO")}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs tabular-nums text-[#667064]">
                        {Number(m.cantidad_anterior).toLocaleString("es-CO")}
                      </td>

                      <td className="px-4 py-3 text-xs font-semibold tabular-nums text-[#29382e]">
                        {Number(m.cantidad_nueva).toLocaleString("es-CO")}
                      </td>

                      <td className="px-4 py-3 text-xs text-[#667064]">
                        {m.usuario_nombre || "—"}
                      </td>

                      <td
                        className="max-w-[220px] truncate px-4 py-3 text-xs text-[#667064]"
                        title={m.motivo || ""}
                      >
                        {m.motivo || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pie informativo */}
        <div className="flex items-center gap-2 border-t border-[#eee9de] bg-[#f7f4ec]/70 px-4 py-3 text-xs text-[#667064]">
          <ShieldCheck
            size={15}
            className="shrink-0 text-[#477b58]"
          />

          Este historial es de consulta. Para registrar cambios de
          inventario, utiliza el módulo correspondiente.
        </div>
      </section>
    </div>
  );
}