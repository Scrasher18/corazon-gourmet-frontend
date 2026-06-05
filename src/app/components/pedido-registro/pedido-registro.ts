import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService, Menu } from '../../services/menu.service';
import { VentaService } from '../../services/venta.service';
import Swal from 'sweetalert2';

interface Comensal {
  id: number;
  tipoServicio: 'CARTA' | 'MENU' | 'NINGUNO';
  platoSeleccionado?: string;
  entradaSeleccionada?: string;
  bebidaSeleccionada?: string;
  precio: number;
}

@Component({
  selector: 'app-pedido-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedido-registro.html',
  styleUrl: './pedido-registro.css'
})
export class PedidoRegistroComponent implements OnInit {
  private menuService = inject(MenuService);
  private ventaService = inject(VentaService);

  numMesa: number = 1;
  totalComensales: number = 1;
  comensales: Comensal[] = [];
  isConadis: boolean = false;

  opcionesMenu: Menu[] = [];
  opcionesCarta: Menu[] = [];
  optionsCompletoBase: Menu[] = [];
  opcionesEntradas: Menu[] = [];
  opcionesBebidas: Menu[] = [];

  ngOnInit(): void {
    this.actualizarComensales();
    this.cargarItemsMenu();
  }

  cargarItemsMenu(): void {
    this.menuService.listarTodos().subscribe({
      next: (items) => {
        this.optionsCompletoBase = items;
        this.opcionesMenu = items.filter(item => item.categoria === 'PLATO_FONDO');
        this.opcionesCarta = items.filter(item => item.categoria === 'PLATO_ESPECIAL');
        this.opcionesEntradas = items.filter(item => item.categoria === 'ENTRADA');
        this.opcionesBebidas = items.filter(item => item.categoria === 'BEBIDA');
      },
      error: (err) => {
        console.error('Error al mapear platos:', err);
      }
    });
  }

  ajustarMesa(cantidad: number): void {
    if (this.numMesa + cantidad >= 1) {
      this.numMesa += cantidad;
    }
  }

  validarMesa(): void {
    if (this.numMesa < 1 || isNaN(this.numMesa)) {
      this.numMesa = 1;
    }
  }

  ajustarComensales(cantidad: number): void {
    if (this.totalComensales + cantidad >= 1 && this.totalComensales + cantidad <= 12) {
      this.totalComensales += cantidad;
      this.actualizarComensales();
    }
  }

  actualizarComensales(): void {
    const actuales = this.comensales.length;
    if (this.totalComensales > actuales) {
      for (let i = actuales; i < this.totalComensales; i++) {
        this.comensales.push({ id: i + 1, tipoServicio: 'NINGUNO', precio: 0 });
      }
    } else {
      this.comensales = this.comensales.slice(0, this.totalComensales);
    }
  }

  seleccionarServicio(index: number, tipo: 'CARTA' | 'MENU' | 'NINGUNO'): void {
    this.comensales[index].tipoServicio = tipo;
    this.comensales[index].platoSeleccionado = undefined;
    this.comensales[index].entradaSeleccionada = undefined;
    this.comensales[index].bebidaSeleccionada = undefined;
    this.comensales[index].precio = 0;
  }


  seleccionarPlato(index: number, plato: Menu): void {
    this.comensales[index].platoSeleccionado = plato.nombreItem;
    
    const precioBase = this.isConadis ? plato.precioConadis : plato.precioNormal;
    this.comensales[index].precio = precioBase || 0;
  }


  cambiarTarifaGlobal(): void {
    this.comensales.forEach((comensal) => {
      if (comensal.platoSeleccionado) {
        const itemOriginal = this.optionsCompletoBase.find(p => p.nombreItem === comensal.platoSeleccionado);
        if (itemOriginal) {
          const precioBase = this.isConadis ? itemOriginal.precioConadis : itemOriginal.precioNormal;
          comensal.precio = precioBase || 0;
        }
      }
    });
  }

  seleccionarEntrada(index: number, entrada: string): void {
    this.comensales[index].entradaSeleccionada = entrada;
  }

  seleccionarBebida(index: number, bebida: string): void {
    this.comensales[index].bebidaSeleccionada = bebida;
  }

  calcularTotal(): number {
    return this.comensales.reduce((acc, c) => acc + c.precio, 0);
  }

  guardarComanda(): void {
    const ordenesIncompletas = this.comensales.some(c => {
      if (c.tipoServicio === 'NINGUNO') return false;
      if (!c.platoSeleccionado) return true;
      if (c.tipoServicio === 'MENU' && (!c.entradaSeleccionada || !c.bebidaSeleccionada)) return true;
      return false;
    });

    if (ordenesIncompletas) {
      Swal.fire({
        icon: 'error',
        title: 'Faltan detalles',
        text: 'Asegúrate de marcar el plato principal (y acompañamientos si es menú) de cada cliente activo.',
        confirmButtonColor: '#0f172a'
      });
      return;
    }

    const comandaData = {
      mesa: this.numMesa,
      totalPersonas: this.totalComensales,
      detalles: this.comensales
        .filter(c => c.tipoServicio !== 'NINGUNO')
        .map(c => ({
          tipoServicio: c.tipoServicio,
          platoSeleccionado: c.platoSeleccionado,
          entradaSeleccionada: c.tipoServicio === 'MENU' ? c.entradaSeleccionada : '',
          bebidaSeleccionada: c.tipoServicio === 'MENU' ? c.bebidaSeleccionada : '',
          precio: c.precio
        })),
      totalPagar: this.calcularTotal()
    };

    this.ventaService.guardarPedidoMesa(comandaData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Pedido Agregado!',
          text: `Mesa ${this.numMesa} actualizada en cocina. Celular liberado.`,
          timer: 1800,
          showConfirmButton: false
        }).then(() => {
          this.numMesa = 1;
          this.totalComensales = 1;
          this.comensales = [];
          this.isConadis = false;
          this.actualizarComensales();
        });
      },
      error: (err) => {
        console.error('Error al guardar el pedido por HTTP:', err);
        Swal.fire('Error de Red', 'El servidor no pudo procesar la comanda de la mesa.', 'error');
      }
    });
  }
}