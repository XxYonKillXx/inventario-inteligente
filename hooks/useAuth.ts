'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  iniciarSesion, guardarSesion, cerrarSesion,
  obtenerUsuario, estaAutenticado,
} from '@/services/auth.service';
import type { LoginCredenciales } from '@/services/auth.service';

interface Usuario {
  id: number; nombre: string; apellido?: string;
  correo: string; rol: string; rol_id: number;
}

export function useAuth() {
  const router  = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    try {
      const u = obtenerUsuario();
      setUsuario(estaAutenticado() && u ? (u as unknown as Usuario) : null);
    } catch {
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  }, []);

  const login = useCallback(async (credenciales: LoginCredenciales): Promise<boolean> => {
    setCargando(true); setError(null);
    try {
      const resp = await iniciarSesion(credenciales);
      guardarSesion(resp);
      setUsuario(resp.usuario as unknown as Usuario);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      return false;
    } finally {
      setCargando(false);
    }
  }, []);

  const logout = useCallback(() => {
    cerrarSesion();
    setUsuario(null); setError(null);
    router.replace('/login');
  }, [router]);

  return { usuario, cargando, error, login, logout, estaAutenticado: Boolean(usuario) };
}

export default useAuth;
