/**
 * services/categorias.service.ts
 */
import { get, post, put, del } from '@/lib/api';

export interface Categoria {
  id:               number;
  nombre:           string;
  descripcion?:     string | null;
  estado:           number;
  total_productos?: number;
  fecha_creacion?:  string;
}

export function listarCategorias(): Promise<Categoria[]> {
  return get<Categoria[]>('/categorias');
}

export function obtenerCategoria(id: number): Promise<Categoria> {
  return get<Categoria>(`/categorias/${id}`);
}

export function crearCategoria(datos: Pick<Categoria, 'nombre'> & { descripcion?: string }): Promise<Categoria> {
  return post<Categoria>('/categorias', datos);
}

export function actualizarCategoria(id: number, datos: Partial<Categoria>): Promise<Categoria> {
  return put<Categoria>(`/categorias/${id}`, datos);
}

export function eliminarCategoria(id: number): Promise<{ mensaje: string }> {
  return del<{ mensaje: string }>(`/categorias/${id}`);
}
