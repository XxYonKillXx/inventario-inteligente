/**
 * services/proveedores.service.ts
 * Columnas reales: correo (no email), nit, contacto, observaciones.
 */
import { get, post, put, del } from '@/lib/api';

export interface Proveedor {
  id:             number;
  nombre:         string;
  nit?:           string | null;
  telefono?:      string | null;
  correo?:        string | null;   // columna real: correo
  direccion?:     string | null;
  contacto?:      string | null;
  observaciones?: string | null;
  estado:         number;
  total_compras?: number;
  fecha_creacion?: string;
}

export interface ProveedorFormData {
  nombre:         string;
  nit?:           string;
  telefono?:      string;
  correo?:        string;
  direccion?:     string;
  contacto?:      string;
  observaciones?: string;
}

export function listarProveedores(): Promise<Proveedor[]> {
  return get<Proveedor[]>('/proveedores');
}

export function obtenerProveedor(id: number): Promise<Proveedor> {
  return get<Proveedor>(`/proveedores/${id}`);
}

export function crearProveedor(datos: ProveedorFormData): Promise<Proveedor> {
  return post<Proveedor>('/proveedores', datos);
}

export function actualizarProveedor(id: number, datos: Partial<ProveedorFormData>): Promise<Proveedor> {
  return put<Proveedor>(`/proveedores/${id}`, datos);
}

export function eliminarProveedor(id: number): Promise<{ mensaje: string }> {
  return del<{ mensaje: string }>(`/proveedores/${id}`);
}
