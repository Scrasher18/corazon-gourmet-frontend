import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // 🚀 Inyección moderna al estilo Angular Standalone
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/auth';

  login(dni: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { dni, password }).pipe(
      tap(response => {
        if (response && response.token) {
          // 🚀 ¡CORREGIDO! Ahora guarda con 'token_jwt' para que el interceptor lo firme automáticamente
          localStorage.setItem('token_jwt', response.token);
          localStorage.setItem('dni_usuario', response.dni || dni);

          // Persistencia flexible del nombre del usuario
          if (response.nombre) {
            localStorage.setItem('nombre_usuario', response.nombre);
          } else if (response.nombreCompleto) {
            localStorage.setItem('nombre_usuario', response.nombreCompleto);
          } else if (response.usuario && response.usuario.nombre) {
            localStorage.setItem('nombre_usuario', response.usuario.nombre);
          }

          // Persistencia del rol del usuario para el control de accesos (Guards/Rutas)
          if (response.rol) {
            localStorage.setItem('rol_usuario', response.rol);
          } else if (response.usuario && response.usuario.rol) {
            localStorage.setItem('rol_usuario', response.usuario.rol);
          }
        }
      })
    );
  }

  logout(): void {
    // 🚀 ¡CORREGIDO! Limpieza de la nueva llave al cerrar sesión
    localStorage.removeItem('token_jwt');
    localStorage.removeItem('dni_usuario');
    localStorage.removeItem('rol_usuario');
    localStorage.removeItem('nombre_usuario');
  }

  // 🚀 ¡CORREGIDO! Métodos utilitarios sincronizados con la nueva firma
  getToken(): string | null { 
    return localStorage.getItem('token_jwt'); 
  }
  
  getRol(): string | null { 
    return localStorage.getItem('rol_usuario'); 
  }
  
  isLoggedIn(): boolean { 
    return !!this.getToken(); 
  }
}