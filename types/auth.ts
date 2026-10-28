export type RolUsuario = 'administrador' | 'empleado';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  createdAt: string;
}

export interface SesionUsuario {
  token: string;
  usuario: Usuario;
  expiracion: string;
}

export interface LoginCredenciales {
  email: string;
  password: string;
}

export interface LoginRespuesta {
  token: string;
  usuario: Usuario;
}

export interface ApiError {
  mensaje: string;
  codigo?: string;
}
