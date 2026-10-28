"use client";

import { useEffect, useState } from "react";
import { listarRecetas } from "@/services/recetas.service";
import { listarVentas, registrarVenta, anularVenta, type Venta } from "@/services/ventas.service";

const fmtCOP = (n: number) =>
  `$ ${Number(n || 0).toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export default function VentasPage() {
  const [recetas, setRecetas] = useState<any[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Array<{ receta_id: string; cantidad: string }>>([
    { receta_id: "", cantidad: "1" },
  ]);
  const [impuestos, setImpuestos] = useState("0");
  const [observaciones, setObservaciones] = useState("");

  async function cargar() {
    setLoading(true);
    try {
      const [listaRecetas, listaVentas] = await Promise.all([
        listarRecetas(),
        listarVentas(),
      ]);
      setRecetas(listaRecetas.filter((r) => Number(r.estado) === 1));
      setVentas(listaVentas);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar ventas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function addItem() {
    setItems((prev) => [...prev, { receta_id: "", cantidad: "1" }]);
  }

  function updateItem(index: number, field: "receta_id" | "cantidad", value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const lineas = items
    .map((item) => {
      const receta = recetas.find((r) => String(r.id) === item.receta_id);
      const cantidad = Number(item.cantidad || 0);
      if (!receta || cantidad <= 0) return null;
      return {
        receta,
        cantidad,
        subtotal: Number(receta.precio_venta) * cantidad,
      };
    })
    .filter(Boolean) as Array<{ receta: any; cantidad: number; subtotal: number }>;

  const subtotalGeneral = lineas.reduce((sum, line) => sum + line.subtotal, 0);
  const impuestosNum = Number(impuestos || 0);
  const total = subtotalGeneral + impuestosNum;

  async function guardarVenta() {
    if (!items.some((item) => item.receta_id)) {
      setError("Debe seleccionar al menos una receta.");
      return;
    }

    const payload = {
      items: items
        .filter((item) => item.receta_id)
        .map((item) => ({
          receta_id: Number(item.receta_id),
          cantidad: Number(item.cantidad || 0),
        })),
      impuestos: Number(impuestos || 0),
      observaciones,
    };

    try {
      setError(null);
      await registrarVenta(payload);
      setItems([{ receta_id: "", cantidad: "1" }]);
      setImpuestos("0");
      setObservaciones("");
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar la venta.");
    }
  }

  async function handleAnular(id: number) {
    try {
      await anularVenta(id);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo anular la venta.");
    }
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl border border-[var(--color-error)] bg-[var(--color-error-bg)] px-4 py-3 text-xs text-[var(--color-error)]">
          {error}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-[var(--text-primary)]">Registrar venta</h2>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-3 md:grid-cols-[1.5fr_0.7fr_auto]">
                <select
                  value={item.receta_id}
                  onChange={(e) => updateItem(index, "receta_id", e.target.value)}
                  className="rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ background: "var(--bg-page)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                >
                  <option value="">Seleccione una receta</option>
                  {recetas.map((receta) => (
                    <option key={receta.id} value={receta.id}>
                      {receta.nombre} — {fmtCOP(receta.precio_venta)}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={item.cantidad}
                  onChange={(e) => updateItem(index, "cantidad", e.target.value)}
                  className="rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ background: "var(--bg-page)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                />

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="rounded-lg border border-[var(--color-error)] px-3 py-2 text-xs font-semibold text-[var(--color-error)]"
                  disabled={items.length === 1}
                >
                  Quitar
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addItem}
              className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white"
            >
              + Agregar plato
            </button>

            <div className="pt-3">
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Impuestos</label>
              <input
                value={impuestos}
                onChange={(e) => setImpuestos(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{ background: "var(--bg-page)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Observaciones</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{ background: "var(--bg-page)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-[var(--text-primary)]">Resumen</h3>
          <div className="space-y-3">
            {lineas.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No hay platos agregados.</p>
            ) : (
              lineas.map((line) => (
                <div key={line.receta.id} className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-[var(--text-primary)]">{line.receta.nombre}</span>
                    <span className="text-sm text-[var(--text-secondary)]">{line.cantidad} x {fmtCOP(line.receta.precio_venta)}</span>
                  </div>
                  <div className="mt-1 text-right font-semibold text-[var(--text-primary)]">{fmtCOP(line.subtotal)}</div>
                </div>
              ))
            )}

            <div className="space-y-2 border-t border-[var(--border-color)] pt-3 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{fmtCOP(subtotalGeneral)}</span></div>
              <div className="flex justify-between"><span>Impuestos</span><span>{fmtCOP(impuestosNum)}</span></div>
              <div className="flex justify-between text-base font-bold text-[var(--text-primary)]"><span>Total</span><span>{fmtCOP(total)}</span></div>
            </div>

            <button
              onClick={guardarVenta}
              className="mt-4 w-full rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Confirmar venta
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
        <div className="border-b border-[var(--border-color)] px-5 py-3 text-sm text-[var(--text-secondary)]">
          {loading ? "Cargando ventas..." : `${ventas.length} venta${ventas.length !== 1 ? "s" : ""}`}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-muted)] text-left">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr key={venta.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-muted)]">
                  <td className="px-4 py-3 font-medium">{venta.numero_venta}</td>
                  <td className="px-4 py-3">{new Date(venta.fecha_venta).toLocaleString("es-CO")}</td>
                  <td className="px-4 py-3 font-semibold">{fmtCOP(venta.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      venta.estado === "ANULADA"
                        ? "bg-[var(--color-error-bg)] text-[var(--color-error)]"
                        : "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                    }`}>
                      {venta.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {venta.estado !== "ANULADA" && (
                      <button
                        onClick={() => handleAnular(venta.id)}
                        className="rounded-lg border border-[var(--color-error)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-error)]"
                      >
                        Anular
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
