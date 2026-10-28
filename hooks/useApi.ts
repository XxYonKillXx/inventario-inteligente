'use client';

import { useState, useCallback } from 'react';

export interface UseApiResult<T> {
  datos: T | null;
  cargando: boolean;
  error: string | null;
  ejecutar: (accion: Promise<T> | (() => Promise<T>)) => Promise<T | null>;
  limpiar: () => void;
}

/**
 * Hook genérico para llamadas a la API que administra estado de carga, errores y datos devueltos.
 */
export function useApi<T>(): UseApiResult<T> {
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ejecutar = useCallback(
    async (accion: Promise<T> | (() => Promise<T>)): Promise<T | null> => {
      setCargando(true);
      setError(null);
      try {
        const resultado = typeof accion === 'function' ? await accion() : await accion;
        setDatos(resultado);
        return resultado;
      } catch (err: unknown) {
        const mensaje =
          err instanceof Error
            ? err.message
            : typeof err === 'string'
            ? err
            : 'Ocurrió un error inesperado al procesar la solicitud';
        setError(mensaje);
        return null;
      } finally {
        setCargando(false);
      }
    },
    []
  );

  const limpiar = useCallback(() => {
    setDatos(null);
    setError(null);
    setCargando(false);
  }, []);

  return {
    datos,
    cargando,
    error,
    ejecutar,
    limpiar,
  };
}

export default useApi;
