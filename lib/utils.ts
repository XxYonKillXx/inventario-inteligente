import { EstadoProducto } from '@/types/producto';

/**
 * Formatea un valor numérico a moneda colombiana (COP), ej: $ 5.000
 */
export function formatearPrecio(valor: number): string {
  const numero = Number(valor);
  if (isNaN(numero)) {
    return '$ 0';
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(numero);
}

/**
 * Formatea una cadena de fecha a formato legible en español
 */
export function formatearFecha(fecha: string): string {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return fecha;

  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Calcula el estado de inventario según stock y stock mínimo
 */
export function calcularEstadoProducto(stock: number, stockMinimo: number): EstadoProducto {
  const s = Number(stock) || 0;
  const sm = Number(stockMinimo) || 0;

  if (s <= 0) {
    return 'agotado';
  }
  if (s <= sm) {
    return 'stock_bajo';
  }
  return 'disponible';
}

/**
 * Retorna las clases de Tailwind correspondientes al estado dado
 */
export function obtenerColorEstado(estado: string): string {
  switch (estado) {
    case 'disponible':
    case 'completada':
    case 'activo':
    case 'entrada':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'stock_bajo':
    case 'pendiente':
    case 'ajuste':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'agotado':
    case 'cancelada':
    case 'inactivo':
    case 'salida':
      return 'text-red-700 bg-red-50 border-red-200';
    default:
      return 'text-slate-700 bg-slate-50 border-slate-200';
  }
}

/**
 * Trunca un texto hasta el máximo de caracteres indicado agregando elipsis
 */
export function truncarTexto(texto: string, max: number): string {
  if (!texto) return '';
  if (texto.length <= max) return texto;
  return `${texto.slice(0, max)}...`;
}

/**
 * Genera las iniciales a partir de un nombre completo (ej: "Juan Pérez" -> "JP")
 */
export function generarInicialesNombre(nombre: string): string {
  if (!nombre || !nombre.trim()) return '';
  const partes = nombre.trim().split(/\s+/);
  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }
  return (partes[0][0] + partes[1][0]).toUpperCase();
}
