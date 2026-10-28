'use client';

import React, { useState, useEffect } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button, Input, Textarea, Alert, Badge } from '@/components/ui';

// Metadata SEO referencial para Next.js App Router
// title: 'Editar producto'

interface FormErrors {
  nombre?: string;
  precioVenta?: string;
  precioCompra?: string;
  stock?: string;
  stockMinimo?: string;
}

const CATEGORIAS_DISPONIBLES = [
  { id: 1, nombre: 'Herramientas Eléctricas' },
  { id: 2, nombre: 'Herramientas Manuales' },
  { id: 3, nombre: 'Materiales Eléctricos' },
  { id: 4, nombre: 'Pinturas y Acabados' },
  { id: 5, nombre: 'Tuberías y Grifería' },
  { id: 6, nombre: 'Fijaciones y Tornillería' },
];

// Productos simulados para prellenado
const PRODUCTOS_DATABASE: Record<string, {
  nombre: string;
  codigo: string;
  descripcion: string;
  categoriaId: string;
  precioCompra: string;
  precioVenta: string;
  stock: string;
  stockMinimo: string;
}> = {
  '1': {
    nombre: 'Taladro Percutor 1/2" 750W',
    codigo: 'HERR-001',
    descripcion: 'Taladro de alto rendimiento con velocidad variable reversible y mandril de 13mm.',
    categoriaId: '1',
    precioCompra: '145000',
    precioVenta: '220000',
    stock: '24',
    stockMinimo: '8',
  },
  '2': {
    nombre: 'Cable Cobre THHN #12 Blanco (Rollo 100m)',
    codigo: 'ELEC-014',
    descripcion: 'Conductor eléctrico de cobre suave con aislamiento termoplástico retardante a la llama.',
    categoriaId: '3',
    precioCompra: '98000',
    precioVenta: '145000',
    stock: '5',
    stockMinimo: '10',
  },
  '3': {
    nombre: 'Pintura Vinilo Tipo 1 Blanco Galón',
    codigo: 'PINT-102',
    descripcion: 'Pintura acrílica base agua con alto poder cubriente y lavabilidad.',
    categoriaId: '4',
    precioCompra: '42000',
    precioVenta: '68000',
    stock: '38',
    stockMinimo: '12',
  },
};

// Historial simulado de movimientos
const HISTORIAL_MOVIMIENTOS_EJEMPLO = [
  {
    id: 101,
    fecha: '2026-10-20 14:32',
    tipo: 'entrada' as const,
    cantidad: 15,
    stockFinal: 24,
    usuario: 'Carlos Almacén',
    motivo: 'Compra OC-2026-042',
  },
  {
    id: 102,
    fecha: '2026-10-18 09:15',
    tipo: 'salida' as const,
    cantidad: -3,
    stockFinal: 9,
    usuario: 'María Ventas',
    motivo: 'Factura F-8921',
  },
  {
    id: 103,
    fecha: '2026-10-10 16:45',
    tipo: 'ajuste' as const,
    cantidad: -1,
    stockFinal: 12,
    usuario: 'Administrador',
    motivo: 'Ajuste de inventario periódico',
  },
];

