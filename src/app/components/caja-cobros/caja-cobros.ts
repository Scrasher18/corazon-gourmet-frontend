import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CajaService } from '../../services/caja.service';
import { VentaService } from '../../services/venta.service';
import { LucideAngularModule, Lock, Unlock, Receipt, Search, UtensilsCrossed } from 'lucide-angular';
import Swal from 'sweetalert2';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-caja-cobros',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './caja-cobros.html',
  styleUrl: './caja-cobros.css'
})
export class CajaCobrosComponent implements OnInit, OnDestroy {
  private cajaService = inject(CajaService);
  private ventaService = inject(VentaService);
  private subscription: Subscription = new Subscription();

  numeroMesa: string = '';
  pedidoActivo: any = null;
  listaDetalles: any[] = [];
  mesasAbiertas: number[] = [];

  cajaAbierta: boolean = false;
  datosCaja: any = null;
  ventasDelDiaSistema: number = 0; 

  readonly LockIcon = Lock;
  readonly UnlockIcon = Unlock;
  readonly ReceiptIcon = Receipt;
  readonly SearchIcon = Search;
  readonly MenuIcon = UtensilsCrossed;

  ngOnInit(): void {
    this.subscription.add(
      this.cajaService.ventasActuales$.subscribe(monto => {
        this.ventasDelDiaSistema = monto;
      })
    );

    this.subscription.add(
      this.cajaService.cajaAbierta$.subscribe(estado => {
        this.cajaAbierta = estado;
      })
    );

    this.subscription.add(
      this.cajaService.datosCaja$.subscribe(datos => {
        this.datosCaja = datos;
      })
    );

    this.verificarEstadoCaja();
    this.cargarMesasAbiertas();

    this.subscription.add(
      interval(12000).subscribe(() => {
        this.cargarMesasAbiertas();
        if (this.numeroMesa) {
          this.buscarMesa();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  verificarEstadoCaja(): void {
    const rolLogueado = sessionStorage.getItem('rol_usuario');
    if (rolLogueado !== 'CAJA' && rolLogueado !== 'ADMINISTRADOR') {
      return;
    }

    this.cajaService.getEstadoCaja().subscribe({
      error: (err) => console.error(err)
    });
  }

  abrirCaja(): void {
    Swal.fire({
      title: 'Apertura de Caja',
      text: 'Ingresa el efectivo físico con el que inicias el turno (Fondo de caja):',
      input: 'number',
      inputPlaceholder: 'Ej. 50.00',
      inputAttributes: { min: '0', step: '0.10' },
      showCancelButton: true,
      confirmButtonText: 'Abrir Turno',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4A3525',
      cancelButtonColor: '#A39183',
      inputValidator: (value) => (!value || Number(value) < 0) ? 'Debes ingresar un monto válido' : null
    }).then((result) => {
      if (result.isConfirmed) {
        const monto = parseFloat(result.value);

        this.cajaService.abrirCaja(monto).subscribe({
          next: () => {
            Swal.fire('¡Caja Abierta!', 'El turno ha iniciado.', 'success');
            this.verificarEstadoCaja();
          },
          error: (err) => {
            if (err.status === 400 || err.status === 500) {
              Swal.fire({
                icon: 'error',
                title: 'No se puede abrir',
                text: err.error?.error || err.error?.message || 'Ya tienes una caja abierta en otra sesión.',
                confirmButtonColor: '#D96C6B'
              });
            } else {
              Swal.fire('Error', 'Ocurrió un error inesperado al conectar con el servidor.', 'error');
            }
          }
        });
      }
    });
  }

  cerrarCaja(): void {
    Swal.fire({
      title: 'Cierre de Caja',
      html: `
        <div style="text-align: left; background: #FDFBF9; padding: 15px; border-radius: 10px; border: 1px solid #E3D5CA; margin-bottom: 15px;">
          <p style="margin: 0 0 5px 0; color: #4A3525;">Monto Apertura: <b style="color: #4A3525;">S/ ${this.datosCaja?.montoInicial?.toFixed(2)}</b></p>
          <p style="margin: 0 0 15px 0; color: #4A3525;">Ventas Sistema: <b style="color: #4A3525;">S/ ${this.ventasDelDiaSistema.toFixed(2)}</b></p>
          <p style="margin: 0; font-size: 13px; color: #D96C6B; font-weight: bold;">Suma el efectivo físico de la caja MÁS los totales de tus billeteras digitales (Yape/Plin) y tarjetas, e ingresa el GRAN TOTAL aquí abajo:</p>
        </div>
      `,
      input: 'number',
      inputPlaceholder: 'Ej. 350.00 (Efectivo + Digital + Tarjetas)',
      inputAttributes: { min: '0', step: '0.10' },
      showCancelButton: true,
      confirmButtonText: 'Finalizar Turno',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#D96C6B',
      cancelButtonColor: '#A39183',
      inputValidator: (value) => !value ? 'Ingresa el monto total físico en caja' : null
    }).then((result) => {
      if (result.isConfirmed) {
        this.cajaService.cerrarCaja(parseFloat(result.value), this.ventasDelDiaSistema).subscribe({
          next: (res) => {
            let msg = res.diferencia === 0 ? 'Caja cuadrada exactamente.' : 
                      (res.diferencia > 0 ? `Sobrante en caja: S/ ${res.diferencia.toFixed(2)}` : `Faltante en caja: S/ ${Math.abs(res.diferencia).toFixed(2)}`);
            Swal.fire('Turno Finalizado', msg, res.diferencia === 0 ? 'success' : 'warning');
            this.verificarEstadoCaja();
          },
          error: () => Swal.fire('Error', 'No se pudo cerrar la caja', 'error')
        });
      }
    });
  }

  cargarMesasAbiertas(): void {
    this.ventaService.listarHistorial().subscribe({
      next: (res) => {
        const activas = res.filter(p => p.estado === 'ABIERTA').map(p => p.mesa);
        this.mesasAbiertas = [...new Set(activas)].sort((a, b) => a - b);
      }
    });
  }

  seleccionarMesa(mesaNum: number): void {
    this.numeroMesa = mesaNum.toString();
    this.buscarMesa();
  }

  buscarMesa(): void {
    if (!this.numeroMesa) return;
    this.ventaService.obtenerMesaActiva(Number(this.numeroMesa)).subscribe({
      next: (pedido) => {
        this.pedidoActivo = pedido;
        this.listaDetalles = pedido?.detalles || [];
      },
      error: () => {
        this.limpiarBusqueda();
      }
    });
  }

  limpiarBusqueda(): void {
    this.pedidoActivo = null;
    this.listaDetalles = [];
  }

  cobrarYEmitirBoleta(): void {
    if (!this.cajaAbierta) {
      Swal.fire('Caja Cerrada', 'Abre el turno antes de cobrar.', 'warning');
      return;
    }
    
    const inputPago = document.querySelector('input[name="metodoPago"]:checked') as HTMLInputElement;
    const metodoPago = inputPago ? inputPago.value : 'EFECTIVO';
    const totalCobrado = this.pedidoActivo.montoTotal;

    this.ventaService.procesarCierreMesa(Number(this.numeroMesa), metodoPago).subscribe({
      next: (response: Blob) => {
        const url = window.URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        const fecha = new Date().getTime();
        link.download = `Boleta_Mesa_${this.numeroMesa}_${fecha}.pdf`;
        link.click();
        this.cajaService.actualizarMonto(this.ventasDelDiaSistema + totalCobrado);
        Swal.fire('Éxito', 'Pago procesado.', 'success');
        this.limpiarBusqueda();
        this.numeroMesa = '';
        this.cargarMesasAbiertas();
      },
      error: (err) => Swal.fire('Error', err.error?.error || err.error?.message || 'No se pudo procesar el pago.', 'error')
    });
  }
}