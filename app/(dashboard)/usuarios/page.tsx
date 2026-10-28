
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  UserRound,
  Users,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Eye,
  EyeOff,
  X,
  ShieldCheck,
  Mail,
  CalendarDays,
  AlertCircle,
  UserCheck,
  UserX,
  LockKeyhole,
} from "lucide-react";
import { get, post, put } from "@/lib/api";

interface UsuarioAPI {
  id: number;
  nombre: string;
  apellido: string | null;
  correo: string;
  rol_id: number;
  rol_nombre: string;
  estado: number;
  ultimo_acceso: string | null;
  fecha_creacion: string;
}

type FormUsuario = {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  confirmar: string;
  rol_id: string;
};

const FORM_VACIO: FormUsuario = {
  nombre: "",
  apellido: "",
  correo: "",
  password: "",
  confirmar: "",
  rol_id: "2",
};

const inputClass =
  "w-full rounded-xl border border-[#e5dfd2] bg-[#fffdf8] px-3.5 py-2.5 text-sm text-[#29382e] outline-none transition placeholder:text-[#929487] focus:border-[#b96f50] focus:ring-2 focus:ring-[#b96f50]/20";

export default function UsuariosPage() {
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<UsuarioAPI[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<number | null>(null);
  const [verPass, setVerPass] = useState(false);
  const [verPass2, setVerPass2] = useState(false);
  const [form, setForm] = useState<FormUsuario>(FORM_VACIO);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [actualizandoId, setActualizandoId] = useState<number | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);

    try {
      const resultado = await get<UsuarioAPI[]>("/usuarios");
      setUsuarios(Array.isArray(resultado) ? resultado : []);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Error al cargar los usuarios.";

      if (msg.includes("401") || msg.toLowerCase().includes("token")) {
        router.replace("/login");
        return;
      }

      setError(msg);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      void cargar();
    }, 0);
    return () => window.clearTimeout(temporizador);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function abrirModal() {
    setUsuarioEditando(null);
    setForm({ ...FORM_VACIO });
    setErrores({});
    setVerPass(false);
    setVerPass2(false);
    setModalAbierto(true);
  }

  function abrirEdicion(usuario: UsuarioAPI) {
    setUsuarioEditando(usuario.id);
    setForm({
      nombre: usuario.nombre,
      apellido: usuario.apellido ?? "",
      correo: usuario.correo,
      password: "",
      confirmar: "",
      rol_id: String(usuario.rol_id),
    });
    setErrores({});
    setVerPass(false);
    setVerPass2(false);
    setModalAbierto(true);
  }

  function actualizarCampo(campo: keyof FormUsuario, valor: string) {
    setForm((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actual) => {
      const nuevos = { ...actual };
      delete nuevos[campo];
      delete nuevos.general;
      return nuevos;
    });
  }

  function validar() {
    const e: Record<string, string> = {};

    if (!form.nombre.trim()) {
      e.nombre = "El nombre es obligatorio.";
    }

    if (
      !form.correo.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)
    ) {
      e.correo = "Ingresa un correo electrónico válido.";
    }

    if ((usuarioEditando === null || form.password) && form.password.length < 8) {
      e.password = "La contraseña debe tener mínimo 8 caracteres.";
    }

    if (
      (usuarioEditando === null || form.password || form.confirmar) &&
      form.password !== form.confirmar
    ) {
      e.confirmar = "Las contraseñas no coinciden.";
    }

    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validar()) return;

    setGuardando(true);
    setErrores({});

    try {
      const datos = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        correo: form.correo.trim(),
        rol_id: Number(form.rol_id),
        ...(form.password ? { password: form.password } : {}),
      };
      if (usuarioEditando !== null) {
        await put<UsuarioAPI>(`/usuarios/${usuarioEditando}`, datos);
      } else {
        await post<UsuarioAPI>("/usuarios", { ...datos, password: form.password });
      }

      setModalAbierto(false);
      await cargar();
    } catch (err: unknown) {
      const mensaje = err instanceof Error
        ? err.message
        : `No se pudo ${usuarioEditando !== null ? "actualizar" : "crear"} el usuario.`;

      if (mensaje.includes("401") || mensaje.toLowerCase().includes("token")) {
        router.replace("/login");
        return;
      }

      setErrores({ general: mensaje });
    } finally {
      setGuardando(false);
    }
  }

  async function toggleEstado(u: UsuarioAPI) {
    const nuevoEstado = u.estado ? 0 : 1;
    const accion = nuevoEstado ? "activar" : "desactivar";

    if (
      !confirm(
        `¿Deseas ${accion} al usuario ${u.nombre} ${u.apellido ?? ""}?`,
      )
    ) {
      return;
    }

    setActualizandoId(u.id);
    setError(null);

    try {
      const respuesta = await fetch(
        `http://localhost:3001/api/usuarios/${u.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("ii_token")}`,
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        },
      );

      if (!respuesta.ok) {
        const data = await respuesta.json().catch(() => ({}));

        if (respuesta.status === 401) {
          router.replace("/login");
          return;
        }

        throw new Error(data.mensaje || "No se pudo actualizar el usuario.");
      }

      await cargar();
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Error al actualizar el usuario.",
      );
    } finally {
      setActualizandoId(null);
    }
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return true;

    return [
      u.nombre,
      u.apellido ?? "",
      u.correo,
      u.rol_nombre,
      String(u.id),
    ].some((valor) => valor.toLowerCase().includes(texto));
  });

  const activos = usuarios.filter((u) => Boolean(u.estado)).length;
  const inactivos = usuarios.length - activos;
  const administradores = usuarios.filter(
    (u) => u.rol_nombre?.toLowerCase() === "administrador",
  ).length;

  return (
    <div className="w-full space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap ml-auto gap-2">
          <button
            onClick={() => void cargar()}
            disabled={cargando}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e5dfd2] bg-[#fffdf8] px-3.5 py-2.5 text-sm font-semibold text-[#29382e] transition hover:bg-[#f7f4ec] disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${cargando ? "animate-spin" : ""}`}
            />
            Actualizar
          </button>

          <button
            onClick={abrirModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#243c32] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#304b3e]"
          >
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-[#e8c8b8] bg-[#f7e9e1] px-4 py-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#85462f]" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#85462f]">
              No se pudo completar la operación
            </p>
            <p className="mt-1 text-sm text-[#85462f]">{error}</p>
          </div>
          <button
            onClick={() => void cargar()}
            className="text-sm font-semibold text-[#85462f] underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Indicadores */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#e5dfd2] bg-[#fffdf8] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e6eee5]">
              <Users className="h-5 w-5 text-[#243c32]" />
            </div>
            <span className="text-xs font-medium text-[#929487]">
              Registrados
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-[#29382e]">
            {cargando ? "—" : usuarios.length}
          </p>
          <p className="mt-1 text-sm text-[#667064]">Total de usuarios</p>
        </div>

        <div className="rounded-2xl border border-[#e5dfd2] bg-[#fffdf8] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e6eee5]">
              <UserCheck className="h-5 w-5 text-[#477b58]" />
            </div>
            <span className="rounded-full bg-[#e6eee5] px-2.5 py-1 text-xs font-semibold text-[#477b58]">
              Activos
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-[#29382e]">
            {cargando ? "—" : activos}
          </p>
          <p className="mt-1 text-sm text-[#667064]">Cuentas habilitadas</p>
        </div>

        <div className="rounded-2xl border border-[#e5dfd2] bg-[#fffdf8] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f7e9e1]">
              <UserX className="h-5 w-5 text-[#a45d40]" />
            </div>
            <span className="rounded-full bg-[#f7e9e1] px-2.5 py-1 text-xs font-semibold text-[#85462f]">
              Inactivos
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-[#29382e]">
            {cargando ? "—" : inactivos}
          </p>
          <p className="mt-1 text-sm text-[#667064]">Cuentas deshabilitadas</p>
        </div>

        <div className="rounded-2xl border border-[#e5dfd2] bg-[#fffdf8] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f7efd9]">
              <ShieldCheck className="h-5 w-5 text-[#98702d]" />
            </div>
            <span className="text-xs font-medium text-[#929487]">Permisos</span>
          </div>
          <p className="mt-4 text-2xl font-bold text-[#29382e]">
            {cargando ? "—" : administradores}
          </p>
          <p className="mt-1 text-sm text-[#667064]">Administradores</p>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="overflow-hidden rounded-2xl border border-[#e5dfd2] bg-[#fffdf8] shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#e5dfd2] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[#29382e]">
              Usuarios registrados
            </h2>
            <p className="mt-1 text-xs text-[#929487]">
              Consulta las cuentas y administra su estado.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#929487]" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar usuario, correo o rol..."
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5dfd2] bg-[#f7f4ec]">
                {[
                  "Usuario",
                  "Correo",
                  "Rol",
                  "Estado",
                  "Último acceso",
                  "Registrado",
                  "Acciones",
                ].map((col) => (
                  <th
                    key={col}
                    className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#667064]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e5dfd2]">
              {cargando ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-4">
                      <div className="h-10 animate-pulse rounded-lg bg-[#eee9de]" />
                    </td>
                  </tr>
                ))
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eee9de]">
                      <UserRound className="h-6 w-6 text-[#929487]" />
                    </div>
                    <p className="text-sm font-semibold text-[#29382e]">
                      {busqueda
                        ? "No se encontraron usuarios"
                        : "No hay usuarios registrados"}
                    </p>
                    <p className="mt-1 text-xs text-[#929487]">
                      {busqueda
                        ? "Prueba con otro nombre, correo o rol."
                        : "Crea una cuenta para comenzar."}
                    </p>
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => {
                  const administrador =
                    u.rol_nombre?.toLowerCase() === "administrador";

                  return (
                    <tr
                      key={u.id}
                      className={`transition hover:bg-[#f7f4ec]/70 ${
                        !u.estado ? "opacity-60" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#243c32] text-sm font-bold text-white">
                            {u.nombre.charAt(0).toUpperCase()}
                            {(u.apellido ?? "").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-[#29382e]">
                              {u.nombre} {u.apellido ?? ""}
                            </p>
                            <p className="mt-0.5 text-xs text-[#929487]">
                              ID #{u.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-xs text-[#667064]">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-[#929487]" />
                          {u.correo}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            administrador
                              ? "bg-[#e6eee5] text-[#243c32]"
                              : "bg-[#eee9de] text-[#667064]"
                          }`}
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {u.rol_nombre
                            ? u.rol_nombre.charAt(0).toUpperCase() +
                              u.rol_nombre.slice(1)
                            : "Sin rol"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            u.estado
                              ? "bg-[#e6eee5] text-[#477b58]"
                              : "bg-[#eee9de] text-[#667064]"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.estado ? "bg-[#477b58]" : "bg-[#929487]"
                            }`}
                          />
                          {u.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs text-[#667064]">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#929487]" />
                          {u.ultimo_acceso
                            ? new Date(u.ultimo_acceso).toLocaleString("es-CO")
                            : "Sin acceso registrado"}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-xs text-[#667064]">
                        {u.fecha_creacion
                          ? new Date(u.fecha_creacion).toLocaleDateString(
                              "es-CO",
                            )
                          : "—"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => void toggleEstado(u)}
                            disabled={actualizandoId === u.id}
                            title={u.estado ? "Desactivar usuario" : "Activar usuario"}
                            className={`flex h-9 w-9 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              u.estado
                                ? "text-[#98702d] hover:bg-[#f7efd9]"
                                : "text-[#477b58] hover:bg-[#e6eee5]"
                            }`}
                          >
                            {actualizandoId === u.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : u.estado ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>

                          <button
                            onClick={() => abrirEdicion(u)}
                            title="Editar usuario"
                            aria-label={`Editar usuario ${u.nombre}`}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#667064] transition hover:bg-[#f7e9e1] hover:text-[#85462f]"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!cargando && usuariosFiltrados.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e5dfd2] bg-[#f7f4ec]/60 px-5 py-3">
            <p className="text-xs text-[#929487]">
              Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
            </p>
            <span className="text-xs font-medium text-[#667064]">
              {activos} cuentas activas
            </span>
          </div>
        )}
      </div>


      {/* Modal de creación y edición de usuario */}
      {modalAbierto && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto"
          style={{
            backgroundColor: "rgba(24,37,30,0.65)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setModalAbierto(false)}
        >
          <div className="flex min-h-full items-start justify-center p-3 sm:items-center sm:p-5">
            <div
              className="my-auto flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-2xl"
              style={{
                background: "#fffdf8",
                borderColor: "#e5dfd2",
                maxHeight: "calc(100dvh - 24px)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Encabezado fijo */}
              <div
                className="flex shrink-0 items-center justify-between border-b px-5 py-4 sm:px-6"
                style={{
                  background: "#fffdf8",
                  borderColor: "#e5dfd2",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6eee5]">
                    <UserRound className="h-5 w-5 text-[#243c32]" />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-[#29382e]">
                      {usuarioEditando !== null ? "Editar usuario" : "Nuevo usuario"}
                    </h2>
                    <p className="mt-0.5 text-xs text-[#929487]">
                      {usuarioEditando !== null
                        ? "Actualiza los datos y permisos de la cuenta"
                        : "Registra una nueva cuenta del sistema"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  aria-label="Cerrar modal"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#667064] transition hover:bg-[#eee9de]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Contenido desplazable */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <form onSubmit={guardar} className="space-y-4 px-5 py-5 sm:px-6">
                  {errores.general && (
                    <div className="flex gap-2 rounded-xl border border-[#e8c8b8] bg-[#f7e9e1] px-3 py-3 text-sm text-[#85462f]">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <span>{errores.general}</span>
                    </div>
                  )}

                  {([
                    {
                      key: "nombre",
                      label: "Nombre",
                      requerido: true,
                      tipo: "text",
                      placeholder: "Nombre del usuario",
                    },
                    {
                      key: "apellido",
                      label: "Apellido",
                      requerido: false,
                      tipo: "text",
                      placeholder: "Apellido (opcional)",
                    },
                    {
                      key: "correo",
                      label: "Correo electrónico",
                      requerido: true,
                      tipo: "email",
                      placeholder: "usuario@empresa.com",
                    },
                  ] as const).map((campo) => (
                    <div key={campo.key}>
                      <label
                        htmlFor={campo.key}
                        className="mb-1.5 block text-sm font-semibold text-[#29382e]"
                      >
                        {campo.label}
                        {campo.requerido && (
                          <span className="ml-1 text-[#b96f50]">*</span>
                        )}
                      </label>

                      <input
                        id={campo.key}
                        type={campo.tipo}
                        value={form[campo.key]}
                        placeholder={campo.placeholder}
                        required={campo.requerido}
                        autoComplete={
                          campo.key === "correo" ? "email" : "off"
                        }
                        onChange={(e) =>
                          actualizarCampo(campo.key, e.target.value)
                        }
                        className={`${inputClass} ${
                          errores[campo.key]
                            ? "border-[#b96f50] bg-[#f7e9e1]/40"
                            : ""
                        }`}
                      />

                      {errores[campo.key] && (
                        <p className="mt-1.5 text-xs text-[#85462f]">
                          {errores[campo.key]}
                        </p>
                      )}
                    </div>
                  ))}

                  {([
                    {
                      key: "password",
                      label: usuarioEditando !== null ? "Nueva contraseña (opcional)" : "Contraseña",
                      visible: verPass,
                      alternar: () => setVerPass((v) => !v),
                    },
                    {
                      key: "confirmar",
                      label: "Confirmar contraseña",
                      visible: verPass2,
                      alternar: () => setVerPass2((v) => !v),
                    },
                  ] as const).map((campo) => (
                    <div key={campo.key}>
                      <label
                        htmlFor={campo.key}
                        className="mb-1.5 block text-sm font-semibold text-[#29382e]"
                      >
                        {campo.label}
                        {usuarioEditando === null && (
                          <span className="ml-1 text-[#b96f50]">*</span>
                        )}
                      </label>

                      <div className="relative">
                        <input
                          id={campo.key}
                          type={campo.visible ? "text" : "password"}
                          value={form[campo.key]}
                          placeholder={
                            usuarioEditando !== null && campo.key === "password"
                              ? "Deja vacío para mantener la actual"
                              : "Mínimo 8 caracteres"
                          }
                          autoComplete="new-password"
                          required={usuarioEditando === null}
                          onChange={(e) =>
                            actualizarCampo(campo.key, e.target.value)
                          }
                          className={`${inputClass} pr-11 ${
                            errores[campo.key]
                              ? "border-[#b96f50] bg-[#f7e9e1]/40"
                              : ""
                          }`}
                        />

                        <button
                          type="button"
                          onClick={campo.alternar}
                          aria-label={
                            campo.visible
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#929487] transition hover:text-[#29382e]"
                        >
                          {campo.visible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {errores[campo.key] && (
                        <p className="mt-1.5 text-xs text-[#85462f]">
                          {errores[campo.key]}
                        </p>
                      )}
                    </div>
                  ))}

                  <div>
                    <label
                      htmlFor="rol_id"
                      className="mb-1.5 block text-sm font-semibold text-[#29382e]"
                    >
                      Rol <span className="text-[#b96f50]">*</span>
                    </label>

                    <div className="relative">
                      <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#929487]" />

                      <select
                        id="rol_id"
                        value={form.rol_id}
                        onChange={(e) =>
                          actualizarCampo("rol_id", e.target.value)
                        }
                        className={`${inputClass} pl-9`}
                      >
                        <option value="2">Empleado</option>
                        <option value="1">Administrador</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-xl bg-[#f7f4ec] p-3">
                    <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#667064]" />
                    <p className="text-xs leading-5 text-[#667064]">
                      {usuarioEditando !== null
                        ? "Deja la contraseña vacía si no deseas cambiarla."
                        : "La contraseña se almacena encriptada. El usuario podrá cambiarla después de iniciar sesión."}
                    </p>
                  </div>

                  {/* Botones al final del formulario */}
                  <div className="flex flex-col-reverse gap-2 border-t border-[#e5dfd2] pt-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setModalAbierto(false)}
                      className="flex-1 rounded-xl border border-[#e5dfd2] bg-[#f7f4ec] py-2.5 text-sm font-semibold text-[#667064] transition hover:bg-[#eee9de]"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={guardando}
                      className="flex-1 rounded-xl bg-[#243c32] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#304b3e] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {guardando
                        ? usuarioEditando !== null ? "Guardando..." : "Creando..."
                        : usuarioEditando !== null ? "Guardar cambios" : "Crear usuario"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
