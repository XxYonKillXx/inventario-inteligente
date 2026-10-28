/**
 * services/auth.service.ts
 * Usa `correo` (columna real de la BD) en lugar de `email`.
 */
import { post, get }  from '@/lib/api';
import type { Usuario, LoginRespuesta } from '@/types/auth';

export interface LoginCredenciales {
  correo:   string;
  password: string;
}

const TOKEN_KEY  = 'ii_token';
const USUARIO_KEY = 'ii_usuario';

const isClient = typeof window !== 'undefined';

export async function iniciarSesion(credenciales: LoginCredenciales): Promise<LoginRespuesta> {
  return post<LoginRespuesta>('/auth/login', credenciales);
}

export function guardarSesion(respuesta: LoginRespuesta): void {
  if (!isClient) return;
  localStorage.setItem(TOKEN_KEY,   respuesta.token);
  localStorage.setItem(USUARIO_KEY, JSON.stringify(respuesta.usuario));
}

export function cerrarSesion(): void {
  if (!isClient) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
}

export function obtenerToken(): string | null {
  if (!isClient) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function obtenerUsuario(): Usuario | null {
  if (!isClient) return null;
  try {
    const raw = localStorage.getItem(USUARIO_KEY);
    return raw ? (JSON.parse(raw) as Usuario) : null;
  } catch {
    return null;
  }
}

export function estaAutenticado(): boolean {
  return !!obtenerToken();
}

export async function obtenerPerfil(): Promise<{ usuario: Usuario }> {
  return get<{ usuario: Usuario }>('/auth/perfil');
}
