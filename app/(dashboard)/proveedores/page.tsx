"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Pencil,
  X,
  Truck,
  RefreshCw,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Users,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";

import {
  listarProveedores,
  crearProveedor,
  actualizarProveedor,
} from "@/services/proveedores.service";
import type { Proveedor } from "@/services/proveedores.service";

type FormProv = {
  nombre: string;
  nit: string;
  telefono: string;
  correo: string;
  direccion: string;
  contacto: string;
  observaciones: string;
};

const FORM_VACIO: FormProv = {
  nombre: "",
  nit: "",
  telefono: "",
  correo: "",
  direccion: "",
  contacto: "",
  observaciones: "",
};

const inputClass =
  "w-full rounded-lg border border-[#d8d0c1] bg-[#fffdf8] px-3 py-2.5 text-sm text-[#29382e] outline-none transition-colors placeholder:text-[#929487] focus:border-[#b96f50] focus:ring-2 focus:ring-[#b96f50]/20";

export default function ProveedoresPage() {
  const router = useRouter();

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Proveedor | null>(null);
  const [form, setForm] = useState<FormProv>(FORM_VACIO);
  const [errores, setErrores] = useState<Partial<FormProv>>({});
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    setError(null);

    try {
      const resultado = await listarProveedores();
      setProveedores(resultado);
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : "No fue posible cargar los proveedores.";

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
    // Carga inicial del directorio de proveedores.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const termino = busqueda.trim().toLowerCase();

  const filtrados = proveedores.filter((p) => {
    return (
      p.nombre.toLowerCase().includes(termino) ||
      (p.contacto ?? "").toLowerCase().includes(termino) ||
      (p.nit ?? "").toLowerCase().includes(termino) ||
      (p.correo ?? "").toLowerCase().includes(termino) ||
      (p.telefono ?? "").toLowerCase().includes(termino)
    );
  });

  function abrirNuevo() {
    setEditando(null);
    setForm(FORM_VACIO);
    setErrores({});
    setModalAbierto(true);
  }

  function abrirEditar(p: Proveedor) {
    setEditando(p);

    setForm({
      nombre: p.nombre,
      nit: p.nit ?? "",
      telefono: p.telefono ?? "",
      correo: p.correo ?? "",
      direccion: p.direccion ?? "",
      contacto: p.contacto ?? "",
      observaciones: p.observaciones ?? "",
    });

    setErrores({});
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando) return;

    setModalAbierto(false);
    setEditando(null);
    setForm(FORM_VACIO);
    setErrores({});
  }

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nombre = form.nombre.trim();

    if (!nombre) {
      setErrores({ nombre: "El nombre del proveedor es obligatorio." });
      return;
    }

    if (
      form.correo.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())
    ) {
      setErrores({
        correo: "Ingresa un correo electrónico válido.",
      });
      return;
    }

    setGuardando(true);
    setErrores({});
    setError(null);

    const datos: FormProv = {
      ...form,
      nombre,
      nit: form.nit.trim(),
      telefono: form.telefono.trim(),
      correo: form.correo.trim(),
      direccion: form.direccion.trim(),
      contacto: form.contacto.trim(),
      observaciones: form.observaciones.trim(),
    };

    try {
      if (editando) {
        await actualizarProveedor(editando.id, datos);
      } else {
        await crearProveedor(datos);
      }

      setModalAbierto(false);
      setEditando(null);
      setForm(FORM_VACIO);
      setErrores({});

      await cargar();
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : "No fue posible guardar el proveedor.";

      setErrores({ nombre: msg });
    } finally {
      setGuardando(false);
    }
  }

  type Campo = {
    key: keyof FormProv;
    label: string;
    required: boolean;
    placeholder: string;
    span: 1 | 2;
    type?: string;
    textarea?: boolean;
    icon?: React.ElementType;
  };

  const campos: Campo[] = [
    {
      key: "nombre",
      label: "Nombre del proveedor",
      required: true,
      placeholder: "Nombre de la empresa o proveedor",
      span: 2,
      icon: Building2,
    },
    {
      key: "nit",
      label: "NIT / Identificación",
      required: false,
      placeholder: "Ej. 900.123.456-7",
      span: 1,
      icon: FileText,
    },
    {
      key: "telefono",
      label: "Teléfono",
      required: false,
      placeholder: "Número de contacto",
      span: 1,
      type: "tel",
      icon: Phone,
    },
    {
      key: "correo",
      label: "Correo electrónico",
      required: false,
      placeholder: "correo@proveedor.com",
      span: 2,
      type: "email",
      icon: Mail,
    },
    {
      key: "contacto",
      label: "Persona de contacto",
      required: false,
      placeholder: "Nombre de la persona encargada",
      span: 1,
      icon: Users,
    },
    {
      key: "direccion",
      label: "Dirección",
      required: false,
      placeholder: "Dirección del proveedor",
      span: 1,
      icon: MapPin,
    },
    {
      key: "observaciones",
      label: "Observaciones",
      required: false,
      placeholder: "Información adicional del proveedor...",
      span: 2,
      textarea: true,
      icon: FileText,
    },
  ];

  const totalCompras = proveedores.reduce(
    (total, p) => total + Number(p.total_compras ?? 0),
    0
  );

  const estadisticas = [
    {
      titulo: "Proveedores registrados",
      valor: proveedores.length,
      icono: Truck,
      fondo: "bg-[#e6eee5]",
      color: "text-[#243c32]",
    },
    {
      titulo: "Resultados de búsqueda",
      valor: filtrados.length,
      icono: Search,
      fondo: "bg-[#f7e9e1]",
      color: "text-[#85462f]",
    },
    {
      titulo: "Compras asociadas",
      valor: totalCompras,
      icono: ShoppingCart,
      fondo: "bg-[#f7efd9]",
      color: "text-[#98702d]",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap ml-auto gap-2">
          <button
            type="button"
            onClick={() => void cargar()}
            disabled={cargando}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e5dfd2] bg-[#fffdf8] px-3 py-2.5 text-xs font-semibold text-[#243c32] transition-colors hover:bg-[#e6eee5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={cargando ? "animate-spin" : ""}
            />
            Actualizar
          </button>

          <button
            type="button"
            onClick={abrirNuevo}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243c32] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#304b3e]"
          >
            <Plus size={17} />
            Nuevo proveedor
          </button>
        </div>
      </div>

      {/* Error general */}
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
              className="mt-2 font-semibold underline underline-offset-2"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Indicadores */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {estadisticas.map((estadistica) => {
          const Icono = estadistica.icono;

          return (
            <div
              key={estadistica.titulo}
              className="rounded-xl border border-[#e5dfd2] bg-[#fffdf8] p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${estadistica.fondo} ${estadistica.color}`}
                >
                  <Icono size={20} />
                </div>

                <span className="text-2xl font-bold tabular-nums text-[#29382e]">
                  {cargando ? "—" : estadistica.valor.toLocaleString("es-CO")}
                </span>
              </div>

              <p className="mt-3 text-xs font-medium text-[#667064]">
                {estadistica.titulo}
              </p>
            </div>
          );
        })}
      </section>

      {/* Búsqueda */}
      <section className="rounded-xl border border-[#e5dfd2] bg-[#fffdf8] p-4 shadow-sm sm:p-5">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-[#29382e]">
            Buscar proveedores
          </h2>
          <p className="mt-1 text-xs text-[#667064]">
            Busca por nombre, NIT, persona de contacto, teléfono o correo.
          </p>
        </div>

        <div className="relative max-w-xl">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#929487]"
          />

          <input
            type="search"
            aria-label="Buscar proveedores"
            placeholder="Buscar proveedor, NIT, contacto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={`${inputClass} pl-10 pr-10`}
          />

          {busqueda && (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={() => setBusqueda("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#929487] transition-colors hover:bg-[#eee9de] hover:text-[#29382e]"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {busqueda && (
          <p className="mt-3 text-xs text-[#667064]">
            Se encontraron{" "}
            <span className="font-bold text-[#29382e]">
              {filtrados.length}
            </span>{" "}
            resultado{filtrados.length !== 1 ? "s" : ""}.
          </p>
        )}
      </section>

      {/* Tabla */}
      <section className="overflow-hidden rounded-xl border border-[#e5dfd2] bg-[#fffdf8] shadow-sm">
        <div className="flex flex-col gap-2 border-b border-[#eee9de] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-sm font-bold text-[#29382e]">
              Directorio de proveedores
            </h2>
            <p className="mt-1 text-xs text-[#667064]">
              {cargando
                ? "Cargando información..."
                : `${filtrados.length} proveedor${filtrados.length !== 1 ? "es" : ""} encontrado${filtrados.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <span className="inline-flex items-center gap-2 self-start rounded-lg bg-[#e6eee5] px-3 py-2 text-xs font-medium text-[#315b3b] sm:self-auto">
            <CheckCircle2 size={15} />
            Directorio
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-sm">
            <thead>
              <tr className="border-b border-[#e5dfd2] bg-[#f7f4ec]">
                {[
                  "Proveedor",
                  "NIT",
                  "Contacto",
                  "Teléfono",
                  "Correo",
                  "Compras",
                  "Acciones",
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
              {cargando ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-4">
                      <div className="h-5 animate-pulse rounded bg-[#eee9de]" />
                    </td>
                  </tr>
                ))
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eee9de] text-[#667064]">
                      {busqueda ? (
                        <Search size={22} />
                      ) : (
                        <Truck size={22} />
                      )}
                    </div>

                    <p className="font-semibold text-[#29382e]">
                      {busqueda
                        ? "No se encontraron resultados"
                        : "No hay proveedores registrados"}
                    </p>

                    <p className="mt-1 text-xs text-[#667064]">
                      {busqueda
                        ? "Intenta buscar con otro nombre, NIT o contacto."
                        : "Agrega un proveedor para comenzar a gestionar las compras."}
                    </p>

                    {busqueda ? (
                      <button
                        type="button"
                        onClick={() => setBusqueda("")}
                        className="mt-3 text-xs font-semibold text-[#85462f] underline underline-offset-2"
                      >
                        Limpiar búsqueda
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={abrirNuevo}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#243c32] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#304b3e]"
                      >
                        <Plus size={15} />
                        Registrar proveedor
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtrados.map((p) => (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-[#f7f4ec]/70"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6eee5] text-sm font-bold uppercase text-[#243c32]">
                          {p.nombre.trim().charAt(0) || "P"}
                        </div>

                        <div className="min-w-0">
                          <p
                            className="max-w-[200px] truncate font-semibold text-[#29382e]"
                            title={p.nombre}
                          >
                            {p.nombre}
                          </p>

                          <p
                            className="mt-1 max-w-[200px] truncate text-xs text-[#929487]"
                            title={p.direccion ?? ""}
                          >
                            {p.direccion || "Sin dirección registrada"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[#667064]">
                      {p.nit || "—"}
                    </td>

                    <td className="px-4 py-3 text-[#667064]">
                      {p.contacto || "—"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-xs text-[#667064]">
                      {p.telefono || "—"}
                    </td>

                    <td className="px-4 py-3 text-xs text-[#85462f]">
                      {p.correo ? (
                        <a
                          href={`mailto:${p.correo}`}
                          className="transition-colors hover:text-[#a45d40] hover:underline"
                        >
                          {p.correo}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f7efd9] px-2.5 py-1 text-xs font-semibold text-[#805e27]">
                        <ShoppingCart size={13} />
                        {Number(p.total_compras ?? 0).toLocaleString("es-CO")}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => abrirEditar(p)}
                        aria-label={`Editar proveedor ${p.nombre}`}
                        title="Editar proveedor"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-[#667064] transition-colors hover:border-[#e5dfd2] hover:bg-[#e6eee5] hover:text-[#243c32]"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-start gap-2 border-t border-[#eee9de] bg-[#f7f4ec]/70 px-4 py-3">
          <Truck size={15} className="mt-0.5 shrink-0 text-[#667064]" />
          <p className="text-xs leading-5 text-[#667064]">
            Mantén actualizados los datos de contacto para facilitar el
            seguimiento de los pedidos y la planificación de las compras.
          </p>
        </div>
      </section>

      {/* Modal de crear y editar */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Cerrar ventana"
            className="absolute inset-0 cursor-default bg-[#29382e]/60 backdrop-blur-sm"
            onClick={cerrarModal}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-proveedor"
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#e5dfd2] bg-[#fffdf8] shadow-2xl"
          >
            {/* Encabezado del modal */}
            <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-[#eee9de] bg-[#fffdf8] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6eee5] text-[#243c32]">
                  {editando ? (
                    <Pencil size={19} />
                  ) : (
                    <Plus size={20} />
                  )}
                </div>

                <div>
                  <h2
                    id="titulo-modal-proveedor"
                    className="text-base font-bold text-[#29382e]"
                  >
                    {editando ? "Editar proveedor" : "Nuevo proveedor"}
                  </h2>

                  <p className="mt-1 text-xs text-[#667064]">
                    {editando
                      ? "Actualiza la información del proveedor."
                      : "Completa los datos para registrar un proveedor."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                disabled={guardando}
                aria-label="Cerrar modal"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#667064] transition-colors hover:bg-[#eee9de] hover:text-[#29382e] disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            {/* Formulario */}
            <form
              onSubmit={guardar}
              className="overflow-y-auto px-5 py-5 sm:px-6"
            >
              <div className="mb-4 rounded-lg border border-[#e5dfd2] bg-[#f7f4ec] px-3 py-2.5">
                <p className="text-xs text-[#667064]">
                  Los campos marcados con{" "}
                  <span className="font-bold text-[#a45d40]">*</span> son
                  obligatorios.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {campos.map(
                  ({
                    key,
                    label,
                    required,
                    placeholder,
                    span,
                    textarea,
                    type,
                    icon: IconoCampo,
                  }) => (
                    <div
                      key={key}
                      className={span === 2 ? "sm:col-span-2" : ""}
                    >
                      <label
                        htmlFor={`proveedor-${key}`}
                        className="mb-1.5 block text-xs font-semibold text-[#29382e]"
                      >
                        {label}{" "}
                        {required && (
                          <span className="text-[#a45d40]">*</span>
                        )}
                      </label>

                      <div className="relative">
                        {IconoCampo && (
                          <IconoCampo
                            size={16}
                            className={`pointer-events-none absolute left-3 top-3 text-[#929487] ${
                              textarea ? "top-3" : ""
                            }`}
                          />
                        )}

                        {textarea ? (
                          <textarea
                            id={`proveedor-${key}`}
                            value={form[key]}
                            onChange={(e) => {
                              const valor = e.target.value;

                              setForm((actual) => ({
                                ...actual,
                                [key]: valor,
                              }));

                              setErrores((actual) => ({
                                ...actual,
                                [key]: undefined,
                              }));
                            }}
                            placeholder={placeholder}
                            rows={3}
                            maxLength={1000}
                            className={`${inputClass} resize-none pl-10`}
                          />
                        ) : (
                          <input
                            id={`proveedor-${key}`}
                            type={type ?? "text"}
                            value={form[key]}
                            required={required}
                            maxLength={key === "correo" ? 254 : 150}
                            onChange={(e) => {
                              const valor = e.target.value;

                              setForm((actual) => ({
                                ...actual,
                                [key]: valor,
                              }));

                              setErrores((actual) => ({
                                ...actual,
                                [key]: undefined,
                              }));
                            }}
                            placeholder={placeholder}
                            className={`${inputClass} pl-10 ${
                              errores[key]
                                ? "border-[#b96f50] bg-[#f7e9e1]"
                                : ""
                            }`}
                          />
                        )}
                      </div>

                      {errores[key] && (
                        <p className="mt-1.5 text-xs text-[#a45d40]">
                          {errores[key]}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>

              {/* Acciones */}
              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#eee9de] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={guardando}
                  className="rounded-lg border border-[#e5dfd2] bg-[#fffdf8] px-5 py-2.5 text-sm font-semibold text-[#667064] transition-colors hover:bg-[#eee9de] disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243c32] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#304b3e] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {guardando ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      {editando
                        ? "Guardar cambios"
                        : "Registrar proveedor"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}