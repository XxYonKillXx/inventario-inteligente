"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {LayoutDashboard,Package,Tags,UsersRound,ShoppingBag,ArrowLeftRight,TriangleAlert,FileText,Users,ChevronLeft,Menu,NotebookText,ReceiptText,} from "lucide-react";
// ─── Tipos ───────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavGroup {
  titulo: string;
  items: NavItem[];
}

// ─── Grupos de navegación ─────────────────────────────────────────────────────

const grupos: NavGroup[] = [
  {
    titulo: "Principal",
    items: [ 
      {label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard />, },
    ],
  },
  {
    titulo: "Inventario",
    items: [ 
      { label: "Productos", href: "/productos", icon: <Package />, },
      { label: "Recetas", href: "/recetas", icon: <NotebookText />, },
      { label: "Ventas", href: "/ventas", icon: <ReceiptText />, },
      { label: "Categorías", href: "/categorias", icon: <Tags />, },
      { label: "Movimientos", href: "/movimientos", icon: <ArrowLeftRight />, },
      { label: "Alertas", href: "/alertas", icon: <TriangleAlert />, },
    ],
  },
  {
    titulo: "Compras",
    items: [
      { label: "Compras", href: "/compras", icon: <ShoppingBag />, },
      { label: "Proveedores", href: "/proveedores", icon: <UsersRound />, },
    ],
  },
  {
    titulo: "Administración",
    items: [
      { label: "Reportes", href: "/reportes", icon: <FileText />, },
      { label: "Usuarios", href: "/usuarios", icon: <Users />,
      },
    ],
  },
];
// ─── Componente NavLink ───────────────────────────────────────────────────────

function NavLink({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive =
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
        transition-all duration-200 relative group
        ${
          isActive
            ? "bg-[#b96f50] text-white shadow-sm shadow-black/10"
            : "text-[#c5cec4] hover:bg-[#304b3e] hover:text-[#fffdf8]"
        }
      `}
    >
    <span
      className={`flex-shrink-0 ${
        isActive
          ? "text-white"
          : "text-[#c5cec4] group-hover:text-[#fffdf8]"
      }`}
    >
      {item.icon}
    </span>

      {!collapsed && (
        <span className="flex-1 truncate">{item.label}</span>
      )}

      {!collapsed && item.badge !== undefined && item.badge > 0 && (
        <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}

      {/* Tooltip cuando está colapsado */}
      {collapsed && (
        <span className="absolute left-full ml-3 px-2 py-1 bg-slate-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
          {item.label}
        </span>
      )}
    </Link>
  );
}

// ─── Componente principal Sidebar ─────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col
          bg-[#243c32] border-r border-[#304b3e]
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-[260px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo / Header */}
        <div className={`
          flex items-center h-16 border-b border-slate-800 flex-shrink-0
          ${collapsed ? "justify-center px-2" : "px-4 gap-3"}
        `}>
          {/* Ícono del logo */}
          <div className="flex-shrink-0 w-9 h-9 bg-[#b96f50] rounded-lg flex items-center justify-center shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.29 7 12 12 20.71 7" />
            </svg>
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">Inventario</p>
              <p className="text-[#d5ad62] text-xs font-medium truncate">Inteligente</p>
            </div>
          )}

          {/* Botón colapsar — solo desktop */}
          <button
            onClick={onToggle}
            className="hidden lg:flex flex-shrink-0 w-7 h-7 items-center justify-center rounded-md text-[#c5cec4] hover:text-white hover:bg-[#304b3e] transition-colors"
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            <span className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}>
              <ChevronLeft  />
            </span>
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {grupos.map((grupo) => (
            <div key={grupo.titulo} className="mb-4">
              {/* Título del grupo */}
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#b7c0b3]">
                  {grupo.titulo}
                </p>
              )}
              {collapsed && (
                <div className="mx-3 mb-2 h-px bg-[#304b3e]" />
              )}

              <div className="space-y-0.5">
                {grupo.items.map((item) => (
                  <NavLink key={item.href} item={item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div className={`flex-shrink-0 p-3 border-t border-[#304b3e] ${collapsed ? "text-center" : ""}`}>
          {!collapsed && (
            <div className="text-[10px] text-[#a5b0a2] text-center">
              v1.0.0 — Inventario Inteligente
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
