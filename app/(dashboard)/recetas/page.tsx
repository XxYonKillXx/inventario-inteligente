"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { listarProductos } from "@/services/productos.service";
import {
  listarRecetas,
  crearReceta,
  actualizarReceta,
  cambiarEstadoReceta,
  type Receta,
  type RecetaFormData,
} from "@/services/recetas.service";
import type { Producto } from "@/services/productos.service";

type IngredienteForm = {
  producto_id: string;
  cantidad: string;
  unidad_vista: string;
};

type FormReceta = {
  nombre: string;
  descripcion: string;
  precio_venta: string;
  activa: boolean;
  ingredientes: IngredienteForm[];
};

const FormVacio = (): FormReceta => ({
  nombre: "",
  descripcion: "",
  precio_venta: "",
  activa: true,
  ingredientes: [
    { producto_id: "", cantidad: "1", unidad_vista: "unidad" },
  ],
});

const helpers = {
  parseNumeroInput: (valor: number | string) => {
    const texto = String(valor ?? "").trim();
    if (!texto) return 0;

    // Acepta tanto coma como punto decimal.
    // Si hay ambos separadores, el último se interpreta como decimal.
    let limpio = texto.replace(/[^0-9,.-]/g, "");
    const ultimaComa = limpio.lastIndexOf(",");
    const ultimoPunto = limpio.lastIndexOf(".");

    if (ultimaComa !== -1 && ultimoPunto !== -1) {
      if (ultimaComa > ultimoPunto) {
        limpio = limpio.replace(/\./g, "").replace(",", ".");
      } else {
        limpio = limpio.replace(/,/g, "");
      }
    } else if (ultimaComa !== -1) {
      limpio = limpio.replace(",", ".");
    }

    const numero = Number(limpio);
    return Number.isFinite(numero) ? numero : 0;
  },

  fmtCOP: (n: number) =>
    `$ ${Number(n || 0).toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`,

  input: (error?: boolean) => ({
    background: "var(--bg-page)",
    borderColor: error ? "var(--color-error)" : "var(--border-color)",
    color: "var(--text-primary)",
  }),

  normalizarUnidad: (valor?: string | null) =>
    String(valor ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ""),

  getUnidadInventario: (unidad?: string | null) => {
    const u = helpers.normalizarUnidad(unidad || "unidad");

    if (["kg", "kgs", "kilogramo", "kilogramos"].includes(u)) return "kg";
    if (["g", "gr", "grs", "gramo", "gramos"].includes(u)) return "g";
    if (["l", "lt", "litro", "litros"].includes(u)) return "l";
    if (["ml", "mililitro", "mililitros"].includes(u)) return "ml";
    return u || "unidad";
  },

  getUnidadVista: (unidadInventario?: string | null) => {
    const u = helpers.getUnidadInventario(unidadInventario);

    if (u === "kg") return "g";
    if (u === "l") return "ml";
    return u;
  },

  getOpcionesUnidad: (unidadInventario?: string | null) => {
    const u = helpers.getUnidadInventario(unidadInventario);

    if (u === "kg") return ["g", "kg"];
    if (u === "l") return ["ml", "l"];
    return [u];
  },

  convertirVistaAInventario: (
    cantidad: number | string,
    unidadInventario?: string | null,
    unidadVista?: string | null
  ) => {
    const valor = helpers.parseNumeroInput(cantidad);
    const inventario = helpers.getUnidadInventario(unidadInventario);
    const vista = helpers.getUnidadInventario(
      unidadVista || helpers.getUnidadVista(inventario)
    );

    if (inventario === "kg" && vista === "g") return valor / 1000;
    if (inventario === "g" && vista === "kg") return valor * 1000;
    if (inventario === "l" && vista === "ml") return valor / 1000;
    if (inventario === "ml" && vista === "l") return valor * 1000;

    return valor;
  },

  convertirInventarioAVista: (
    cantidad: number | string,
    unidadInventario?: string | null,
    unidadVista?: string | null
  ) => {
    const valor = helpers.parseNumeroInput(cantidad);
    const inventario = helpers.getUnidadInventario(unidadInventario);
    const vista = helpers.getUnidadInventario(
      unidadVista || helpers.getUnidadVista(inventario)
    );

    if (inventario === "kg" && vista === "g") {
      return { cantidad: valor * 1000, unidad: "g" };
    }
    if (inventario === "g" && vista === "kg") {
      return { cantidad: valor / 1000, unidad: "kg" };
    }
    if (inventario === "l" && vista === "ml") {
      return { cantidad: valor * 1000, unidad: "ml" };
    }
    if (inventario === "ml" && vista === "l") {
      return { cantidad: valor / 1000, unidad: "l" };
    }

    return { cantidad: valor, unidad: inventario };
  },

  formatCantidad: (valor: number | string, unidad?: string) => {
    const u = helpers.getUnidadInventario(unidad || "unidad");
    const cantidad = helpers.parseNumeroInput(valor);
    const cantidadVista =
      u === "kg" ? cantidad * 1000 :
      u === "l" ? cantidad * 1000 :
      cantidad;
    const unidadVista =
      u === "kg" ? "g" :
      u === "l" ? "ml" :
      u;

    return `${new Intl.NumberFormat("es-CO", {
      maximumFractionDigits: 3,
    }).format(cantidadVista)} ${unidadVista}`;
  },

  formatCantidadInput: (
    valor: number | string,
    unidad?: string,
    unidadVista?: string | null
  ) => {
    const resultado = helpers.convertirInventarioAVista(
      valor,
      unidad || "unidad",
      unidadVista || helpers.getUnidadVista(unidad)
    );
    return String(resultado.cantidad);
  },

  parseCantidad: (
    valor: string,
    unidadInventario?: string | null,
    unidadVista?: string | null
  ) => {
    const cantidad = helpers.convertirVistaAInventario(
      valor,
      unidadInventario || "unidad",
      unidadVista || helpers.getUnidadVista(unidadInventario)
    );
    return String(Number(cantidad.toFixed(6)));
  },

  normalizarEstado: (valor?: number | string | null) => {
    const texto = String(valor ?? "").trim().toUpperCase();
    if (texto === "ACTIVA" || texto === "1" || texto === "TRUE") return 1;
    if (texto === "INACTIVA" || texto === "0" || texto === "FALSE") return 0;
    return Number(valor ?? 1) === 0 ? 0 : 1;
  },

  formatCOPInput: (valor: string) => {
    const limpio = String(valor ?? "").replace(/[^0-9]/g, "").slice(0, 15);
    if (!limpio) return "";
    return new Intl.NumberFormat("es-CO").format(Number(limpio));
  },

  parseCOPInput: (valor: string) => {
    const limpio = String(valor ?? "").replace(/[^0-9]/g, "");
    return limpio ? String(Number(limpio)) : "";
  },

  formatPrecioDisplay: (valor: number | string) => {
    const numero = Number(valor ?? 0);
    if (!Number.isFinite(numero)) return "";
    return new Intl.NumberFormat("es-CO", {
      maximumFractionDigits: 0,
    }).format(numero);
  },

  recetaActiva: (receta?: { estado?: number | string | null }) =>
    helpers.normalizarEstado(receta?.estado) === 1,
};

