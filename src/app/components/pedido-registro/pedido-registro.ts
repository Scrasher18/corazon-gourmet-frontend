import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService, Menu } from '../../services/menu.service';
import { VentaService } from '../../services/venta.service';
import Swal from 'sweetalert2';
import { Subscription, interval } from 'rxjs';

interface Comensal {
  id: number;
  tipoServicio: 'CARTA' | 'MENU' | 'NINGUNO';
  platoSeleccionado?: string;
  entradaSeleccionada?: string;
  bebidaSeleccionada?: string;
  isConadis: boolean;          
  precio: number;              
}

interface ItemExtra {
  item: Menu;
  cantidad: number;
}

interface OrdenGuardada {
  mesa: number;
  totalPersonas: number;
  usuarioDni?: string;
  detalles: Comensal[];
  postres: any[];
  bebidasExtra: any[];
  totalPagar: number;
}

@Component({
  selector: 'app-pedido-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedido-registro.html',
  styleUrl: './pedido-registro.css'
})
export class PedidoRegistroComponent implements OnInit, OnDestroy {
  private menuService = inject(MenuService);
  private ventaService = inject(VentaService);
  private subscription: Subscription = new Subscription();

  usuarioDni: string = '';
  numMesa: number = 1;
  totalComensales: number = 1;
  comensales: Comensal[] = [];

  opcionesMenu: Menu[] = [];
  opcionesCarta: Menu[] = [];
  optionsCompletoBase: Menu[] = [];
  opcionesEntradas: Menu[] = [];
  opcionesBebidas: Menu[] = [];
  
  postresConCantidad: ItemExtra[] = [];
  bebidasExtraConCantidad: ItemExtra[] = [];

  ordenesActivas: OrdenGuardada[] = [];
  mesaOcupadaError: boolean = false;
  mesaEnEdicion: number | null = null;

