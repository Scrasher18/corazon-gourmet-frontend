export interface Usuario {
  dni: string;
  nombre: string;
  apellido: string;
  telefono?: string; 
  contrasenia?: string;

  rol: 'ADMINISTRADOR' | 'MESERO' | 'CAJA'; 
  activo: boolean;
}