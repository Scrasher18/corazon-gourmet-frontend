import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/auth';

  login(dni: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { dni, password }).pipe(
      tap(response => {
        if (response && response.token) {
          sessionStorage.setItem('token_jwt', response.token);
          sessionStorage.setItem('dni_usuario', response.dni || dni);

          const nombre = response.nombre || '';
          const apellido = response.apellido || '';
          const nombreCompleto = `${nombre} ${apellido}`.trim();

          if (nombreCompleto) {
            sessionStorage.setItem('nombre_usuario', nombreCompleto);
          }

          if (response.rol) {
            sessionStorage.setItem('rol_usuario', response.rol);
          }
        }
      })
    );
  }

  logout(): void {
    sessionStorage.clear();
  }

  getToken(): string | null { 
    return sessionStorage.getItem('token_jwt'); 
  }
  
  getRol(): string | null { 
    return sessionStorage.getItem('rol_usuario'); 
  }
  
  isLoggedIn(): boolean { 
    return !!this.getToken(); 
  }
}