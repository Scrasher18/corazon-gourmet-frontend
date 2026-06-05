import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-caja-cobros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './caja-cobros.html',
  styleUrl: './caja-cobros.css'
})
export class CajaCobrosComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/ventas';

  numeroMesa: string = '';
  pedidoActivo: any = null;
  listaDetalles: any[] = [];
  mesasAbiertas: number[] = [];

  ngOnInit(): void {
    this.cargarMesasAbiertas();
  }

  cargarMesasAbiertas(): void {
    this.http.get<any[]>(`${this.apiUrl}/historial`).subscribe({
      next: (res) => {
        const activas = res.filter(p => p.estado === 'ABIERTA').map(p => p.mesa);
        this.mesasAbiertas = [...new Set(activas)].sort((a, b) => a - b);
      },
      error: (err) => {
        console.error('Error al cargar mesas activas:', err);
      }
    });
  }

  seleccionarMesa(mesaNum: number): void {
    this.numeroMesa = mesaNum.toString();
    this.buscarMesa();
  }

  buscarMesa(): void {
    if (!this.numeroMesa) return;

    this.http.get<any>(`${this.apiUrl}/mesa-activa/${this.numeroMesa}`).subscribe({
      next: (pedido) => {
        if (pedido) {
          this.pedidoActivo = pedido;
          this.listaDetalles = pedido.detalles || [];
        } else {
          this.limpiarBusqueda();
        }
      },
      error: () => {
        Swal.fire('Mesa limpia', 'No se encontraron consumos activos para esta mesa.', 'info');
        this.limpiarBusqueda();
      }
    });
  }

  limpiarBusqueda(): void {
    this.pedidoActivo = null;
    this.listaDetalles = [];
  }

  cobrarYEmitirBoleta(): void {
    if (!this.pedidoActivo || !this.numeroMesa) return;

    const selectElement = document.getElementById('selectPago') as HTMLSelectElement;
    const metodoPago = selectElement ? selectElement.value : 'EFECTIVO';

    this.http.post(`${this.apiUrl}/procesar-cierre/${this.numeroMesa}?metodoPago=${metodoPago}`, {}, { responseType: 'blob' })
      .subscribe({
        next: (response: Blob) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `boleta_mesa_${this.numeroMesa}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);

          Swal.fire('Pago Procesado', 'La cuenta ha sido cerrada y la boleta generada.', 'success');
          this.limpiarBusqueda();
          this.numeroMesa = '';
          this.cargarMesasAbiertas();
        },
        error: (err) => {
          Swal.fire('Error', 'No se pudo procesar el pago de la mesa.', 'error');
          console.error(err);
        }
      });
  }
}