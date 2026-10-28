/**
 * services/compras.service.ts
 * Estados reales: PENDIENTE / RECIBIDA / ANULADA
 */
import { get, post, patch } from '@/lib/api';

export interface DetalleCompra {
  id:               number;
  producto_id:      number;
  producto_nombre?: string;
  unidad_medida?:   string;
  cantidad:         number;
  precio_unitario:  number;
  subtotal:         number;
}

export interface Compra {
  id:                number;
  numero_compra:     string;
  proveedor_id:      number;
  proveedor_nombre?: string;
  usuario_id:        number;
  usuario_nombre?:   string;
  fecha_compra:      string;
  subtotal:          number;
  impuestos:         number;
  total:             number;
  estado:            'PENDIENTE' | 'RECIBIDA' | 'ANULADA';
  observaciones?:    string | null;
  detalles?:         DetalleCompra[];
}

export interface ItemCompra {
  producto_id:     number;
  cantidad:        number;
  precio_unitario: number;
}

export interface CompraFormData {
  proveedor_id:   number;
  items:          ItemCompra[];
  impuestos?:     number;
  observaciones?: string;
}

export function listarCompras(params?: { desde?: string; hasta?: string; estado?: string }): Promise<Compra[]> {
  return get<Compra[]>('/compras', params as Record<string, string>);
}

export function obtenerCompra(id: number): Promise<Compra> {
  return get<Compra>(`/compras/${id}`);
}

export function crearCompra(datos: CompraFormData): Promise<Compra> {
  return post<Compra>('/compras', datos);
}

export function actualizarEstadoCompra(
  id: number,
  estado: 'RECIBIDA' | 'ANULADA'
): Promise<{ mensaje: string }> {
  return patch<{ mensaje: string }>(`/compras/${id}/estado`, { estado });
}
