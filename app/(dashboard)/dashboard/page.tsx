"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { get } from "@/lib/api";
import {
  LayoutDashboard,
  Package,
  TriangleAlert,
  Ban,
  DollarSign,
  ArrowLeftRight,
  ShoppingCart,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat2,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────

interface Stats {
  total_productos: number;
  stock_bajo: number;
  agotados: number;
  valor_inventario: number;
  movimientos_mes: number;
  compras_mes: number;
  ultimos_movimientos: Movimiento[];
  alertas_pendientes: Alerta[];
}

interface Movimiento {
  id: number;
  tipo: string;
  cantidad: number;
  cantidad_nueva: number;
  motivo: string;
  fecha_movimiento: string;
  producto_nombre: string;
  usuario_nombre: string;
}

interface Alerta {
  id: number;
  tipo: string;
  mensaje: string;
  producto_nombre: string;
  stock_actual: number;
  stock_minimo: number;
}

// ─── Paleta de movimientos ─────────────────────────────────────────────────

const TIPO_MOV_COLOR: Record<string, string> = {
  ENTRADA: "text-[#477b58] bg-[#e6efe5]",
  SALIDA: "text-[#a45d40] bg-[#f7e9e1]",
  AJUSTE: "text-[#98702d] bg-[#f7efd9]",
};

// ─── Tarjeta de indicador ──────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-[#fffdf8] rounded-xl border border-[#e5dfd2] shadow-sm p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
      </div>

      <p className="text-2xl font-bold text-[#29382e] leading-tight break-words">
        {value}
      </p>

      <p className="text-sm font-medium text-[#667064] mt-1">{label}</p>

      {sub && (
        <p className="text-xs text-[#929487] mt-1">{sub}</p>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<{ nombre: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ii_usuario");
      if (raw) {
        setUsuario(JSON.parse(raw));
      }
    } catch {
      // No se pudo recuperar la información del usuario.
    }
  }, []);

  async function cargar() {
    setCargando(true);
    setError(null);

    try {
      setStats(await get<Stats>("/dashboard/stats"));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error inesperado";

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
    cargar();
    // Se carga la información al entrar al dashboard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmt = (n: number) => n.toLocaleString("es-CO");

  const fmtCOP = (n: number) =>
    `$ ${n.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  const fechaActual = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const indicadores = stats
    ? [
        {
          icon: <Package size={21} strokeWidth={1.8} />,
          label: "Total productos",
          value: fmt(stats.total_productos),
          color: "bg-[#e6eee5] text-[#477b58]",
          sub: "Activos en el sistema",
        },
        {
          icon: <TriangleAlert size={21} strokeWidth={1.8} />,
          label: "Stock bajo",
          value: fmt(stats.stock_bajo),
          color: "bg-[#f7efd9] text-[#98702d]",
          sub: "Requieren reposición",
        },
        {
          icon: <Ban size={21} strokeWidth={1.8} />,
          label: "Agotados",
          value: fmt(stats.agotados),
          color: "bg-[#f7e9e1] text-[#a45d40]",
          sub: "Sin unidades disponibles",
        },
        {
          icon: <DollarSign size={21} strokeWidth={1.8} />,
          label: "Valor inventario",
          value: fmtCOP(stats.valor_inventario),
          color: "bg-[#f5edda] text-[#98702d]",
          sub: "Según el valor registrado",
        },
        {
          icon: <ArrowLeftRight size={21} strokeWidth={1.8} />,
          label: "Movimientos mes",
          value: fmt(stats.movimientos_mes),
          color: "bg-[#e5ece6] text-[#304b3e]",
          sub: "Durante este mes",
        },
        {
          icon: <ShoppingCart size={21} strokeWidth={1.8} />,
          label: "Compras mes",
          value: fmt(stats.compras_mes),
          color: "bg-[#f7e9e1] text-[#a45d40]",
          sub: "Durante este mes",
        },
      ]
    : [];

  return (
    <div className="w-full space-y-6 text-[#29382e]">
      {/* Bienvenida */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#243c32] to-[#304b3e] rounded-2xl px-6 py-6 text-white shadow-md">
        <div className="absolute -right-10 -top-16 w-48 h-48 rounded-full border border-white/10" />
        <div className="absolute -right-2 -bottom-24 w-40 h-40 rounded-full border border-white/10" />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-1 rounded-full bg-[#d5ad62]" />
              <span className="text-xs uppercase tracking-[0.18em] text-[#e4c98f] font-semibold">
                Inventario inteligente
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold">
              Buenos días{usuario?.nombre ? `, ${usuario.nombre}` : ""}
            </h2>

            <p className="text-[#e0e7dd] text-sm mt-2 flex items-center gap-2">
              <CalendarDays size={15} />
              {fechaActual}
            </p>
          </div>

          <button
            onClick={cargar}
            disabled={cargando}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#b96f50] hover:bg-[#a45d40] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            <RefreshCw
              size={16}
              className={cargando ? "animate-spin" : ""}
            />
            {cargando ? "Actualizando..." : "Actualizar datos"}
          </button>
        </div>
      </section>

      {/* Error de conexión */}
      {error && (
        <div className="bg-[#f7e9e1] border border-[#e7c7b7] rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle size={20} className="text-[#a45d40] shrink-0" />

          <p className="text-sm text-[#85462f] flex-1">{error}</p>

          <button
            onClick={cargar}
            className="text-sm font-semibold text-[#85462f] hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Indicadores principales */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <LayoutDashboard size={19} className="text-[#b96f50]" />
          <h3 className="text-base font-bold text-[#29382e]">
            Resumen del inventario
          </h3>
        </div>

        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {cargando ? (
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-[#fffdf8] rounded-xl border border-[#e5dfd2] shadow-sm p-5 animate-pulse"
              >
                <div className="w-11 h-11 bg-[#eee9de] rounded-xl mb-4" />
                <div className="h-6 bg-[#eee9de] rounded w-1/2 mb-2" />
                <div className="h-3 bg-[#f2eee6] rounded w-3/4" />
                <div className="h-3 bg-[#f2eee6] rounded w-1/2 mt-2" />
              </div>
            ))
          ) : stats ? (
            indicadores.map((s) => (
              <StatCard key={s.label} {...s} />
            ))
          ) : (
            <div className="col-span-full bg-[#fffdf8] border border-[#e5dfd2] rounded-xl p-6 text-center">
              <p className="text-sm text-[#667064]">
                No fue posible cargar los indicadores.
              </p>
              <button
                onClick={cargar}
                className="mt-3 text-sm font-semibold text-[#a45d40] hover:underline"
              >
                Intentar nuevamente
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Movimientos y alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Últimos movimientos */}
        <section className="bg-[#fffdf8] rounded-xl border border-[#e5dfd2] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e5dfd2] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#e6eee5] text-[#304b3e] flex items-center justify-center">
                <ArrowLeftRight size={19} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#29382e]">
                  Últimos movimientos
                </h3>
                <p className="text-xs text-[#929487] mt-0.5">
                  Actividad reciente del inventario
                </p>
              </div>
            </div>

            <Link
              href="/movimientos"
              className="text-xs font-semibold text-[#a45d40] hover:text-[#85462f] hover:underline whitespace-nowrap"
            >
              Ver todos →
            </Link>
          </div>

          <div className="divide-y divide-[#eee9de]">
            {cargando ? (
              [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="px-5 py-4 animate-pulse flex items-center gap-3"
                >
                  <div className="w-9 h-9 bg-[#eee9de] rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-[#eee9de] rounded w-3/4" />
                    <div className="h-2.5 bg-[#f2eee6] rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : !stats || stats.ultimos_movimientos.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-[#f2eee6] flex items-center justify-center mx-auto mb-3">
                  <ArrowLeftRight size={22} className="text-[#929487]" />
                </div>
                <p className="text-sm font-medium text-[#667064]">
                  Sin movimientos registrados
                </p>
                <p className="text-xs text-[#929487] mt-1">
                  Aquí aparecerán las entradas, salidas y ajustes.
                </p>
              </div>
            ) : (
              stats.ultimos_movimientos.map((m) => {
                const tipoColor =
                  TIPO_MOV_COLOR[m.tipo] ??
                  "text-[#667064] bg-[#eee9de]";

                const IconoMovimiento =
                  m.tipo === "ENTRADA"
                    ? ArrowDownLeft
                    : m.tipo === "SALIDA"
                      ? ArrowUpRight
                      : Repeat2;

                return (
                  <div
                    key={m.id}
                    className="px-5 py-3.5 flex items-center gap-3 hover:bg-[#f7f4ec] transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tipoColor}`}
                    >
                      <IconoMovimiento size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#29382e] truncate">
                        {m.producto_nombre}
                      </p>
                      <p className="text-xs text-[#929487] truncate mt-0.5">
                        {m.motivo || m.tipo}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-bold ${
                          m.tipo === "SALIDA"
                            ? "text-[#a45d40]"
                            : m.tipo === "ENTRADA"
                              ? "text-[#477b58]"
                              : "text-[#98702d]"
                        }`}
                      >
                        {m.tipo === "SALIDA" ? "−" : "+"}
                        {fmt(m.cantidad)}
                      </p>
                      <p className="text-[10px] text-[#929487] mt-0.5">
                        {new Date(m.fecha_movimiento).toLocaleDateString(
                          "es-CO"
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Alertas pendientes */}
        <section className="bg-[#fffdf8] rounded-xl border border-[#e5dfd2] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e5dfd2] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#f7e9e1] text-[#a45d40] flex items-center justify-center">
                <TriangleAlert size={19} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#29382e]">
                  Alertas activas
                </h3>
                <p className="text-xs text-[#929487] mt-0.5">
                  Productos que necesitan atención
                </p>
              </div>
            </div>

            <Link
              href="/alertas"
              className="text-xs font-semibold text-[#a45d40] hover:text-[#85462f] hover:underline whitespace-nowrap"
            >
              Ver todas →
            </Link>
          </div>

          <div className="divide-y divide-[#eee9de]">
            {cargando ? (
              [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="px-5 py-4 animate-pulse flex items-center gap-3"
                >
                  <div className="w-9 h-9 bg-[#eee9de] rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-[#eee9de] rounded w-3/4" />
                    <div className="h-2.5 bg-[#f2eee6] rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : !stats || stats.alertas_pendientes.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-[#e6eee5] text-[#477b58] flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-sm font-semibold text-[#29382e]">
                  ¡Sin alertas pendientes!
                </p>
                <p className="text-xs text-[#667064] mt-1">
                  No hay alertas de inventario pendientes por mostrar.
                </p>
              </div>
            ) : (
              stats.alertas_pendientes.map((a) => {
                const agotado = a.tipo === "STOCK_AGOTADO";

                return (
                  <div
                    key={a.id}
                    className="px-5 py-3.5 flex items-center gap-3 hover:bg-[#f7f4ec] transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        agotado
                          ? "bg-[#f7e9e1] text-[#a45d40]"
                          : "bg-[#f7efd9] text-[#98702d]"
                      }`}
                    >
                      {agotado ? (
                        <Ban size={18} />
                      ) : (
                        <TriangleAlert size={18} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#29382e] truncate">
                        {a.producto_nombre}
                      </p>
                      <p className="text-xs text-[#667064] truncate mt-0.5">
                        {a.mensaje}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-bold ${
                          agotado ? "text-[#a45d40]" : "text-[#98702d]"
                        }`}
                      >
                        {fmt(a.stock_actual)} uds.
                      </p>
                      <p className="text-[10px] text-[#929487] mt-0.5">
                        Mín. {fmt(a.stock_minimo)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
