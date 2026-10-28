"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Bell,
  RefreshCw,
  Package,
  ShieldCheck,
  CircleCheck,
} from "lucide-react";
import { get, patch } from "@/lib/api";

interface Alerta {
  id: number;
  producto_id: number;
  producto_nombre: string;
  stock_actual: number;
  stock_minimo: number;
  categoria_nombre: string;
  tipo: "STOCK_BAJO" | "STOCK_AGOTADO" | "VENCIMIENTO";
  mensaje: string;
  estado: string;
  fecha_alerta: string;
}

interface Resumen {
  STOCK_BAJO: number;
  STOCK_AGOTADO: number;
  VENCIMIENTO: number;
  total: number;
}

const COLORES = {
  fondo: "#f7f4ec",
  tarjeta: "#fffdf8",
  muted: "#eee9de",
  texto: "#29382e",
  secundario: "#667064",
  apagado: "#929487",
  borde: "#e5dfd2",
  verde: "#243c32",
  verdeSuave: "#e6eee5",
  verdeExito: "#477b58",
  terracota: "#b96f50",
  terracotaOscuro: "#85462f",
  terracotaSuave: "#f7e9e1",
  amarillo: "#98702d",
  amarilloSuave: "#f7efd9",
};

export default function AlertasPage() {
  const router = useRouter();

  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [resumen, setResumen] = useState<Resumen>({
    STOCK_BAJO: 0,
    STOCK_AGOTADO: 0,
    VENCIMIENTO: 0,
    total: 0,
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atendiendo, setAtendiendo] = useState<number | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);

    try {
      const [al, res] = await Promise.all([
        get<Alerta[]>("/alertas?estado=PENDIENTE"),
        get<Resumen>("/alertas/resumen"),
      ]);

      setAlertas(al);
      setResumen(res);
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : "No fue posible cargar las alertas.";

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
    // La consulta inicial se realiza al entrar al módulo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function atender(id: number) {
    if (!confirm("¿Marcar esta alerta como atendida?")) return;

    setAtendiendo(id);
    setError(null);

    try {
      await patch(`/alertas/${id}/atender`);
      await cargar();
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : "No fue posible atender la alerta.";

      setError(msg);
    } finally {
      setAtendiendo(null);
    }
  }

  const agotados = alertas.filter(
    (a) => a.tipo === "STOCK_AGOTADO"
  );

  const stockBajo = alertas.filter(
    (a) => a.tipo === "STOCK_BAJO"
  );

  const vencimiento = alertas.filter(
    (a) => a.tipo === "VENCIMIENTO"
  );

  function TablaAlertas({
    items,
    tipo,
  }: {
    items: Alerta[];
    tipo: string;
  }) {
    const esAgotado = tipo === "STOCK_AGOTADO";
    const esVencimiento = tipo === "VENCIMIENTO";

    const config = esAgotado
      ? {
          titulo: "Productos agotados",
          descripcion: "Productos que necesitan reposición inmediata.",
          icono: Package,
          fondo: "bg-[#f7e9e1]",
          borde: "border-[#e8c7b7]",
          texto: "text-[#85462f]",
          textoSecundario: "text-[#a45d40]",
          insignia: "bg-[#e8c7b7] text-[#85462f]",
        }
      : esVencimiento
        ? {
            titulo: "Próximos a vencer",
            descripcion: "Productos que requieren revisión de su fecha.",
            icono: CalendarDays,
            fondo: "bg-[#f7efd9]",
            borde: "border-[#e8d8ad]",
            texto: "text-[#805e27]",
            textoSecundario: "text-[#98702d]",
            insignia: "bg-[#e8d8ad] text-[#805e27]",
          }
        : {
            titulo: "Stock bajo",
            descripcion: "Productos por debajo del nivel mínimo.",
            icono: AlertTriangle,
            fondo: "bg-[#eee9de]",
            borde: "border-[#e5dfd2]",
            texto: "text-[#667064]",
            textoSecundario: "text-[#85462f]",
            insignia: "bg-[#e5dfd2] text-[#29382e]",
          };

    const Icono = config.icono;

    return (
      <section
        className={`overflow-hidden rounded-xl border bg-[#fffdf8] shadow-sm ${config.borde}`}
      >
        <div
          className={`flex items-center gap-3 border-b px-4 py-4 sm:px-5 ${config.fondo} ${config.borde}`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fffdf8]/80 ${config.texto}`}
          >
            <Icono size={20} />
          </div>

          <div className="min-w-0">
            <h3 className={`text-sm font-bold ${config.texto}`}>
              {config.titulo}
            </h3>
            <p className={`mt-1 text-xs ${config.textoSecundario}`}>
              {config.descripcion}
            </p>
          </div>

          <span
            className={`ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-bold ${config.insignia}`}
          >
            {items.length}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#e6eee5] text-[#477b58]">
              <CheckCircle2 size={23} />
            </div>

            <p className="text-sm font-semibold text-[#29382e]">
              Sin alertas en esta categoría
            </p>

            <p className="mt-1 text-xs text-[#667064]">
              No hay productos pendientes por revisar aquí.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead>
                <tr className="border-b border-[#e5dfd2] bg-[#f7f4ec]">
                  {[
                    "Producto",
                    "Categoría",
                    "Stock actual",
                    "Stock mínimo",
                    "Detalle",
                    "Acción",
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
                {items.map((a) => (
                  <tr
                    key={a.id}
                    className="transition-colors hover:bg-[#f7f4ec]/70"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eee9de] text-[#667064]">
                          <Package size={16} />
                        </div>

                        <span
                          className="max-w-[200px] truncate font-semibold text-[#29382e]"
                          title={a.producto_nombre}
                        >
                          {a.producto_nombre}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs text-[#667064]">
                      {a.categoria_nombre || "Sin categoría"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`font-bold tabular-nums ${
                          esAgotado
                            ? "text-[#a45d40]"
                            : esVencimiento
                              ? "text-[#98702d]"
                              : "text-[#85462f]"
                        }`}
                      >
                        {Number(a.stock_actual).toLocaleString("es-CO")}
                      </span>
                      <span className="ml-1 text-xs text-[#929487]">
                        uds.
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs tabular-nums text-[#667064]">
                      {Number(a.stock_minimo).toLocaleString("es-CO")} uds.
                    </td>

                    <td
                      className="max-w-[220px] truncate px-4 py-3 text-xs text-[#667064]"
                      title={a.mensaje}
                    >
                      {a.mensaje}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => void atender(a.id)}
                        disabled={atendiendo !== null}
                        className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[#d8d0c1] bg-[#fffdf8] px-3 py-2 text-xs font-semibold text-[#243c32] transition-colors hover:border-[#b96f50] hover:bg-[#f7e9e1] hover:text-[#85462f] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {atendiendo === a.id ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            Atendiendo...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} />
                            Atender
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  }

  const tarjetas = [
    {
      label: "Agotados",
      valor: resumen.STOCK_AGOTADO,
      icono: Package,
      fondo: "bg-[#f7e9e1]",
      borde: "border-[#e8c7b7]",
      color: "text-[#85462f]",
    },
    {
      label: "Stock bajo",
      valor: resumen.STOCK_BAJO,
      icono: AlertTriangle,
      fondo: "bg-[#f7efd9]",
      borde: "border-[#e8d8ad]",
      color: "text-[#98702d]",
    },
    {
      label: "Vencimiento",
      valor: resumen.VENCIMIENTO,
      icono: CalendarDays,
      fondo: "bg-[#eee9de]",
      borde: "border-[#e5dfd2]",
      color: "text-[#667064]",
    },
    {
      label: "Total de alertas",
      valor: resumen.total,
      icono: Bell,
      fondo: "bg-[#e6eee5]",
      borde: "border-[#cdddc9]",
      color: "text-[#243c32]",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-[#e8c7b7] bg-[#f7e9e1] px-4 py-3">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-[#a45d40]"
          />

          <div className="text-sm text-[#85462f]">
            <p className="font-semibold">
              No se pudo completar la operación
            </p>
            <p className="mt-1">{error}</p>

            <button
              type="button"
              onClick={() => void cargar()}
              className="mt-2 font-semibold underline underline-offset-2 hover:text-[#693723]"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Resumen */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-[#29382e]">
              Resumen de alertas
            </h2>
            <p className="mt-1 text-xs text-[#667064]">
              Estado general de las alertas registradas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void cargar()}
            disabled={cargando}
            className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#e5dfd2] bg-[#fffdf8] px-4 py-2.5 text-xs font-semibold text-[#243c32] transition-colors hover:bg-[#e6eee5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={cargando ? "animate-spin" : ""}
            />
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {tarjetas.map((tarjeta) => {
            const Icono = tarjeta.icono;

            return (
              <div
                key={tarjeta.label}
                className={`rounded-xl border bg-[#fffdf8] p-4 shadow-sm ${tarjeta.borde}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${tarjeta.fondo} ${tarjeta.color}`}
                  >
                    <Icono size={20} />
                  </div>

                  <span
                    className={`text-2xl font-bold tabular-nums ${tarjeta.color}`}
                  >
                    {cargando ? "—" : tarjeta.valor}
                  </span>
                </div>

                <p className="mt-3 text-xs font-medium text-[#667064]">
                  {tarjeta.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Estado de carga */}
      {cargando ? (
        <div className="rounded-xl border border-[#e5dfd2] bg-[#fffdf8] p-10 text-center">
          <RefreshCw
            size={24}
            className="mx-auto animate-spin text-[#b96f50]"
          />
          <p className="mt-3 text-sm font-semibold text-[#29382e]">
            Cargando alertas...
          </p>
          <p className="mt-1 text-xs text-[#667064]">
            Estamos consultando la información del inventario.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <TablaAlertas items={agotados} tipo="STOCK_AGOTADO" />
          <TablaAlertas items={stockBajo} tipo="STOCK_BAJO" />

          {vencimiento.length > 0 && (
            <TablaAlertas items={vencimiento} tipo="VENCIMIENTO" />
          )}

          {alertas.length === 0 && !error && (
            <div className="rounded-xl border border-[#cdddc9] bg-[#e6eee5] px-5 py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fffdf8] text-[#477b58]">
                <ShieldCheck size={25} />
              </div>

              <h3 className="mt-3 text-sm font-bold text-[#243c32]">
                Todo está bajo control
              </h3>

              <p className="mt-1 text-xs text-[#667064]">
                No hay alertas pendientes de inventario en este momento.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-start gap-2 rounded-xl border border-[#e5dfd2] bg-[#fffdf8] px-4 py-3">
        <CircleCheck
          size={16}
          className="mt-0.5 shrink-0 text-[#477b58]"
        />
        <p className="text-xs leading-5 text-[#667064]">
          Recuerda revisar las alertas de productos agotados y de stock bajo
          para planificar las compras y evitar que falten ingredientes o
          productos durante los días de mayor movimiento.
        </p>
      </div>
    </div>
  );
}