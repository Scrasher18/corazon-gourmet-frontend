import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../services/venta.service';

@Component({
  selector: 'app-pedido-reporte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedido-reporte.html',
  styleUrl: './pedido-reporte.css',
})
export class PedidoReporte implements OnInit {
  private ventaService = inject(VentaService);

  historialPedidos: any[] = [];
  txtBuscar: string = '';

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.ventaService.listarHistorial().subscribe({
      next: (data: any[]) => {
  
        this.historialPedidos = data.sort((a, b) => b.id - a.id);
      },
      error: (err) => {
        console.error('Error al mapear el historial de operaciones desde el backend:', err);
      }
    });
  }


  get pedidosFiltrados(): any[] {
    if (!this.txtBuscar.trim()) {
      return this.historialPedidos;
    }

    const busqueda = this.txtBuscar.toLowerCase().trim();

    return this.historialPedidos.filter(pedido => {
      const cumpleMesa = pedido.mesa ? pedido.mesa.toString().includes(busqueda) : false;
      const cumpleNombre = pedido.nombreCliente ? pedido.nombreCliente.toLowerCase().includes(busqueda) : false;
      const cumpleDni = pedido.dniCliente ? pedido.dniCliente.includes(busqueda) : false;

      return cumpleMesa || cumpleNombre || cumpleDni;
    });
  }
}