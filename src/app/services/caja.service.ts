import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CajaService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/caja';

  private ventasSource = new BehaviorSubject<number>(0);
  ventasActuales$ = this.ventasSource.asObservable();

  private cajaAbiertaSource = new BehaviorSubject<boolean>(false);
  cajaAbierta$ = this.cajaAbiertaSource.asObservable();

  private datosCajaSource = new BehaviorSubject<any>(null);
  datosCaja$ = this.datosCajaSource.asObservable();

  get valorActual(): number {
    return this.ventasSource.value;
  }

  actualizarMonto(nuevoMonto: number) {
    this.ventasSource.next(nuevoMonto);
  }

  getEstadoCaja(): Observable<any> {
    return this.http.get<any>(`${this.url}/estado`).pipe(
      tap((res: any) => {
        const abierta = res.estado === 'ABIERTA';

        this.cajaAbiertaSource.next(abierta);
        this.datosCajaSource.next(abierta ? res : null);

        if (abierta) {
          this.actualizarMonto(res.ingresosSistema || 0);
        } else {
          this.actualizarMonto(0);
        }
      })
    );
  }

  abrirCaja(montoInicial: number): Observable<any> {
    return this.http.post(`${this.url}/abrir`, { montoInicial }).pipe(
      tap(() => {
        this.cajaAbiertaSource.next(true);
        this.actualizarMonto(0);
      })
    );
  }

  cerrarCaja(ingresosDeclarados: number, ingresosSistema: number): Observable<any> {
    return this.http.post(`${this.url}/cerrar`, { ingresosDeclarados, ingresosSistema }).pipe(
      tap(() => {
        this.cajaAbiertaSource.next(false);
        this.datosCajaSource.next(null);
        this.actualizarMonto(0);
      })
    );
  }

  obtenerHistorialCajas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/historial`);
  }
}