import { get, post, put, patch } from '@/lib/api';

export interface RecetaIngrediente {
  id?: number;
  producto_id: number;
  producto_nombre?: string;
  unidad_medida?: string;
  unidad_vista?: string;
  precio_compra?: number;
  cantidad: number;
  costo_parcial?: number;
}

export interface Receta {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio_venta: number;
  estado: number;
  costo_estimado?: number;
  total_ingredientes?: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  ingredientes?: RecetaIngrediente[];
}

export interface RecetaFormData {
  nombre: string;
  descripcion?: string;
  precio_venta: number;
  activa?: boolean | number;
  ingredientes: Array<{ producto_id: number; cantidad: number; unidad_vista?: string }>;
}

export function listarRecetas(filtros?: Record<string, string>): Promise<Receta[]> {
  return get<Receta[]>('/recetas', filtros);
}

export function obtenerReceta(id: number): Promise<Receta> {
  return get<Receta>(`/recetas/${id}`);
}

export function crearReceta(datos: RecetaFormData): Promise<Receta & { mensaje?: string }> {
  return post<Receta & { mensaje?: string }>('/recetas', datos);
}

export function actualizarReceta(id: number, datos: Partial<RecetaFormData>): Promise<Receta & { mensaje?: string }> {
  return put<Receta & { mensaje?: string }>(`/recetas/${id}`, datos);
}

export function cambiarEstadoReceta(id: number, estado: number): Promise<{ mensaje: string; estado: number }> {
  return patch<{ mensaje: string; estado: number }>(`/recetas/${id}/estado`, { estado });
}