  ngOnInit(): void {
    this.obtenerUsuarioSesion();
    this.actualizarComensales();
    this.cargarItemsMenu();
    this.recuperarMesasActivas();

    this.subscription.add(
      interval(7000).subscribe(() => {
        this.recuperarMesasActivas();
        this.cargarItemsMenu(); 
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  obtenerUsuarioSesion(): void {
    const dniLogueado = sessionStorage.getItem('dni_usuario');
    if (dniLogueado) {
      this.usuarioDni = dniLogueado;
    } else {
      this.usuarioDni = '12345678';
    }
  }

  recuperarMesasActivas(): void {
    this.ventaService.obtenerMesasActivas().subscribe({
      next: (mesas) => {
        this.ordenesActivas = mesas || [];
        this.validarMesa();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  cargarItemsMenu(): void {
    this.menuService.listarTodos().subscribe({
      next: (items) => {
        this.optionsCompletoBase = items;
        this.filtrarOpcionesMenuConItems(items);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  private filtrarOpcionesMenuConItems(items: Menu[]): void {
    const ordenActual = this.ordenesActivas.find(o => o.mesa === this.numMesa);

    const disponibles = items.filter(item => {
      if ((item.stockDisponible || 0) > 0) return true;

      if (ordenActual) {
        const enDetalles = ordenActual.detalles?.some(d => 
          d.platoSeleccionado === item.nombreItem || 
          d.entradaSeleccionada === item.nombreItem || 
          d.bebidaSeleccionada === item.nombreItem
        );
        if (enDetalles) return true;

        const enPostres = ordenActual.postres?.some((p: any) => p.item.nombreItem === item.nombreItem);
        if (enPostres) return true;

        const enBebidas = ordenActual.bebidasExtra?.some((b: any) => b.item.nombreItem === item.nombreItem);
        if (enBebidas) return true;
      }

      const enComensales = this.comensales.some(c => 
        c.platoSeleccionado === item.nombreItem || 
        c.entradaSeleccionada === item.nombreItem || 
        c.bebidaSeleccionada === item.nombreItem
      );
      if (enComensales) return true;

      return false;
    });

    this.opcionesMenu = disponibles.filter(item => item.categoria === 'PLATO_FONDO');
    this.opcionesCarta = disponibles.filter(item => item.categoria === 'PLATO_ESPECIAL');
    this.opcionesEntradas = disponibles.filter(item => item.categoria === 'ENTRADA');
    this.opcionesBebidas = disponibles.filter(item => item.categoria === 'BEBIDA');
    
    const nuevosPostres = disponibles.filter(item => item.categoria === 'POSTRE_ADICIONAL'); 
    this.postresConCantidad = nuevosPostres.map(p => {
      const existente = this.postresConCantidad.find(old => old.item.nombreItem === p.nombreItem);
      return { item: p, Math, cantidad: existente ? existente.cantidad : 0 };
    });

    const nuevasBebidas = disponibles.filter(item => item.categoria === 'BEBIDA_EXTRA'); 
    this.bebidasExtraConCantidad = nuevasBebidas.map(b => {
      const existente = this.bebidasExtraConCantidad.find(old => old.item.nombreItem === b.nombreItem);
      return { item: b, cantidad: existente ? existente.cantidad : 0 };
    });
  }

  ajustarMesa(cantidad: number): void {
    if (this.numMesa + Math.floor(cantidad) >= 1) {
      this.numMesa += cantidad;
      this.alCambiarMesaManualmente();
    }
  }

  alCambiarMesaManualmente(): void {
    if (this.numMesa < 1 || isNaN(this.numMesa)) {
      this.numMesa = 1;
    }
    
    if (this.mesaEnEdicion && this.numMesa !== this.mesaEnEdicion) {
      this.mesaEnEdicion = null;
    }

    this.totalComensales = 1;
    this.comensales = [];
    this.actualizarComensales();
    this.postresConCantidad.forEach(p => p.cantidad = 0);
    this.bebidasExtraConCantidad.forEach(b => b.cantidad = 0);
    
    this.filtrarOpcionesMenuConItems(this.optionsCompletoBase);
    this.validarMesa();
  }

  validarMesa(): void {
    this.mesaOcupadaError = this.ordenesActivas.some(o => o.mesa === this.numMesa && this.numMesa !== this.mesaEnEdicion);
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
        this.comensales.push({ id: i + 1, tipoServicio: 'NINGUNO', precio: 0, isConadis: false });
      }
    } else {
      this.comensales = this.comensales.slice(0, this.totalComensales);
    }
  }

  seleccionarServicio(comensal: Comensal, tipo: 'CARTA' | 'MENU' | 'NINGUNO'): void {
    if (comensal.tipoServicio === tipo) return; 
    comensal.tipoServicio = tipo;
    comensal.platoSeleccionado = undefined;
    comensal.entradaSeleccionada = undefined;
    comensal.bebidaSeleccionada = undefined;
    this.recalcularPrecioComensal(comensal);
  }

  seleccionarPlato(comensal: Comensal, plato: Menu): void {
    if (!comensal) return;
    if (comensal.platoSeleccionado === plato.nombreItem) {
      comensal.platoSeleccionado = undefined;
    } else {
      comensal.platoSeleccionado = plato.nombreItem;
    }
    this.recalcularPrecioComensal(comensal); 
  }

  cambiarTarifaIndividual(comensal: Comensal): void {
    this.recalcularPrecioComensal(comensal); 
  }

  seleccionarEntrada(comensal: Comensal, entrada: string): void {
    if (!comensal) return;
    if (comensal.entradaSeleccionada === entrada) {
      comensal.entradaSeleccionada = undefined;
    } else {
      comensal.entradaSeleccionada = entrada;
    }
  }

  seleccionarBebida(comensal: Comensal, bebida: string): void {
    if (!comensal) return;
    if (comensal.bebidaSeleccionada === bebida) {
      comensal.bebidaSeleccionada = undefined;
    } else {
      comensal.bebidaSeleccionada = bebida;
    }
    this.recalcularPrecioComensal(comensal);
  }

  ajustarCantidadExtra(extra: ItemExtra, delta: number): void {
    if (extra.cantidad + delta >= 0) {
      extra.cantidad += delta;
    }
  }

  private recalcularPrecioComensal(comensal: Comensal): void {
    if (!comensal) return;
    let precioAcumulado = 0;
    if (comensal.platoSeleccionado) {
      const platoOriginal = this.optionsCompletoBase.find(p => p.nombreItem === comensal.platoSeleccionado);
      if (platoOriginal) {
        precioAcumulado += comensal.isConadis ? (platoOriginal.precioConadis || 0) : (platoOriginal.precioNormal || 0);
      }
    }
    if (comensal.tipoServicio === 'CARTA' && comensal.bebidaSeleccionada) {
      const bebidaOriginal = this.opcionesBebidas.find(b => b.nombreItem === comensal.bebidaSeleccionada);
      if (bebidaOriginal) {
        precioAcumulado += comensal.isConadis ? (bebidaOriginal.precioConadis || 0) : (bebidaOriginal.precioNormal || 0);
      }
    }
    comensal.precio = precioAcumulado;
  }

  calcularTotal(): number {
    let totalComensales = this.comensales.reduce((acc, c) => acc + c.precio, 0);
    let totalExtras = 0;
    this.postresConCantidad.forEach(p => totalExtras += p.cantidad * (p.item.precioNormal || 0));
    this.bebidasExtraConCantidad.forEach(b => totalExtras += b.cantidad * (b.item.precioNormal || 0));
    return totalComensales + totalExtras;
  }

  editarOrden(orden: OrdenGuardada): void {
    if (this.mesaEnEdicion === orden.mesa) {
      this.cancelarEdicion();
      return;
    }
    this.mesaEnEdicion = orden.mesa; 
    this.numMesa = orden.mesa;
    this.totalComensales = orden.totalPersonas;
    
    this.comensales = orden.detalles ? JSON.parse(JSON.stringify(orden.detalles)) : [];
    this.comensales.forEach((c, index) => {
      c.id = index + 1;
      c.isConadis = c.isConadis || false;
    });

    this.filtrarOpcionesMenuConItems(this.optionsCompletoBase);

    this.postresConCantidad.forEach(pBase => {
      const pBackend = orden.postres?.find((pBack: any) => pBack.item.nombreItem === pBase.item.nombreItem);
      pBase.cantidad = pBackend ? pBackend.cantidad : 0;
    });
    this.bebidasExtraConCantidad.forEach(bBase => {
      const bBackend = orden.bebidasExtra?.find((bBack: any) => bBack.item.nombreItem === bBase.item.nombreItem);
      bBase.cantidad = bBackend ? bBackend.cantidad : 0;
    });
    this.validarMesa(); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.mesaEnEdicion = null;
    this.totalComensales = 1;
    this.comensales = [];
    this.actualizarComensales();
    this.postresConCantidad.forEach(p => p.cantidad = 0);
    this.bebidasExtraConCantidad.forEach(b => b.cantidad = 0);
    let mesaSugerida = 1;
    while(this.ordenesActivas.some(o => o.mesa === mesaSugerida)) {
      mesaSugerida++;
    }
    this.numMesa = mesaSugerida;
    this.filtrarOpcionesMenuConItems(this.optionsCompletoBase);
    this.validarMesa();
  }

  guardarComanda(): void {
    if (this.mesaOcupadaError) return;
    if (!this.usuarioDni || this.usuarioDni.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Error de Sesión',
        text: 'No se detectó la sesión del mesero.',
        confirmButtonColor: '#2563EB'
      });
      return;
    }
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
        text: 'Asegúrate de marcar el plato principal y las bebidas requeridas.',
        confirmButtonColor: '#2563EB'
      });
      return;
    }

    let resumenHTML = `<div style="text-align: left; max-height: 45vh; overflow-y: auto; padding-right: 5px; font-family: sans-serif;">`;

    this.comensales.filter(c => c.tipoServicio !== 'NINGUNO').forEach(c => {
      resumenHTML += `
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px; margin-bottom: 12px;">
          <p style="margin: 0; font-weight: 900; color: #1E293B; font-size: 15px;">Cliente #${c.id} <span style="font-size: 10px; color: #64748B; text-transform: uppercase; background: #E2E8F0; padding: 2px 6px; border-radius: 4px; margin-left: 4px;">${c.tipoServicio}</span></p>
      `;
      if (c.entradaSeleccionada) resumenHTML += `<p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">• <span style="font-weight: bold;">Entrada:</span> ${c.entradaSeleccionada}</p>`;
      if (c.platoSeleccionado) resumenHTML += `<p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">• <span style="font-weight: bold; color: #2563EB;">Fondo:</span> ${c.platoSeleccionado}</p>`;
      if (c.bebidaSeleccionada) resumenHTML += `<p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">• <span style="font-weight: bold;">Bebida:</span> ${c.bebidaSeleccionada}</p>`;
      if (c.isConadis) resumenHTML += `<p style="margin: 6px 0 0 0; font-size: 11px; color: #EC4899; font-weight: 900; display: inline-block; background: #FDF2F8; padding: 2px 6px; border-radius: 4px;">TARIFA CONADIS</p>`;
      resumenHTML += `</div>`;
    });

    const postresActivos = this.postresConCantidad.filter(p => p.cantidad > 0);
    const bebidasActivas = this.bebidasExtraConCantidad.filter(b => b.cantidad > 0);

    if (postresActivos.length > 0 || bebidasActivas.length > 0) {
      resumenHTML += `
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px; margin-bottom: 12px;">
          <p style="margin: 0 0 8px 0; font-weight: 900; color: #1E293B; font-size: 15px;">🛒 Extras</p>
      `;
      postresActivos.forEach(p => {
        resumenHTML += `<p style="margin: 2px 0 0 0; font-size: 13px; color: #475569;">• <span style="font-weight: bold; color: #2563EB;">${p.cantidad}x</span> ${p.item.nombreItem}</p>`;
      });
      bebidasActivas.forEach(b => {
        resumenHTML += `<p style="margin: 2px 0 0 0; font-size: 13px; color: #475569;">• <span style="font-weight: bold; color: #2563EB;">${b.cantidad}x</span> ${b.item.nombreItem}</p>`;
      });
      resumenHTML += `</div>`;
    }

    resumenHTML += `</div>`;

    Swal.fire({
      title: `Resumen - Mesa ${this.numMesa}`,
      html: resumenHTML,
      showCancelButton: true,
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: this.mesaEnEdicion ? 'Sí, Actualizar' : 'Sí, Marchar Pedido',
      cancelButtonText: 'Seguir Editando',
      width: '500px',
      footer: `<div style="text-align: right; width: 100%; border-top: 1px solid #E2E8F0; padding-top: 10px;"><span style="font-size: 20px; font-weight: 900; color: #0F172A;">Total: S/ ${this.calcularTotal().toFixed(2)}</span></div>`
    }).then((result) => {
      if (result.isConfirmed) {
        const comandaData = {
          mesa: this.numMesa,
          totalPersonas: this.totalComensales,
          usuarioDni: this.usuarioDni,
          detalles: this.comensales
            .filter(c => c.tipoServicio !== 'NINGUNO')
            .map(c => ({
              tipoServicio: c.tipoServicio,
              platoSeleccionado: c.platoSeleccionado,
              entradaSeleccionada: c.tipoServicio === 'MENU' ? (c.entradaSeleccionada || '') : '',
              bebidaSeleccionada: c.bebidaSeleccionada ? c.bebidaSeleccionada : '', 
              precio: c.precio || 0,
              isConadis: !!c.isConadis
            })),
          postres: postresActivos
            .map(p => ({
              item: { nombreItem: p.item.nombreItem, precioNormal: p.item.precioNormal },
              cantidad: p.cantidad
            })),
          bebidasExtra: bebidasActivas
            .map(b => ({
              item: { nombreItem: b.item.nombreItem, precioNormal: b.item.precioNormal },
              cantidad: b.cantidad
            })),
          extrasMesa: [],
          totalPagar: this.calcularTotal()
        };

        this.ventaService.guardarPedidoMesa(comandaData).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: this.mesaEnEdicion ? '¡Mesa Actualizada!' : '¡Pedido Creado!',
              text: `Mesa ${this.numMesa} sincronizada en cocina.`,
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              this.cancelarEdicion();
              this.recuperarMesasActivas();
            });
          },
          error: (err) => {
            const mensajeError = err.error?.message || err.error?.error || 'Ocurrió un error al guardar el pedido.';
            Swal.fire({
              icon: 'error',
              title: 'Acción Denegada',
              text: mensajeError,
              confirmButtonColor: '#2563EB'
            });
          }
        });
      }
    });
  }
}