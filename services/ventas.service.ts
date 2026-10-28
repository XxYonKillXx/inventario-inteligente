import { get, post, patch } from '@/lib/api';

export interface VentaDetalle {
  id: number;
  receta_id: number;
  receta_nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Venta {
  id: number;
  numero_venta: string;
  usuario_id: number;
  fecha_venta: string;
  subtotal: number;
  impuestos: number;
  total: number;
  estado: string;
  observaciones?: string | null;
  usuario_nombre?: string;
  items?: number;
  detalles?: VentaDetalle[];
}

export interface VentaFormData {
  items: Array<{ receta_id: number; cantidad: number }>;
  impuestos?: number;
  observaciones?: string;
}

export function listarVentas(filtros?: Record<string, string>): Promise<Venta[]> {
  return get<Venta[]>('/ventas', filtros);
}

export function obtenerVenta(id: number): Promise<Venta> {
  return get<Venta>(`/ventas/${id}`);
}

export function registrarVenta(datos: VentaFormData): Promise<Venta & { mensaje?: string }> {
  return post<Venta & { mensaje?: string }>('/ventas', datos);
}

export function anularVenta(id: number): Promise<{ mensaje: string }> {
  return patch<{ mensaje: string }>(`/ventas/${id}/anular`, {});
}
