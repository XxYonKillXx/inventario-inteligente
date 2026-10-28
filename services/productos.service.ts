/**
 * services/productos.service.ts
 * Adapta el frontend a las columnas reales: cantidad (no stock), categoria_id, unidad_medida.
 */
import { get, post, put, del } from '@/lib/api';

export interface Producto {
  id:                number;
  codigo?:           string | null;
  nombre:            string;
  descripcion?:      string | null;
  categoria_id:      number;
  categoria_nombre?: string;
  unidad_medida:     string;
  precio_compra:     number;
  precio_venta:      number;
  cantidad:          number;        // Stock real — columna `cantidad`
  stock_minimo:      number;
  fecha_vencimiento?: string | null;
  estado:            number;
  estado_stock:      'DISPONIBLE' | 'STOCK_BAJO' | 'AGOTADO';
  fecha_creacion?:   string;
  fecha_actualizacion?: string;
}

export interface ProductoFormData {
  codigo?:           string;
  nombre:            string;
  descripcion?:      string;
  categoria_id:      number | string;
  unidad_medida?:    string;
  precio_compra?:    number | string;
  precio_venta:      number | string;
  cantidad?:         number | string;
  stock_minimo?:     number | string;
  fecha_vencimiento?: string;
}

export interface FiltrosProducto {
  busqueda?:    string;
  categoria_id?: string;
}

export function listarProductos(filtros?: FiltrosProducto): Promise<Producto[]> {
  return get<Producto[]>('/productos', filtros as Record<string, string>);
}

export function obtenerProducto(id: number): Promise<Producto> {
  return get<Producto>(`/productos/${id}`);
}

export function crearProducto(datos: ProductoFormData): Promise<Producto> {
  return post<Producto>('/productos', datos);
}

export function actualizarProducto(id: number, datos: Partial<ProductoFormData>): Promise<Producto> {
  return put<Producto>(`/productos/${id}`, datos);
}

export function eliminarProducto(id: number): Promise<{ mensaje: string }> {
  return del<{ mensaje: string }>(`/productos/${id}`);
}