export default function RecetasPage() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [editando, setEditando] = useState<Receta | null>(null);
  const [viendo, setViendo] = useState<Receta | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState<FormReceta>(FormVacio());

  const recetasActivas = useMemo(
    () => recetas.filter((r) => helpers.recetaActiva(r)),
    [recetas]
  );

  async function cargar() {
    setCargando(true);
    setError(null);

    try {
      const [lista, inventario] = await Promise.all([
        listarRecetas(busqueda ? { busqueda } : undefined),
        listarProductos(),
      ]);

      setRecetas(lista);
      setProductos(inventario.filter((p) => Number(p.estado) === 1));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las recetas."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargar();
  }, []);

  function abrirNueva() {
    setEditando(null);
    setViendo(null);
    setForm(FormVacio());
    setError(null);
    setModalOpen(true);
  }

  function abrirVer(item: Receta) {
    setViendo(item);
    setEditando(null);
    setDetalleOpen(true);
  }

  function abrirEditar(item: Receta) {
    setEditando(item);
    setViendo(null);
    setError(null);

    setForm({
      nombre: item.nombre,
      descripcion: item.descripcion || "",
      precio_venta: helpers.formatPrecioDisplay(item.precio_venta || 0),
      activa: helpers.normalizarEstado(item.estado) === 1,
      ingredientes: (item.ingredientes || []).map((ing) => {
        const unidad = ing.unidad_medida || "unidad";
        const unidadVista = helpers.getUnidadVista(unidad);

        return {
          producto_id: String(ing.producto_id),
          cantidad: helpers.formatCantidadInput(
            ing.cantidad,
            unidad,
            unidadVista
          ),
          unidad_vista: unidadVista,
        };
      }),
    });

    setModalOpen(true);
  }

  function agregarIngrediente() {
    setForm((prev) => ({
      ...prev,
      ingredientes: [
        ...prev.ingredientes,
        { producto_id: "", cantidad: "1", unidad_vista: "unidad" },
      ],
    }));
  }

  function quitarIngrediente(index: number) {
    setForm((prev) => ({
      ...prev,
      ingredientes: prev.ingredientes.filter((_, i) => i !== index),
    }));
  }

  function actualizarIngrediente(
    index: number,
    campo: "producto_id" | "cantidad" | "unidad_vista",
    valor: string
  ) {
    setForm((prev) => ({
      ...prev,
      ingredientes: prev.ingredientes.map((ing, i) => {
        if (i !== index) return ing;

        const next = { ...ing, [campo]: valor };

        if (campo === "producto_id") {
          const producto = productos.find(
            (p) => String(p.id) === String(valor)
          );

          if (producto) {
            next.unidad_vista = helpers.getUnidadVista(
              producto.unidad_medida || "unidad"
            );
            next.cantidad = "1";
          }
        }

        if (campo === "unidad_vista") {
          const producto = productos.find(
            (p) => String(p.id) === String(ing.producto_id)
          );

          if (producto) {
            const cantidadActual = helpers.parseNumeroInput(ing.cantidad);
            const cantidadInventario = helpers.convertirVistaAInventario(
              cantidadActual,
              producto.unidad_medida,
              ing.unidad_vista
            );
            next.cantidad = String(
              helpers.convertirInventarioAVista(
                cantidadInventario,
                producto.unidad_medida,
                valor
              ).cantidad
            );
          }
        }

        return next;
      }),
    }));
  }

  function validarForm(): string | null {
    if (!form.nombre.trim()) return "El nombre de la receta es obligatorio.";

    const precio = Number(helpers.parseCOPInput(form.precio_venta));
    if (!precio || precio <= 0) {
      return "El precio de venta debe ser mayor que cero.";
    }

    if (form.ingredientes.length === 0) {
      return "Debe agregar al menos un ingrediente.";
    }

    const ids = new Set<number>();

    for (const ing of form.ingredientes) {
      if (!ing.producto_id) {
        return "Cada ingrediente debe tener un producto seleccionado.";
      }

      const productoId = Number(ing.producto_id);
      const cantidad = helpers.parseNumeroInput(ing.cantidad);

      if (!productoId || cantidad <= 0) {
        return "La cantidad de cada ingrediente debe ser mayor que cero.";
      }

      if (ids.has(productoId)) {
        return "No puedes repetir el mismo ingrediente en una receta.";
      }

      ids.add(productoId);
    }

    return null;
  }

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const errorMsg = validarForm();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      const precioNumerico = Number(
        helpers.parseCOPInput(form.precio_venta)
      );

      const payload: RecetaFormData = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || "",
        precio_venta: precioNumerico,
        activa: form.activa ? 1 : 0,
        ingredientes: form.ingredientes.map((ing) => {
          const producto = productos.find(
            (p) => String(p.id) === String(ing.producto_id)
          );

          return {
            producto_id: Number(ing.producto_id),
            cantidad: Number(
              helpers.parseCantidad(
                ing.cantidad,
                producto?.unidad_medida || "unidad",
                ing.unidad_vista
              )
            ),
          };
        }),
      };

      if (editando) {
        await actualizarReceta(editando.id, payload);
      } else {
        await crearReceta(payload);
      }

      setModalOpen(false);
      setEditando(null);
      await cargar();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar la receta."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function toggleEstado(item: Receta) {
    const nuevoEstado =
      helpers.normalizarEstado(item.estado) === 1 ? 0 : 1;

    try {
      await cambiarEstadoReceta(item.id, nuevoEstado);
      await cargar();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cambiar el estado."
      );
    }
  }

  return (
    <div className="w-full space-y-5">
      {error && (
        <div className="rounded-xl border border-[var(--color-error)] bg-[var(--color-error-bg)] px-4 py-3 text-xs text-[var(--color-error)]">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void cargar()}
            placeholder="Buscar receta por nombre"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none md:max-w-xs"
            style={helpers.input()}
          />
          <button
            type="button"
            onClick={() => void cargar()}
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={abrirNueva}
            className="ml-auto rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
          >
            Nueva receta
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
        <div className="border-b border-[var(--border-color)] px-5 py-3 text-sm text-[var(--text-secondary)]">
          {cargando
            ? "Cargando..."
            : `${recetas.length} receta${recetas.length !== 1 ? "s" : ""}`}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-muted)] text-left">
                <th className="px-4 py-3">Receta</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Ingredientes</th>
                <th className="px-4 py-3">Costo estimado</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-[var(--text-muted)]"
                  >
                    Cargando recetas...
                  </td>
                </tr>
              ) : recetas.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-[var(--text-muted)]"
                  >
                    No hay recetas registradas.
                  </td>
                </tr>
              ) : (
                recetas.map((receta) => (
                  <tr
                    key={receta.id}
                    className="border-b border-[var(--border-color)] hover:bg-[var(--bg-muted)]"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[var(--text-primary)]">
                        {receta.nombre}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {receta.descripcion || "Sin descripción"}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {helpers.fmtCOP(Number(receta.precio_venta))}
                    </td>
                    <td className="px-4 py-3">
                      {receta.ingredientes?.length ? (
                        <div className="space-y-1">
                          {receta.ingredientes.slice(0, 3).map((ing, idx) => (
                            <div
                              key={`${receta.id}-${ing.producto_id || idx}`}
                              className="text-xs text-[var(--text-secondary)]"
                            >
                              {ing.producto_nombre || "Ingrediente"}:{" "}
                              {helpers.formatCantidad(
                                ing.cantidad || 0,
                                ing.unidad_medida || "unidad"
                              )}
                            </div>
                          ))}
                          {receta.ingredientes.length > 3 && (
                            <div className="text-[10px] text-[var(--text-muted)]">
                              +{receta.ingredientes.length - 3} más
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)]">
                          Sin ingredientes
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {helpers.fmtCOP(Number(receta.costo_estimado ?? 0))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          helpers.normalizarEstado(receta.estado) === 1
                            ? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                            : "bg-[var(--color-error-bg)] text-[var(--color-error)]"
                        }`}
                      >
                        {helpers.normalizarEstado(receta.estado) === 1
                          ? "Activa"
                          : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => abrirVer(receta)}
                          className="rounded-lg border border-[var(--border-color)] px-2.5 py-1.5 text-xs font-medium"
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() => abrirEditar(receta)}
                          className="rounded-lg border border-[var(--border-color)] px-2.5 py-1.5 text-xs font-medium"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleEstado(receta)}
                          className="rounded-lg border border-[var(--border-color)] px-2.5 py-1.5 text-xs font-medium"
                        >
                          {helpers.normalizarEstado(receta.estado) === 1
                            ? "Inactivar"
                            : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[var(--bg-card)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {editando ? "Editar receta" : "Nueva receta"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg px-2 py-1 text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={guardar} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                    Nombre
                  </label>
                  <input
                    value={form.nombre}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, nombre: e.target.value }))
                    }
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                    style={helpers.input()}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                    Descripción
                  </label>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        descripcion: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                    rows={3}
                    style={helpers.input()}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                    Precio de venta
                  </label>
                  <input
                    value={form.precio_venta}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        precio_venta: helpers.formatCOPInput(e.target.value),
                      }))
                    }
                    type="text"
                    inputMode="numeric"
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                    style={helpers.input()}
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex w-full items-center justify-between rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-2.5 text-sm">
                    <span className="text-[var(--text-primary)]">
                      Receta activa
                    </span>
                    <input
                      type="checkbox"
                      checked={form.activa}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          activa: e.target.checked,
                        }))
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Ingredientes
                  </h3>
                  <button
                    type="button"
                    onClick={agregarIngrediente}
                    className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    + Ingrediente
                  </button>
                </div>

                {form.ingredientes.map((ing, idx) => {
                  const producto = productos.find(
                    (p) => String(p.id) === String(ing.producto_id)
                  );
                  const unidad = producto?.unidad_medida || "unidad";
                  const opciones = helpers.getOpcionesUnidad(unidad);
                  const unidadVista =
                    ing.unidad_vista || helpers.getUnidadVista(unidad);

                  return (
                    <div
                      key={idx}
                      className="grid gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-3 md:grid-cols-[1.5fr_1fr_0.9fr_auto] md:items-center"
                    >
                      <select
                        value={ing.producto_id}
                        onChange={(e) =>
                          actualizarIngrediente(
                            idx,
                            "producto_id",
                            e.target.value
                          )
                        }
                        className="rounded-lg border px-3 py-2 text-sm outline-none"
                        style={helpers.input()}
                      >
                        <option value="">Seleccionar producto</option>
                        {productos.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.nombre} ({prod.unidad_medida || "unidad"})
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        inputMode="decimal"
                        value={ing.cantidad}
                        onChange={(e) =>
                          actualizarIngrediente(
                            idx,
                            "cantidad",
                            e.target.value.replace(/[^0-9.,]/g, "")
                          )
                        }
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                        placeholder={`Cantidad (${unidadVista})`}
                        style={helpers.input()}
                      />

                      <select
                        value={unidadVista}
                        onChange={(e) =>
                          actualizarIngrediente(
                            idx,
                            "unidad_vista",
                            e.target.value
                          )
                        }
                        className="rounded-lg border px-3 py-2 text-sm outline-none"
                        style={helpers.input()}
                      >
                        {opciones.map((op) => (
                          <option key={op} value={op}>
                            {op.toUpperCase()}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => quitarIngrediente(idx)}
                        className="rounded-lg border border-[var(--color-error)] px-3 py-2 text-xs font-semibold text-[var(--color-error)]"
                        disabled={form.ingredientes.length === 1}
                      >
                        Quitar
                      </button>
                    </div>
                  );
                })}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-lg border border-[var(--border-color)] px-4 py-2 text-sm font-medium text-[var(--text-primary)]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando}
                    className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {guardando
                      ? "Guardando..."
                      : editando
                        ? "Guardar cambios"
                        : "Crear receta"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {detalleOpen && viendo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setDetalleOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[var(--bg-card)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Detalle de la receta
              </h2>
              <button
                type="button"
                onClick={() => setDetalleOpen(false)}
                className="rounded-lg px-2 py-1 text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  Nombre
                </div>
                <div className="text-base font-semibold text-[var(--text-primary)]">
                  {viendo.nombre}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  Descripción
                </div>
                <div className="text-sm text-[var(--text-primary)]">
                  {viendo.descripcion || "Sin descripción"}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                    Precio de venta
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {helpers.fmtCOP(Number(viendo.precio_venta || 0))}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                    Estado
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {helpers.normalizarEstado(viendo.estado) === 1
                      ? "Activa"
                      : "Inactiva"}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  Ingredientes
                </div>
                {viendo.ingredientes?.length ? (
                  <div className="space-y-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-3">
                    {viendo.ingredientes.map((ing, idx) => (
                      <div
                        key={`${viendo.id}-${ing.producto_id ?? idx}`}
                        className="flex items-center justify-between gap-3 border-b border-[var(--border-color)] pb-2 last:border-none last:pb-0"
                      >
                        <span className="text-sm text-[var(--text-primary)]">
                          {ing.producto_nombre || "Ingrediente"}
                        </span>
                        <span className="text-sm font-medium text-[var(--text-secondary)]">
                          {helpers.formatCantidad(
                            ing.cantidad || 0,
                            ing.unidad_medida || "unidad"
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-3 text-sm text-[var(--text-muted)]">
                    Sin ingredientes asociados.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}