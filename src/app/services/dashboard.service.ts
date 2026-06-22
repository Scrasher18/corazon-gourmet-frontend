import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/dashboard';

  getMetricas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/metricas`);
  }

  getGraficoVentas(periodo: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/grafico-ventas?periodo=${periodo}`);
  }
}