import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/pedidos'; 

  guardarPedidoMesa(pedidoData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/guardar`, pedidoData);
  }

  obtenerMesaActiva(numMesa: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mesa-activa/${numMesa}`);
  }

  procesarCierreMesa(numMesa: number, metodoPago: string): Observable<Blob> {
    return this.http.put(`${this.apiUrl}/cerrar-mesa/${numMesa}?metodoPago=${metodoPago}`, {}, {
      responseType: 'blob' 
    });
  }

  listarHistorial(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historial`);
  }

  obtenerMesasActivas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/activos`);
  }
}