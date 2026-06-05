import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/ventas';
  private apiPedidosUrl = 'http://localhost:8080/api/pedidos'; 


  guardarPedidoMesa(pedidoData: any): Observable<any> {
    return this.http.post<any>(`${this.apiPedidosUrl}/guardar`, pedidoData);
  }


  obtenerMesaActiva(numMesa: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mesa-activa/${numMesa}`);
  }


  procesarCierreMesa(numMesa: number, metodoPago: string): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/procesar-cierre/${numMesa}?metodoPago=${metodoPago}`, {}, {
      responseType: 'blob' 
    });
  }

  listarHistorial(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historial`);
  }
}