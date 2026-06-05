import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Menu {
  id?: number; 
  nombreItem: string;     
  precioNormal: number;   
  precioConadis?: number;
  stockDisponible?: number;
  categoria: string;
  imagenUrl?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/menus';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  listarTodos(): Observable<Menu[]> {
    return this.http.get<Menu[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  listarPorCategoria(categoria: string): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.apiUrl}/categoria/${categoria}`, { headers: this.getHeaders() });
  }

  registrarMenu(menu: Menu): Observable<Menu> {
    return this.http.post<Menu>(this.apiUrl, menu, { headers: this.getHeaders() });
  }

  actualizarMenu(id: number, menu: Menu): Observable<Menu> {
    return this.http.put<Menu>(`${this.apiUrl}/${id}`, menu, { headers: this.getHeaders() });
  }

  eliminarMenu(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}