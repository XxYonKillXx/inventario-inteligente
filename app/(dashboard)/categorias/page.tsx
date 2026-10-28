"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Tag,
  AlertTriangle,
  Package,
  LoaderCircle,
} from "lucide-react";
import {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "@/services/categorias.service";
import type { Categoria } from "@/services/categorias.service";

export default function CategoriasPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState<number | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      setCategorias(await listarCategorias());
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al cargar las categorías.";
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
    // La carga inicial se ejecuta al montar la página.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function abrirNuevo() {
    setEditando(null);
    setNombre("");
    setDescripcion("");
    setErrorNombre("");
    setModalAbierto(true);
  }

  function abrirEditar(cat: Categoria) {
    setEditando(cat);
    setNombre(cat.nombre);
    setDescripcion(cat.descripcion ?? "");
    setErrorNombre("");
    setModalAbierto(true);
  }

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nombreLimpio = nombre.trim();

    if (!nombreLimpio) {
      setErrorNombre("El nombre es requerido.");
      return;
    }

    setGuardando(true);
    setErrorNombre("");
    try {
      if (editando) {
        await actualizarCategoria(editando.id, {
          nombre: nombreLimpio,
          descripcion: descripcion.trim(),
        });
      } else {
        await crearCategoria({
          nombre: nombreLimpio,
          descripcion: descripcion.trim(),
        });
      }

      setModalAbierto(false);
      await cargar();
    } catch (e: unknown) {
      setErrorNombre(e instanceof Error ? e.message : "Error al guardar la categoría.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(id: number) {
    if (!confirm("¿Deseas desactivar esta categoría?")) return;

    setEliminando(id);
    try {
      await eliminarCategoria(id);
      await cargar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error al desactivar la categoría.");
    } finally {
      setEliminando(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex flex-wrap ml-auto gap-2">
          <button
            type="button"
            onClick={() => void cargar()}
            disabled={cargando}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e5dfd2] bg-[#fffdf8] px-3 py-2.5 text-sm font-medium text-[#29382e] transition-colors hover:bg-[#eee9de] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={cargando ? "animate-spin" : ""} />
            Actualizar
          </button>
          <button
            type="button"
            onClick={abrirNuevo}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243c32] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#304b3e] focus:outline-none focus:ring-2 focus:ring-[#243c32]/25"
          >
            <Plus size={17} />
            Nueva categoría
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-[#e8c7b7] bg-[#f7e9e1] px-4 py-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#a45d40]" />
          <div className="text-sm text-[#85462f]">
            <p className="font-semibold">No se pudieron cargar las categorías</p>
            <p className="mt-0.5">{error}</p>
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

      {/* Cargando */}
      {cargando ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-[#e5dfd2] bg-[#fffdf8] p-5"
            >
              <div className="mb-4 h-10 w-10 rounded-lg bg-[#eee9de]" />
              <div className="mb-2 h-4 w-3/4 rounded bg-[#eee9de]" />
              <div className="mb-4 h-3 w-full rounded bg-[#f3f0e8]" />
              <div className="mb-3 h-px bg-[#f3f0e8]" />
              <div className="h-3 w-1/2 rounded bg-[#f3f0e8]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categorias.map((cat) => (
            <article
              key={cat.id}
              className={`rounded-xl border bg-[#fffdf8] p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                cat.estado
                  ? "border-[#e5dfd2]"
                  : "border-[#e5dfd2] opacity-65"
              }`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6eee5] text-[#243c32]">
                  <Tag size={20} />
                </div>
                {!cat.estado && (
                  <span className="rounded-full bg-[#eee9de] px-2.5 py-1 text-[10px] font-semibold text-[#667064]">
                    Inactiva
                  </span>
                )}
              </div>

              <h2 className="text-sm font-semibold text-[#29382e]">{cat.nombre}</h2>
              <p className="mt-1 line-clamp-2 min-h-9 text-xs leading-relaxed text-[#667064]">
                {cat.descripcion || (
                  <span className="italic text-[#929487]">Sin descripción</span>
                )}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-[#eee9de] pt-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#667064]">
                  <Package size={14} />
                  <span className="font-semibold text-[#29382e]">
                    {cat.total_productos ?? 0}
                  </span>
                  productos
                </span>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => abrirEditar(cat)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#667064] transition-colors hover:bg-[#e6eee5] hover:text-[#243c32] focus:outline-none focus:ring-2 focus:ring-[#243c32]/20"
                    title="Editar categoría"
                    aria-label={`Editar categoría ${cat.nombre}`}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleEliminar(cat.id)}
                    disabled={eliminando === cat.id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#667064] transition-colors hover:bg-[#f7e9e1] hover:text-[#a45d40] focus:outline-none focus:ring-2 focus:ring-[#b96f50]/25 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Desactivar categoría"
                    aria-label={`Desactivar categoría ${cat.nombre}`}
                  >
                    {eliminando === cat.id ? (
                      <LoaderCircle size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}

          {categorias.length === 0 && !cargando && !error && (
            <div className="col-span-full rounded-xl border border-dashed border-[#e5dfd2] bg-[#fffdf8] px-5 py-14 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6eee5] text-[#243c32]">
                <Tag size={27} />
              </div>
              <p className="font-semibold text-[#29382e]">No hay categorías registradas</p>
              <p className="mt-1 text-sm text-[#667064]">
                Crea la primera categoría para organizar tus productos.
              </p>
            </div>
          )}

          {/* Tarjeta para agregar */}
          <button
            type="button"
            onClick={abrirNuevo}
            className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#d8d0c1] bg-transparent p-5 text-[#667064] transition-all hover:border-[#b96f50] hover:bg-[#f7e9e1]/40 hover:text-[#85462f] focus:outline-none focus:ring-2 focus:ring-[#b96f50]/25"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eee9de] text-[#85462f]">
              <Plus size={21} />
            </span>
            <span className="text-sm font-semibold">Nueva categoría</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Cerrar modal"
            className="absolute inset-0 cursor-default bg-[#18251e]/60 backdrop-blur-sm"
            onClick={() => {
              if (!guardando) setModalAbierto(false);
            }}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="categoria-modal-title"
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[#e5dfd2] bg-[#fffdf8] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#eee9de] px-6 py-4">
              <div>
                <h2
                  id="categoria-modal-title"
                  className="text-base font-bold text-[#29382e]"
                >
                  {editando ? "Editar categoría" : "Nueva categoría"}
                </h2>
                <p className="mt-0.5 text-xs text-[#667064]">
                  {editando
                    ? "Actualiza la información de esta categoría."
                    : "Completa los datos para organizar tus productos."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!guardando) setModalAbierto(false);
                }}
                disabled={guardando}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#667064] transition-colors hover:bg-[#eee9de] hover:text-[#29382e] disabled:opacity-50"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={guardar} className="space-y-4 px-6 py-5">
              <div>
                <label
                  htmlFor="categoria-nombre"
                  className="mb-1.5 block text-sm font-semibold text-[#29382e]"
                >
                  Nombre <span className="text-[#a45d40]">*</span>
                </label>
                <input
                  id="categoria-nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    setErrorNombre("");
                  }}
                  placeholder="Ej. Bebidas, ingredientes, empaques..."
                  maxLength={100}
                  autoFocus
                  aria-invalid={Boolean(errorNombre)}
                  aria-describedby={errorNombre ? "categoria-nombre-error" : undefined}
                  className={`w-full rounded-lg border bg-[#fffdf8] px-3 py-2.5 text-sm text-[#29382e] outline-none transition-all placeholder:text-[#929487] focus:ring-2 ${
                    errorNombre
                      ? "border-[#b96f50] bg-[#f7e9e1]/40 focus:border-[#b96f50] focus:ring-[#b96f50]/20"
                      : "border-[#d8d0c1] focus:border-[#b96f50] focus:ring-[#b96f50]/20"
                  }`}
                />
                {errorNombre && (
                  <p id="categoria-nombre-error" className="mt-1.5 text-xs text-[#a45d40]">
                    {errorNombre}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="categoria-descripcion"
                  className="mb-1.5 block text-sm font-semibold text-[#29382e]"
                >
                  Descripción
                </label>
                <textarea
                  id="categoria-descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe brevemente esta categoría..."
                  rows={3}
                  maxLength={500}
                  className="w-full resize-none rounded-lg border border-[#d8d0c1] bg-[#fffdf8] px-3 py-2.5 text-sm text-[#29382e] outline-none transition-all placeholder:text-[#929487] focus:border-[#b96f50] focus:ring-2 focus:ring-[#b96f50]/20"
                />
                <p className="mt-1 text-right text-[11px] text-[#929487]">
                  {descripcion.length}/500
                </p>
              </div>

              <div className="flex flex-col-reverse gap-2.5 border-t border-[#eee9de] pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  disabled={guardando}
                  className="flex-1 rounded-lg border border-[#e5dfd2] bg-[#eee9de] py-2.5 text-sm font-semibold text-[#29382e] transition-colors hover:bg-[#e5dfd2] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#243c32] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#304b3e] focus:outline-none focus:ring-2 focus:ring-[#243c32]/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {guardando && <LoaderCircle size={16} className="animate-spin" />}
                  {guardando
                    ? "Guardando..."
                    : editando
                      ? "Guardar cambios"
                      : "Crear categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
