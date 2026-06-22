import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  dni: string;
  nombre: string;
  apellido: string;
  telefono: string;
  rol: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/usuarios';


  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  registrarUsuario(usuario: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, usuario);
  }

  actualizarUsuario(dni: string, usuario: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${dni}`, usuario);
  }

  cambiarEstado(dni: string, activo: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${dni}/estado`, { activo });
  }

  eliminarUsuario(dni: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${dni}`);
  }

  cambiarPassword(dto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/cambiar-password`, dto);
  }
}