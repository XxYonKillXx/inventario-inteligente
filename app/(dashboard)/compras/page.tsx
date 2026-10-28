"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listarCompras, crearCompra, actualizarEstadoCompra } from "@/services/compras.service";
import { listarProveedores } from "@/services/proveedores.service";
import { listarProductos } from "@/services/productos.service";
import type { Compra } from "@/services/compras.service";
import type { Proveedor } from "@/services/proveedores.service";
import type { Producto } from "@/services/productos.service";
import { Plus, X, RefreshCw, } from "lucide-react";

const ESTADO_CFG = {
  PENDIENTE: { cls: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]", label: "Pendiente" },
  RECIBIDA:  { cls: "bg-[var(--color-success-bg)] text-[var(--color-success)]", label: "Recibida"  },
  ANULADA:   { cls: "bg-[var(--color-error-bg)]   text-[var(--color-error)]",   label: "Anulada"   },
};

interface Item { producto_id: number; cantidad: number; precio_unitario: number; }

export default function ComprasPage() {
  const router = useRouter();
  const [compras, setCompras]         = useState<Compra[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos]     = useState<Producto[]>([]);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [modal, setModal]             = useState(false);

  /* form */
  const [proveedorId, setProveedorId] = useState("");
  const [impuestos, setImpuestos]     = useState(0);
  const [obs, setObs]                 = useState("");
  const [items, setItems]             = useState<Item[]>([{ producto_id: 0, cantidad: 1, precio_unitario: 0 }]);
  const [guardando, setGuardando]     = useState(false);
  const [errForm, setErrForm]         = useState("");

  const fmtCOP = (n: number) =>
    Number(n).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });

  async function cargar() {
    setCargando(true); setError(null);
    try {
      const [c, p, pr] = await Promise.all([listarCompras(), listarProveedores(), listarProductos()]);
      setCompras(c); setProveedores(p); setProductos(pr);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error";
      if (msg.includes("401") || msg.includes("Token")) { router.replace("/login"); return; }
      setError(msg);
    } finally { setCargando(false); }
  }

  useEffect(() => { cargar(); }, []);

  function abrirModal() {
    setProveedorId(""); setImpuestos(0); setObs(""); setErrForm("");
    setItems([{ producto_id: 0, cantidad: 1, precio_unitario: 0 }]);
    setModal(true);
  }

  const itemsValidos = items.filter(
    (i) =>
      i.producto_id > 0 &&
      i.cantidad > 0 &&
      i.precio_unitario > 0
  );

  const subtotalCompra = itemsValidos.reduce(
    (s, i) => s + i.cantidad * i.precio_unitario,
    0
  );

  const totalCompra = subtotalCompra + impuestos;

  function agregarItem() { setItems([...items, { producto_id: 0, cantidad: 1, precio_unitario: 0 }]); }
  function quitarItem(idx: number) { setItems(items.filter((_, i) => i !== idx)); }
  function cambiarItem(idx: number, campo: keyof Item, val: number) {
    setItems(items.map((it, i) => i === idx ? { ...it, [campo]: val } : it));
  }

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    if (!proveedorId) { setErrForm("Selecciona un proveedor."); return; }
    const itemsValidos = items.filter(i => i.producto_id > 0 && i.cantidad > 0 && i.precio_unitario > 0);
    if (!itemsValidos.length) { setErrForm("Agrega al menos un producto válido."); return; }
    setGuardando(true); setErrForm("");
    try {
      await crearCompra({ proveedor_id: Number(proveedorId), items: itemsValidos, impuestos, observaciones: obs });
      setModal(false); cargar();
    } catch (e: unknown) { setErrForm(e instanceof Error ? e.message : "Error al registrar"); }
    finally { setGuardando(false); }
  }

  async function cambiarEstado(id: number, estado: "RECIBIDA" | "ANULADA") {
    if (!confirm(`¿${estado === "ANULADA" ? "Anular" : "Marcar como recibida"} esta compra?`)) return;
    try { await actualizarEstadoCompra(id, estado); cargar(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Error"); }
  }

  /* ── render ── */
  return (
    <div className="space-y-5 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className=" ml-auto flex gap-2">
          <button
            onClick={cargar}
            disabled={cargando}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border transition-colors disabled:opacity-50"
            style={{
              borderColor: "var(--border-color)",
              color: "var(--text-secondary)",
              background: "var(--bg-card)",
            }}
          >
            <RefreshCw
              size={15}
              className={cargando ? "animate-spin" : ""}
            />
            {cargando ? "Cargando..." : "Actualizar"}
          </button>
          <button onClick={abrirModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90 shadow-sm"
            style={{ background: "var(--color-primary)" }}>
            <Plus /> Nueva compra
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl border text-xs" style={{ background: "var(--color-error-bg)", borderColor: "var(--color-error)", color: "var(--color-error)" }}>
          {error}
        </div>
      )}

      {/* Tabla historial */}
      <div className="rounded-xl border shadow-sm overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border-color)", background: "var(--bg-muted)" }}>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Historial de compras</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ background: "var(--bg-muted)", borderColor: "var(--border-color)" }}>
                {["N° Compra","Fecha","Proveedor","Total","Estado","Acciones"].map(c => (
                  <th key={c} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "var(--text-secondary)" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: "var(--border-color)" }}>
                    <td colSpan={6} className="px-4 py-3"><div className="h-4 rounded animate-pulse" style={{ background: "var(--bg-muted)" }} /></td>
                  </tr>
                ))
              ) : compras.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  No hay compras registradas. ¡Crea la primera!
                </td></tr>
              ) : compras.map(c => {
                const cfg = ESTADO_CFG[c.estado as keyof typeof ESTADO_CFG] ?? ESTADO_CFG.PENDIENTE;
                return (
                  <tr key={c.id} className="border-b transition-colors hover:bg-[var(--bg-muted)]"
                    style={{ borderColor: "var(--border-color)" }}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: "var(--color-primary)" }}>{c.numero_compra}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{new Date(c.fecha_compra).toLocaleDateString("es-CO")}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{c.proveedor_nombre}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-primary)" }}>{fmtCOP(c.total)}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span></td>
                    <td className="px-4 py-3">
                      {c.estado === "PENDIENTE" && (
                        <div className="flex gap-2 text-xs font-medium">
                          <button onClick={() => cambiarEstado(c.id, "RECIBIDA")} style={{ color: "var(--color-success)" }} className="hover:underline">Recibida</button>
                          <span style={{ color: "var(--border-color)" }}>|</span>
                          <button onClick={() => cambiarEstado(c.id, "ANULADA")} style={{ color: "var(--color-error)" }} className="hover:underline">Anular</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ MODAL NUEVA COMPRA ═══ */}
      {modal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{backgroundColor:"rgba(36,60,50,0.6)",backdropFilter:"blur(4px)"}}
          onClick={()=>setModal(false)}
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative w-full max-w-2xl rounded-2xl shadow-2xl"
              style={{background:"var(--bg-card)"}}
              onClick={e=>e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{borderColor:"var(--border-color)"}}>
                <h2 className="text-base font-semibold" style={{color:"var(--text-primary)"}}>Nueva compra</h2>
                <button onClick={()=>setModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-muted)] transition-colors" style={{color:"var(--text-muted)"}}><X/></button>
              </div>

              {/* Body */}
              <form onSubmit={registrar} id="form-compra" className="px-6 py-5 space-y-5">
              {errForm && (
                <div className="px-3 py-2 rounded-lg text-xs" style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}>{errForm}</div>
              )}

              {/* Info general */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                    Proveedor <span style={{ color: "var(--color-error)" }}>*</span>
                  </label>
                  <select value={proveedorId} onChange={e => setProveedorId(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none"
                    style={{ background: "var(--bg-page)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
                    <option value="">Selecciona un proveedor...</option>
                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Impuestos ($)</label>
                  <input type="number" min="0" value={impuestos} onChange={e => setImpuestos(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none"
                    style={{ background: "var(--bg-page)", borderColor: "var(--border-color)", color: "var(--text-primary)" }} />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Observaciones</label>
                  <input type="text" value={obs} placeholder="Notas de la compra..." onChange={e => setObs(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none"
                    style={{ background: "var(--bg-page)", borderColor: "var(--border-color)", color: "var(--text-primary)" }} />
                </div>
              </div>

              {/* Productos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Productos</span>
                  <button type="button" onClick={agregarItem}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors"
                    style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)", background: "var(--color-primary-light)" }}>
                    + Agregar producto
                  </button>
                </div>
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-color)" }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ background: "var(--bg-muted)", borderColor: "var(--border-color)" }}>
                        {["Producto","Cantidad","Precio unitario","Subtotal",""].map(c => (
                          <th key={c} className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                            style={{ color: "var(--text-secondary)" }}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx} className="border-b" style={{ borderColor: "var(--border-color)" }}>
                          <td className="px-3 py-2">
                            <select value={item.producto_id} onChange={e => cambiarItem(idx, "producto_id", Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border outline-none min-w-[180px]"
                              style={{ background: "var(--bg-page)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
                              <option value={0}>Seleccionar...</option>
                              {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.unidad_medida})</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input type="number" min="0.001" step="0.001" value={item.cantidad}
                              onChange={e => cambiarItem(idx, "cantidad", Number(e.target.value))}
                              className="w-20 px-2.5 py-1.5 text-xs rounded-lg border outline-none"
                              style={{ background: "var(--bg-page)", borderColor: "var(--border-color)", color: "var(--text-primary)" }} />
                          </td>
                          <td className="px-3 py-2">
                            <input type="number" min="0" step="0.01" value={item.precio_unitario}
                              onChange={e => cambiarItem(idx, "precio_unitario", Number(e.target.value))}
                              className="w-28 px-2.5 py-1.5 text-xs rounded-lg border outline-none"
                              style={{ background: "var(--bg-page)", borderColor: "var(--border-color)", color: "var(--text-primary)" }} />
                          </td>
                          <td className="px-3 py-2 font-medium text-xs" style={{ color: "var(--text-primary)" }}>
                            {fmtCOP(item.cantidad * item.precio_unitario)}
                          </td>
                          <td className="px-3 py-2">
                            {items.length > 1 && (
                              <button type="button" onClick={() => quitarItem(idx)} className="text-base leading-none" style={{ color: "var(--color-error)" }}>✕</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "var(--border-color)", background: "var(--bg-muted)" }}>
                    <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Total:</span>
                    <span className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{fmtCOP(totalCompra)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: "var(--border-color)" }}>
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 py-2.5 text-sm font-medium rounded-xl border transition-colors"
                  style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)", background: "var(--bg-page)" }}>
                  Cancelar
                </button>
                <button type="submit" form="form-compra" disabled={guardando}
                  className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--color-primary)" }}>
                  {guardando ? "Registrando..." : "Registrar compra"}
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}