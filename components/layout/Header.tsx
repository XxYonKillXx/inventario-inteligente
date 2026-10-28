"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  UserRound,
  Package,
  LayoutDashboard,
  Tags,
  UsersRound,
  ShoppingBag,
  ArrowLeftRight,
  TriangleAlert,
  FileText,
  X,
  NotebookText,
  ReceiptText,
} from "lucide-react";

const TITULOS: Record<string, { titulo: string; descripcion: string }> = {
  "/dashboard": {
    titulo: "Dashboard",
    descripcion: "Resumen general del inventario",
  },
  "/productos": {
    titulo: "Productos",
    descripcion: "Gestión del catálogo de productos",
  },
  "/recetas": {
    titulo: "Recetas",
    descripcion: "Gestión de platos y sus ingredientes",
  },
  "/ventas": {
    titulo: "Ventas",
    descripcion: "Registro, detalle y anulación de ventas",
  },
  "/categorias": {
    titulo: "Categorías",
    descripcion: "Organización por categorías",
  },
  "/proveedores": {
    titulo: "Proveedores",
    descripcion: "Administra los contactos y la información de tus proveedores.",
  },
  "/compras": {
    titulo: "Compras",
    descripcion: "Registro de compras y entradas",
  },
  "/movimientos": {
    titulo: "Movimientos",
    descripcion: "Historial de movimientos de inventario",
  },
  "/alertas": {
    titulo: "Alertas",
    descripcion: "Productos con stock bajo o agotados",
  },
  "/reportes": {
    titulo: "Reportes",
    descripcion: "Consulta las existencias, los productos, los movimientos y las compras de tu inventario",
  },
  "/usuarios": {
    titulo: "Usuarios",
    descripcion: "Administra las cuentas, los roles y los accesos al sistema.",
  },
};

function obtenerInfoPagina(pathname: string) {
  for (const [ruta, info] of Object.entries(TITULOS)) {
    if (pathname === ruta || pathname.startsWith(ruta + "/")) {
      return info;
    }
  }

  return {
    titulo: "Inventario Inteligente",
    descripcion: "",
  };
}

interface UsuarioSesion {
  id: number;
  nombre: string;
  apellido?: string;
  correo: string;
  rol: string;
}

interface HeaderProps {
  sidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
}

