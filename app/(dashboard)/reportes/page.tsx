"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Package,
  ArrowLeftRight,
  ShoppingCart,
  RefreshCw,
  CalendarDays,
  X,
  AlertCircle,
  FileText,
  Boxes,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { get } from "@/lib/api";

interface ReporteExistencia {
  categoria: string;
  total_productos: number;
  total_unidades: number;
  valor_costo: number;
  valor_venta: number;
  ganancia_potencial: number;
  agotados: number;
  stock_bajo: number;
}

interface ReporteProducto {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  unidad_medida: string;
  precio_venta: number;
  cantidad: number;
  stock_minimo: number;
  estado_stock: string;
  valor_total: number;
}

type TipoReporte = "existencias" | "productos" | "movimientos" | "compras";

const moneda = (valor: number) =>
  `$ ${Number(valor ?? 0).toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const numero = (valor: number) =>
  Number(valor ?? 0).toLocaleString("es-CO");

const tabsConfig = [
  { key: "existencias", label: "Existencias", icon: Boxes },
  { key: "productos", label: "Productos", icon: Package },
  { key: "movimientos", label: "Movimientos", icon: ArrowLeftRight },
  { key: "compras", label: "Compras", icon: ShoppingCart },
] as const;

const thClass =
  "px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider whitespace-nowrap text-[#667064]";

const tdClass = "px-4 py-3 text-sm text-[#667064] whitespace-nowrap";

const estadoStock = (estado: string) => {
  if (estado === "AGOTADO") {
    return {
      clase: "bg-[#f7e9e1] text-[#85462f]",
      icono: AlertCircle,
      texto: "Agotado",
    };
  }

  if (estado === "STOCK_BAJO") {
    return {
      clase: "bg-[#f7efd9] text-[#98702d]",
      icono: AlertTriangle,
      texto: "Stock bajo",
    };
  }

  return {
    clase: "bg-[#e6eee5] text-[#477b58]",
    icono: CheckCircle2,
    texto: "Disponible",
  };
};

export default function ReportesPage() {
  const router = useRouter();

  const [tab, setTab] = useState<TipoReporte>("existencias");
  const [datos, setDatos] = useState<unknown[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  async function cargar() {
    setCargando(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (desde) params.set("desde", desde);
      if (hasta) params.set("hasta", hasta);

      const query = params.toString();
      const endpoint = `/reportes/${tab}${query ? `?${query}` : ""}`;

      const res = await get<unknown[]>(endpoint);
      setDatos(Array.isArray(res) ? res : []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Ocurrió un error al cargar el reporte.";

      if (msg.includes("401") || msg.toLowerCase().includes("token")) {
        router.replace("/login");
        return;
      }

      setError(msg);
      setDatos([]);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargar();
    // La carga se actualiza al cambiar la pestaña o las fechas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, desde, hasta]);

  function renderTabla() {
    if (cargando) {
      return (
        <div className="flex flex-col items-center justify-center px-5 py-16">
          <RefreshCw className="mb-3 h-7 w-7 animate-spin text-[#b96f50]" />
          <p className="text-sm font-medium text-[#29382e]">
            Generando reporte...
          </p>
          <p className="mt-1 text-xs text-[#929487]">
            Estamos consultando la información del sistema.
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center px-5 py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f7e9e1]">
            <AlertCircle className="h-6 w-6 text-[#85462f]" />
          </div>
          <p className="text-sm font-semibold text-[#85462f]">
            No se pudo generar el reporte
          </p>
          <p className="mt-2 max-w-xl text-sm text-[#667064]">{error}</p>
          <button
            onClick={() => void cargar()}
            className="mt-4 rounded-xl bg-[#243c32] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#304b3e]"
          >
            Intentar nuevamente
          </button>
        </div>
      );
    }

    if (datos.length === 0) {
      return (
        <div className="flex flex-col items-center px-5 py-16 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eee9de]">
            <FileText className="h-7 w-7 text-[#929487]" />
          </div>
          <p className="text-sm font-semibold text-[#29382e]">
            Sin datos en este período
          </p>
          <p className="mt-1 max-w-sm text-xs leading-5 text-[#929487]">
            Puedes ajustar las fechas o registrar productos y movimientos para
            consultar la información.
          </p>
        </div>
      );
    }

    if (tab === "existencias") {
      const rows = datos as ReporteExistencia[];

      return (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5dfd2] bg-[#f7f4ec]">
              {[
                "Categoría",
                "Productos",
                "Unidades",
                "Valor costo",
                "Valor venta",
                "Ganancia potencial",
                "Agotados",
                "Stock bajo",
              ].map((col) => (
                <th key={col} className={thClass}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#e5dfd2]">
            {rows.map((r, i) => (
              <tr
                key={`${r.categoria}-${i}`}
                className="transition hover:bg-[#f7f4ec]/70"
              >
                <td className="px-4 py-3 font-semibold text-[#29382e]">
                  {r.categoria || "Sin categoría"}
                </td>
                <td className={tdClass}>{numero(r.total_productos)}</td>
                <td className={tdClass}>{numero(r.total_unidades)}</td>
                <td className={tdClass}>{moneda(r.valor_costo)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#29382e]">
                  {moneda(r.valor_venta)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-[#477b58]">
                  {moneda(r.ganancia_potencial)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex min-w-8 justify-center rounded-full px-2.5 py-1 text-xs font-bold ${
                      r.agotados > 0
                        ? "bg-[#f7e9e1] text-[#85462f]"
                        : "bg-[#eee9de] text-[#667064]"
                    }`}
                  >
                    {numero(r.agotados)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex min-w-8 justify-center rounded-full px-2.5 py-1 text-xs font-bold ${
                      r.stock_bajo > 0
                        ? "bg-[#f7efd9] text-[#98702d]"
                        : "bg-[#eee9de] text-[#667064]"
                    }`}
                  >
                    {numero(r.stock_bajo)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (tab === "productos") {
      const rows = datos as ReporteProducto[];

      return (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5dfd2] bg-[#f7f4ec]">
              {[
                "Código",
                "Nombre",
                "Categoría",
                "Unidad",
                "Precio venta",
                "Stock",
                "Mínimo",
                "Estado",
                "Valor total",
              ].map((col) => (
                <th key={col} className={thClass}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#e5dfd2]">
            {rows.map((r) => {
              const estado = estadoStock(r.estado_stock);
              const IconoEstado = estado.icono;

              return (
                <tr
                  key={r.id}
                  className="transition hover:bg-[#f7f4ec]/70"
                >
                  <td className="px-4 py-3 font-mono text-xs text-[#929487]">
                    {r.codigo || "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#29382e]">
                    {r.nombre}
                  </td>
                  <td className={tdClass}>{r.categoria || "—"}</td>
                  <td className={tdClass}>{r.unidad_medida || "—"}</td>
                  <td className={tdClass}>{moneda(r.precio_venta)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-[#29382e]">
                    {numero(r.cantidad)}
                  </td>
                  <td className={tdClass}>{numero(r.stock_minimo)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${estado.clase}`}
                    >
                      <IconoEstado className="h-3.5 w-3.5" />
                      {estado.texto}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#29382e]">
                    {moneda(r.valor_total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }

    // Movimientos y compras: mostrar las columnas devueltas por la API.
    const primeraFila = datos[0];

    if (
      !primeraFila ||
      typeof primeraFila !== "object" ||
      Array.isArray(primeraFila)
    ) {
      return (
        <div className="px-5 py-12 text-center text-sm text-[#667064]">
          La información recibida no tiene el formato esperado.
        </div>
      );
    }

    const keys = Object.keys(primeraFila);

    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e5dfd2] bg-[#f7f4ec]">
            {keys.map((key) => (
              <th key={key} className={thClass}>
                {key.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-[#e5dfd2]">
          {(datos as Record<string, unknown>[]).map((row, i) => (
            <tr
              key={i}
              className="transition hover:bg-[#f7f4ec]/70"
            >
              {keys.map((key) => {
                const valor = row[key];

                return (
                  <td
                    key={key}
                    className="whitespace-nowrap px-4 py-3 text-xs text-[#667064]"
                  >
                    {typeof valor === "number"
                      ? numero(valor)
                      : String(valor ?? "—")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const tabActual = tabsConfig.find((item) => item.key === tab);
  const IconoTab = tabActual?.icon ?? BarChart3;

  return (
    <div className="w-full space-y-6">

      {/* Pestañas */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-[#e5dfd2] bg-[#eee9de]/70 p-2">
        {tabsConfig.map((item) => {
          const Icono = item.icon;
          const activo = tab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activo
                  ? "bg-[#243c32] text-white shadow-sm"
                  : "text-[#667064] hover:bg-[#fffdf8] hover:text-[#29382e]"
              }`}
            >
              <Icono className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}

         <button
          onClick={() => void cargar()}
          disabled={cargando}
          className="inline-flex ml-auto items-center justify-center gap-2 rounded-xl bg-[#243c32] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#304b3e] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${cargando ? "animate-spin" : ""}`}
          />
          Actualizar reporte
        </button>
      </div>

      {/* Filtros por fecha */}
      {(tab === "movimientos" || tab === "compras") && (
        <div className="rounded-2xl border border-[#e5dfd2] bg-[#fffdf8] p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#b96f50]" />
            <h2 className="text-sm font-semibold text-[#29382e]">
              Filtrar por fecha
            </h2>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="fecha-desde"
                className="text-xs font-medium text-[#667064]"
              >
                Desde
              </label>
              <input
                id="fecha-desde"
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                max={hasta || undefined}
                className="rounded-xl border border-[#e5dfd2] bg-[#fffdf8] px-3 py-2 text-sm text-[#29382e] outline-none transition focus:border-[#b96f50] focus:ring-2 focus:ring-[#b96f50]/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="fecha-hasta"
                className="text-xs font-medium text-[#667064]"
              >
                Hasta
              </label>
              <input
                id="fecha-hasta"
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                min={desde || undefined}
                className="rounded-xl border border-[#e5dfd2] bg-[#fffdf8] px-3 py-2 text-sm text-[#29382e] outline-none transition focus:border-[#b96f50] focus:ring-2 focus:ring-[#b96f50]/20"
              />
            </div>

            {(desde || hasta) && (
              <button
                onClick={() => {
                  setDesde("");
                  setHasta("");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-[#85462f] transition hover:bg-[#f7e9e1]"
              >
                <X className="h-4 w-4" />
                Limpiar fechas
              </button>
            )}
          </div>

          <p className="mt-3 text-xs text-[#929487]">
            Selecciona un rango para consultar los movimientos o las compras
            registradas.
          </p>
        </div>
      )}

      {/* Tabla del reporte */}
      <div className="overflow-hidden rounded-2xl border border-[#e5dfd2] bg-[#fffdf8] shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#e5dfd2] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7e9e1]">
              <IconoTab className="h-5 w-5 text-[#a45d40]" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#29382e]">
                Reporte de {tabActual?.label.toLowerCase()}
              </h2>
              <p className="mt-0.5 text-xs text-[#929487]">
                Información consultada desde el sistema
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!cargando && !error && (
              <span className="rounded-full bg-[#e6eee5] px-3 py-1 text-xs font-semibold text-[#477b58]">
                {datos.length} {datos.length === 1 ? "registro" : "registros"}
              </span>
            )}

            <button
              onClick={() => void cargar()}
              disabled={cargando}
              title="Volver a cargar los datos"
              className="inline-flex items-center gap-2 rounded-xl border border-[#e5dfd2] bg-[#fffdf8] px-3 py-2 text-xs font-semibold text-[#29382e] transition hover:bg-[#f7f4ec] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${cargando ? "animate-spin" : ""}`}
              />
              Recargar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">{renderTabla()}</div>

        {!cargando && !error && datos.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#e5dfd2] bg-[#f7f4ec]/60 px-5 py-3">
            <p className="text-xs text-[#929487]">
              Reporte generado con la información disponible.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#667064]">
              <TrendingUp className="h-3.5 w-3.5 text-[#477b58]" />
              Datos del inventario
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
