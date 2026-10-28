export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste';

export interface Movimiento {
  id: number;
  productoId: number;
  productoNombre?: string;
  tipo: TipoMovimiento;
  cantidad: number;
  usuarioId: number;
  usuarioNombre?: string;
  fecha: string;
  observaciones?: string | null;
  referenciaId?: number | null;
}

export interface Compra {
  id: number;
  proveedorId: number;
  proveedorNombre?: string;
  usuarioId: number;
  fecha: string;
  total: number;
  estado: 'pendiente' | 'completada' | 'cancelada';
  detalles?: DetalleCompra[];
}

export interface DetalleCompra {
  id: number;
  compraId: number;
  productoId: number;
  productoNombre?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface AlertaInventario {
  productoId: number;
  productoNombre: string;
  stock: number;
  stockMinimo: number;
  tipo: 'agotado' | 'stock_bajo';
}

export interface DashboardStats {
  totalProductos: number;
  productosStockBajo: number;
  productosAgotados: number;
  valorInventario: number;
  totalMovimientosMes: number;
  totalComprasMes: number;
  ultimosMovimientos: Movimiento[];
  alertas: AlertaInventario[];
}

export interface ReporteProducto {
  id: number;
  nombre: string;
  stock: number;
  stockMinimo: number;
  precioVenta: number;
  categoria: string;
  valorTotal: number;
  estado: string;
}

export interface FiltroFecha {
  desde?: string;
  hasta?: string;
}