export default function Header({
  sidebarCollapsed,
  onMobileMenuToggle,
}: HeaderProps) {
  const [menuUsuario, setMenuUsuario] = useState(false);
  const [notifs, setNotifs] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const info = obtenerInfoPagina(pathname);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ii_usuario");

      if (raw) {
        setUsuario(JSON.parse(raw));
      }
    } catch {
      // No se pudo leer la sesión.
    }
  }, []);

  function cerrarSesion() {
    localStorage.removeItem("ii_token");
    localStorage.removeItem("ii_usuario");

    setMenuUsuario(false);
    router.replace("/login");
  }

  const iniciales = usuario
    ? `${usuario.nombre.charAt(0)}${
        usuario.apellido?.charAt(0) ?? ""
      }`.toUpperCase()
    : "U";

  const nombreCompleto = usuario
    ? `${usuario.nombre}${
        usuario.apellido ? " " + usuario.apellido : ""
      }`
    : "Usuario";

  const rolLabel = usuario?.rol
    ? usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)
    : "";

  const iconoPagina = (() => {
    switch (pathname.split("/")[1]) {
      case "dashboard":
        return LayoutDashboard;
      case "productos":
        return Package;
      case "recetas":
        return NotebookText;
      case "ventas":
        return ReceiptText;
      case "categorias":
        return Tags;
      case "proveedores":
        return UsersRound;
      case "compras":
        return ShoppingBag;
      case "movimientos":
        return ArrowLeftRight;
      case "alertas":
        return TriangleAlert;
      case "reportes":
        return FileText;
      case "usuarios":
        return UsersRound;
      default:
        return Package;
    }
  })();

  const IconoPagina = iconoPagina;

  return (
    <header
      className={`
        fixed top-0 right-0 z-20 h-16
        flex items-center justify-between gap-3
        border-b border-[#e5dfd2] bg-[#fffdf8]
        px-3 sm:px-4 lg:px-6
        shadow-sm transition-all duration-300
        ${sidebarCollapsed ? "lg:left-[72px]" : "lg:left-[260px]"}
        left-0
      `}
    >
      {/* Lado izquierdo: menú y título */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          aria-label="Abrir menú de navegación"
          className="
            flex h-10 w-10 shrink-0 items-center justify-center
            rounded-xl border border-[#e5dfd2]
            text-[#243c32] transition-colors
            hover:bg-[#f3ede1] lg:hidden
          "
        >
          <Menu size={21} />
        </button>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#243c32] text-[#fffdf8]">
          <IconoPagina size={20} strokeWidth={1.8} />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold leading-tight text-[#243c32] sm:text-base">
            {info.titulo}
          </h1>

          {info.descripcion && (
            <p className="hidden truncate text-xs text-[#758074] sm:block">
              {info.descripcion}
            </p>
          )}
        </div>
      </div>

      {/* Lado derecho: notificaciones y usuario */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Notificaciones */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifs(!notifs);
              setMenuUsuario(false);
            }}
            aria-label="Ver notificaciones"
            aria-expanded={notifs}
            className="
              relative flex h-10 w-10 items-center justify-center
              rounded-xl border border-[#e5dfd2] bg-[#f3ede1]
              text-[#243c32] transition-colors
              hover:bg-[#e9e0d1]
            "
          >
            <Bell size={19} strokeWidth={1.8} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[#f3ede1] bg-[#b96f50]" />
          </button>

          {notifs && (
            <>
              <button
                type="button"
                aria-label="Cerrar notificaciones"
                className="fixed inset-0 z-30 cursor-default"
                onClick={() => setNotifs(false)}
              />

              <div className="absolute right-0 top-full z-40 mt-3 w-[min(320px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-[#e5dfd2] bg-[#fffdf8] shadow-xl">
                <div className="flex items-center justify-between border-b border-[#e5dfd2] px-4 py-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#243c32]">
                      Notificaciones
                    </h3>
                    <p className="mt-0.5 text-xs text-[#758074]">
                      Avisos del inventario
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNotifs(false)}
                    aria-label="Cerrar"
                    className="rounded-lg p-1.5 text-[#758074] hover:bg-[#f3ede1]"
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="px-4 py-7 text-center">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#f3ede1] text-[#243c32]">
                    <Bell size={21} />
                  </div>
                  <p className="text-sm font-medium text-[#243c32]">
                    Revisa tus alertas
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#758074]">
                    Consulta los productos con existencias bajas o agotadas
                    en la sección de Alertas.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setNotifs(false);
                      router.push("/alertas");
                    }}
                    className="mt-4 rounded-xl bg-[#243c32] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#304b3e]"
                  >
                    Ver alertas
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mx-1 h-7 w-px bg-[#e5dfd2]" />

        {/* Perfil de usuario */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setMenuUsuario(!menuUsuario);
              setNotifs(false);
            }}
            aria-label="Abrir menú de usuario"
            aria-expanded={menuUsuario}
            className="
              flex items-center gap-2 rounded-xl p-1.5
              transition-colors hover:bg-[#f3ede1]
            "
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#b96f50] text-white shadow-sm">
              <span className="text-xs font-bold">{iniciales}</span>
            </div>

            <div className="hidden min-w-0 text-left sm:block">
              <p className="max-w-[140px] truncate text-sm font-semibold text-[#243c32]">
                {nombreCompleto}
              </p>
              <p className="max-w-[140px] truncate text-[11px] text-[#758074]">
                {rolLabel || "Cuenta"}
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`hidden text-[#758074] transition-transform sm:block ${
                menuUsuario ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuUsuario && (
            <>
              <button
                type="button"
                aria-label="Cerrar menú de usuario"
                className="fixed inset-0 z-30 cursor-default"
                onClick={() => setMenuUsuario(false)}
              />

              <div className="absolute right-0 top-full z-40 mt-3 w-64 overflow-hidden rounded-2xl border border-[#e5dfd2] bg-[#fffdf8] shadow-xl">
                <div className="bg-[#243c32] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#b96f50] text-white">
                      <span className="text-sm font-bold">{iniciales}</span>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {nombreCompleto}
                      </p>
                      <p className="truncate text-xs text-[#d5ad9a]">
                        {usuario?.correo}
                      </p>
                    </div>
                  </div>

                  {rolLabel && (
                    <span className="mt-3 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-[#fffdf8]">
                      {rolLabel}
                    </span>
                  )}
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => setMenuUsuario(false)}
                    className="
                      flex w-full items-center gap-3 rounded-xl
                      px-3 py-2.5 text-left text-sm text-[#405246]
                      transition-colors hover:bg-[#f3ede1]
                    "
                  >
                    <UserRound size={17} />
                    Mi perfil
                  </button>

                  <div className="my-1 h-px bg-[#e5dfd2]" />

                  <button
                    type="button"
                    onClick={cerrarSesion}
                    className="
                      flex w-full items-center gap-3 rounded-xl
                      px-3 py-2.5 text-left text-sm font-medium
                      text-[#a54839] transition-colors hover:bg-[#f8e9e4]
                    "
                  >
                    <LogOut size={17} />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
