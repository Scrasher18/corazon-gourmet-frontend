import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../services/venta.service';
import { LucideAngularModule, Search, Receipt } from 'lucide-angular';

@Component({
  selector: 'app-pedido-reporte',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  providers: [DatePipe, DecimalPipe],
  templateUrl: './pedido-reporte.html',
  styleUrl: './pedido-reporte.css',
})
export class PedidoReporte implements OnInit {
  private ventaService = inject(VentaService);

  readonly SearchIcon = Search;
  readonly ReceiptIcon = Receipt;

  historialPedidos: any[] = [];
  txtBuscar: string = '';
  filtroTiempo: string = 'TODOS';

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.ventaService.listarHistorial().subscribe({
      next: (data: any[]) => {
        this.historialPedidos = data.sort((a, b) => b.id - a.id);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  get pedidosFiltrados(): any[] {
    let filtrados = this.historialPedidos;

    if (this.filtroTiempo !== 'TODOS') {
      const hoy = new Date();
      filtrados = filtrados.filter(pedido => {
        if (!pedido.fecha) return false;
        
        const fechaCadena = typeof pedido.fecha === 'string' ? pedido.fecha : pedido.fecha.toString();
        const fechaPedido = new Date(fechaCadena.replace(' ', 'T')); 
        
        if (this.filtroTiempo === 'HOY') {
          return fechaPedido.getDate() === hoy.getDate() &&
                 fechaPedido.getMonth() === hoy.getMonth() &&
                 fechaPedido.getFullYear() === hoy.getFullYear();
        } else if (this.filtroTiempo === 'MES') {
          return fechaPedido.getMonth() === hoy.getMonth() &&
                 fechaPedido.getFullYear() === hoy.getFullYear();
        }
        return true;
      });
    }

    if (this.txtBuscar.trim()) {
      const busqueda = this.txtBuscar.toLowerCase().trim();
      filtrados = filtrados.filter(pedido => {
        const cumpleMesa = pedido.mesa ? pedido.mesa.toString().includes(busqueda) : false;
        
        const nombreMesero = pedido.usuario ? `${pedido.usuario.nombre} ${pedido.usuario.apellido}`.toLowerCase() : '';
        const cumpleMesero = nombreMesero.includes(busqueda);

        const nombreCajero = pedido.cajero ? `${pedido.cajero.nombre} ${pedido.cajero.apellido}`.toLowerCase() : '';
        const cumpleCajero = nombreCajero.includes(busqueda);

        return cumpleMesa || cumpleMesero || cumpleCajero;
      });
    }

    return filtrados;
  }
}