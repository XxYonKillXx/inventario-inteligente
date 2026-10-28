export type EstadoProducto = 'disponible' | 'stock_bajo' | 'agotado';

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  totalProductos?: number;
}

export interface Producto {
  id: number;
  codigo?: string | null;
  nombre: string;
  descripcion?: string | null;
  precioCompra?: number | null;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  categoriaId?: number | null;
  categoria?: Categoria | null;
  activo: boolean;
  estado: EstadoProducto;
  createdAt: string;
  updatedAt: string;
}

export interface ProductoFormData {
  codigo?: string;
  nombre: string;
  descripcion?: string;
  precioCompra?: number | string;
  precioVenta: number | string;
  stock: number | string;
  stockMinimo: number | string;
  categoriaId?: number | string;
}

export interface Proveedor {
  id: number;
  nombre: string;
  contacto?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  activo: boolean;
  createdAt: string;
}