export default function EditarProductoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const datosExistentes = PRODUCTOS_DATABASE[id] || {
    nombre: `Producto #${id || '1'}`,
    codigo: `ART-${id || '001'}`,
    descripcion: 'Descripción general del artículo registrado en inventario.',
    categoriaId: '1',
    precioCompra: '50000',
    precioVenta: '75000',
    stock: '15',
    stockMinimo: '5',
  };

  // Estados del formulario
  const [nombre, setNombre] = useState(datosExistentes.nombre);
  const [codigo, setCodigo] = useState(datosExistentes.codigo);
  const [descripcion, setDescripcion] = useState(datosExistentes.descripcion);
  const [categoriaId, setCategoriaId] = useState(datosExistentes.categoriaId);
  const [precioCompra, setPrecioCompra] = useState(datosExistentes.precioCompra);
  const [precioVenta, setPrecioVenta] = useState(datosExistentes.precioVenta);
  const [stock, setStock] = useState(datosExistentes.stock);
  const [stockMinimo, setStockMinimo] = useState(datosExistentes.stockMinimo);

  // Estados de interfaz
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<FormErrors>({});
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  useEffect(() => {
    if (datosExistentes) {
      setNombre(datosExistentes.nombre);
      setCodigo(datosExistentes.codigo);
      setDescripcion(datosExistentes.descripcion);
      setCategoriaId(datosExistentes.categoriaId);
      setPrecioCompra(datosExistentes.precioCompra);
      setPrecioVenta(datosExistentes.precioVenta);
      setStock(datosExistentes.stock);
      setStockMinimo(datosExistentes.stockMinimo);
    }
  }, [id]);

  const validarFormulario = (): boolean => {
    const nuevosErrores: FormErrors = {};

    if (!nombre.trim()) {
      nuevosErrores.nombre = 'El nombre del producto es obligatorio.';
    }

    if (!precioVenta || Number(precioVenta) <= 0) {
      nuevosErrores.precioVenta = 'El precio de venta debe ser mayor a 0.';
    }

    if (precioCompra && Number(precioCompra) < 0) {
      nuevosErrores.precioCompra = 'El precio de compra no puede ser negativo.';
    }

    if (stock === '' || Number(stock) < 0) {
      nuevosErrores.stock = 'El stock debe ser mayor o igual a 0.';
    }

    if (stockMinimo === '' || Number(stockMinimo) < 0) {
      nuevosErrores.stockMinimo = 'El stock mínimo debe ser mayor o igual a 0.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeExito(null);
    setMensajeError(null);

    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setMensajeExito(`Los cambios para "${nombre}" fueron guardados exitosamente.`);
    } catch {
      setMensajeError('Hubo un error al intentar actualizar el producto.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <title>Editar producto | Inventario Inteligente</title>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/productos" className="hover:text-indigo-600 transition-colors">
            Productos
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-medium truncate max-w-xs">{nombre}</span>
        </nav>

        {/* Banner de Base de Datos Pendiente */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
          <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 mt-0.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm">
            <h4 className="font-semibold text-amber-900">Modo de Demostración — Edición en Memoria</h4>
            <p className="mt-0.5 text-xs text-amber-700 leading-relaxed">
              Estás visualizando datos prellenados para la edición. Los cambios confirmados se reflejarán localmente durante la sesión actual hasta que se sincronice con el backend MySQL.
            </p>
          </div>
        </div>

        {/* Mensajes de éxito / error */}
        {mensajeExito && (
          <Alert type="success" title="Producto actualizado" onClose={() => setMensajeExito(null)}>
            {mensajeExito}
          </Alert>
        )}

        {mensajeError && (
          <Alert type="error" title="Error" onClose={() => setMensajeError(null)}>
            {mensajeError}
          </Alert>
        )}

        {/* Tarjeta del Formulario de Edición */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 mb-6 gap-2">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Editar producto</h1>
              <p className="text-sm text-slate-500 mt-0.5 font-mono text-xs">
                ID interno: {id} • SKU: {codigo || 'Sin código'}
              </p>
            </div>
            <Link href="/productos">
              <Button variant="ghost" size="sm">
                ← Volver al listado
              </Button>
            </Link>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nombre */}
              <div className="md:col-span-1">
                <Input
                  label="Nombre del producto"
                  required
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (errores.nombre) setErrores((prev) => ({ ...prev, nombre: undefined }));
                  }}
                  error={errores.nombre}
                />
              </div>

              {/* Código */}
              <div className="md:col-span-1">
                <Input
                  label="Código / SKU"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                />
              </div>

              {/* Categoría */}
              <div className="md:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 select-none">
                  Categoría
                </label>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 transition-colors focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {CATEGORIAS_DISPONIBLES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Precio compra */}
              <div className="md:col-span-1">
                <Input
                  label="Precio de compra"
                  type="number"
                  min="0"
                  value={precioCompra}
                  onChange={(e) => {
                    setPrecioCompra(e.target.value);
                    if (errores.precioCompra) setErrores((prev) => ({ ...prev, precioCompra: undefined }));
                  }}
                  error={errores.precioCompra}
                />
              </div>

              {/* Precio venta */}
              <div className="md:col-span-1">
                <Input
                  label="Precio de venta"
                  required
                  type="number"
                  min="0"
                  value={precioVenta}
                  onChange={(e) => {
                    setPrecioVenta(e.target.value);
                    if (errores.precioVenta) setErrores((prev) => ({ ...prev, precioVenta: undefined }));
                  }}
                  error={errores.precioVenta}
                />
              </div>

              {/* Stock */}
              <div className="md:col-span-1">
                <Input
                  label="Stock actual"
                  required
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => {
                    setStock(e.target.value);
                    if (errores.stock) setErrores((prev) => ({ ...prev, stock: undefined }));
                  }}
                  error={errores.stock}
                />
              </div>

              {/* Stock mínimo */}
              <div className="md:col-span-1">
                <Input
                  label="Stock mínimo"
                  type="number"
                  min="0"
                  value={stockMinimo}
                  onChange={(e) => {
                    setStockMinimo(e.target.value);
                    if (errores.stockMinimo) setErrores((prev) => ({ ...prev, stockMinimo: undefined }));
                  }}
                  error={errores.stockMinimo}
                />
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <Textarea
                  label="Descripción"
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                type="button"
                onClick={() => router.push('/productos')}
                disabled={guardando}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={guardando}
              >
                Guardar cambios
              </Button>
            </div>
          </form>
        </div>

        {/* Historial de Movimientos del Producto */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Historial de movimientos de inventario
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Auditoría cronológica de ingresos, ventas y ajustes de este artículo.
              </p>
            </div>
            <Badge variant="indigo" size="sm">
              Solo lectura
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4 text-center">Cantidad</th>
                  <th className="py-3 px-4 text-center">Stock final</th>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Observaciones / Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {HISTORIAL_MOVIMIENTOS_EJEMPLO.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-xs font-mono text-slate-500">
                      {mov.fecha}
                    </td>
                    <td className="py-3 px-4">
                      {mov.tipo === 'entrada' ? (
                        <Badge variant="success" size="sm">
                          + Entrada
                        </Badge>
                      ) : mov.tipo === 'salida' ? (
                        <Badge variant="error" size="sm">
                          - Salida
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          ~ Ajuste
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">
                      <span className={mov.cantidad > 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {mov.cantidad > 0 ? `+${mov.cantidad}` : mov.cantidad}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-800">
                      {mov.stockFinal}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {mov.usuario}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {mov.motivo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
