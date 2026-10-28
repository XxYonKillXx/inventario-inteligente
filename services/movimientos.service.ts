/**
 * services/movimientos.service.ts
 * Tabla real: movimientos_inventario — tipos ENTRADA/SALIDA/AJUSTE (mayúsculas)
 */
import { get, post } from '@/lib/api';

export interface Movimiento {
  id:                 number;
  producto_id:        number;
  producto_nombre?:   string;
  usuario_id:         number;
  usuario_nombre?:    string;
  compra_id?:         number | null;
  tipo:               'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad:           number;
  cantidad_anterior:  number;
  cantidad_nueva:     number;
  motivo:             string;
  fecha_movimiento:   string;
}

export interface MovimientoFormData {
  producto_id: number;
  tipo:        'SALIDA' | 'AJUSTE';
  cantidad:    number;
  motivo:      string;
}

export interface FiltrosMovimiento {
  tipo?:        string;
  producto_id?: string;
  desde?:       string;
  hasta?:       string;
}

export function listarMovimientos(filtros?: FiltrosMovimiento): Promise<Movimiento[]> {
  return get<Movimiento[]>('/movimientos', filtros as Record<string, string>);
}

export function registrarMovimiento(datos: MovimientoFormData): Promise<{
  mensaje:           string;
  cantidad_anterior: number;
  cantidad_nueva:    number;
  estado_stock:      string;
}> {
  return post('/movimientos', datos);
}
