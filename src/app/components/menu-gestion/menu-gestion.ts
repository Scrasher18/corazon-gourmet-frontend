import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { MenuService, Menu } from '../../services/menu.service'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menu-gestion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-gestion.html',
  styleUrl: './menu-gestion.css'
})
export class MenuGestion implements OnInit {
  private menuService = inject(MenuService);

  listaMenus: Menu[] = [];
  txtBuscar: string = '';
  categoriaSeleccionada: string = '';

  mostrarModal: boolean = false;
  esEdicion: boolean = false;
  
  nuevoPlato: Menu = {
    nombreItem: '',
    precioNormal: 0,
    precioConadis: 0,
    categoria: 'PLATO_FONDO'
  };

  ngOnInit(): void {
    this.cargarMenus();
  }

  cargarMenus(): void {
    this.menuService.listarTodos().subscribe({
      next: (data) => {
        this.listaMenus = data;
      },
      error: (err) => console.error(err)
    });
  }

  get menusFiltrados(): Menu[] {
    return this.listaMenus.filter(plato => {
      const nombrePlato = plato.nombreItem || ''; 
      const cumpleTexto = nombrePlato.toLowerCase().includes(this.txtBuscar.toLowerCase());
      const cumpleCategoria = this.categoriaSeleccionada === '' || plato.categoria === this.categoriaSeleccionada;
      return cumpleTexto && cumpleCategoria;
    });
  }

  verificarCategoriaPrecio(): void {
    if (this.nuevoPlato.categoria === 'ENTRADA' || this.nuevoPlato.categoria === 'BEBIDA') {
      this.nuevoPlato.precioNormal = 0;
      this.nuevoPlato.precioConadis = 0;
    }
  }

  toggleDisponibilidad(plato: Menu): void {
    if (plato.id === undefined) return;
    
    const nuevoStock = plato.stockDisponible === 0 ? 1 : 0;
    const platoActualizado = { ...plato, stockDisponible: nuevoStock };
    
    this.menuService.actualizarMenu(plato.id, platoActualizado).subscribe({
      next: () => {
        const estadoTexto = nuevoStock === 1 ? 'Disponible' : 'Agotado';
        Swal.fire({
          icon: 'success',
          title: `Plato ${estadoTexto}`,
          text: `"${plato.nombreItem}" se marcó como ${estadoTexto.toLowerCase()}.`,
          timer: 1500,
          showConfirmButton: false
        });
        this.cargarMenus();
      },
      error: (err) => console.error(err)
    });
  }

  eliminarPlato(plato: Menu): void {
    if (plato.id === undefined) return;

    Swal.fire({
      title: '¿Retirar de la carta?',
      text: `Se eliminará permanentemente "${plato.nombreItem}" del menú general.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, retirar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.menuService.eliminarMenu(plato.id!).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Retirado',
              text: 'El elemento fue removido de la base de datos.',
              timer: 1500,
              showConfirmButton: false
            });
            this.cargarMenus();
          },
          error: (err) => {
            console.error(err);
            Swal.fire({
              icon: 'error',
              title: 'No se puede eliminar',
              text: 'Este plato o bebida ya forma parte de un pedido o comanda histórica.',
              confirmButtonColor: '#dc2626'
            });
          }
        });
      }
    });
  }

  abrirModal(): void {
    this.esEdicion = false;
    this.mostrarModal = true;
    this.nuevoPlato = { nombreItem: '', precioNormal: 0, precioConadis: 0, categoria: 'PLATO_FONDO', stockDisponible: 1 }; 
  }

  abrirModalEditar(plato: Menu): void {
    this.esEdicion = true;
    this.mostrarModal = true;
    this.nuevoPlato = { ...plato };
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarPlato(): void {
    if (!this.nuevoPlato.nombreItem) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, introduce el nombre del elemento.',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    const esGratuito = this.nuevoPlato.categoria === 'ENTRADA' || this.nuevoPlato.categoria === 'BEBIDA';

    if (!esGratuito && (!this.nuevoPlato.precioNormal || this.nuevoPlato.precioNormal <= 0)) {
      Swal.fire({
        icon: 'warning',
        title: 'Verifica el precio',
        text: 'Los platos de fondo, platos especiales, bebidas extras y postres deben tener un precio mayor a 0.',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    if (esGratuito) {
      this.nuevoPlato.precioNormal = 0;
      this.nuevoPlato.precioConadis = 0;
    }

    if (this.esEdicion) {
      this.menuService.actualizarMenu(this.nuevoPlato.id!, this.nuevoPlato).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Carta Actualizada!',
            text: 'Los cambios se guardaron correctamente.',
            timer: 2000,
            showConfirmButton: false
          });
          this.cargarMenus();
          this.cerrarModal();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.nuevoPlato.stockDisponible = 1;
      this.menuService.registrarMenu(this.nuevoPlato).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Agregado con éxito!',
            text: 'El nuevo elemento ya está disponible para el sistema de comandas.',
            timer: 2000,
            showConfirmButton: false
          });
          this.cargarMenus();
          this.cerrarModal();
        },
        error: (err) => console.error(err)
      });
    }
  }
}