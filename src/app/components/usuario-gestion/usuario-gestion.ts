import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { UsuarioService } from '../../services/usuario.service'; 
import { LucideAngularModule, Search, Pencil, Ban, Trash2, UserPlus } from 'lucide-angular';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuario-gestion',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './usuario-gestion.html',
  styleUrl: './usuario-gestion.css'
})
export class UsuarioGestion implements OnInit {
  private usuarioService = inject(UsuarioService);

  readonly SearchIcon = Search;
  readonly PencilIcon = Pencil;
  readonly BanIcon = Ban;
  readonly Trash2Icon = Trash2;
  readonly UserPlusIcon = UserPlus;

  listaUsuarios: any[] = [];
  txtBuscar: string = '';
  rolSeleccionado: string = '';

  mostrarModal: boolean = false;
  esEdicion: boolean = false;
  
  nuevoUsuario: any = {
    dni: '',
    nombre: '',
    apellido: '',
    telefono: '',
    rol: 'MESERO', 
    password: '',
    activo: true
  };

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.listaUsuarios = data;
      },
      error: (err) => console.error(err)
    });
  }

  get usuariosFiltrados(): any[] {
    return this.listaUsuarios.filter(usuario => {
      const nombreCompleto = `${usuario.nombre} ${usuario.apellido || ''}`.toLowerCase();
      const cumpleTexto = nombreCompleto.includes(this.txtBuscar.toLowerCase()) || 
                          usuario.dni.includes(this.txtBuscar);
      const cumpleRol = this.rolSeleccionado === '' || usuario.rol === this.rolSeleccionado;
      
      return cumpleTexto && cumpleRol;
    });
  }

  toggleEstado(dni: string): void {
    const usuario = this.listaUsuarios.find(u => u.dni === dni);
    if (usuario) {
      const nuevoEstado = !usuario.activo;
      const accionTexto = nuevoEstado ? 'activar' : 'inhabilitar';

      Swal.fire({
        title: `¿Deseas ${accionTexto} al usuario?`,
        text: nuevoEstado 
          ? 'El trabajador recuperará el acceso inmediato al sistema.' 
          : 'El trabajador perderá el acceso al sistema, pero se mantendrá su historial de pedidos.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: nuevoEstado ? '#10b981' : '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: `Sí, ${accionTexto}`,
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.usuarioService.cambiarEstado(dni, nuevoEstado).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: nuevoEstado ? '¡Activado!' : '¡Inhabilitado!',
                text: `El estado del usuario ha sido actualizado con éxito.`,
                timer: 1500,
                showConfirmButton: false
              });
              this.cargarUsuarios();
            },
            error: (err) => console.error(err)
          });
        }
      });
    }
  }

  eliminarTrabajador(dni: string, nombre: string): void {
    Swal.fire({
      title: '¿Eliminar trabajador?',
      text: `Se borrará el perfil de ${nombre} de forma permanente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.eliminarUsuario(dni).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El trabajador ha sido removido.',
              timer: 1500,
              showConfirmButton: false
            });
            this.cargarUsuarios();
          },
          error: (err) => {
            console.error(err);
            Swal.fire({
              icon: 'error',
              title: 'No se puede eliminar',
              text: 'Este usuario tiene historial de pedidos en la base de datos. Te sugerimos Inhabilitarlo para no romper la integridad referencial.',
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
    this.nuevoUsuario = { dni: '', nombre: '', apellido: '', telefono: '', rol: 'MESERO', password: '', activo: true }; 
  }

  abrirModalEditar(usuario: any): void {
    this.esEdicion = true;
    this.mostrarModal = true;
    this.nuevoUsuario = { ...usuario, password: '' };
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarUsuario(): void {
    if (!this.nuevoUsuario.dni || !this.nuevoUsuario.nombre || !this.nuevoUsuario.apellido) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa los campos obligatorios (DNI, Nombre y Apellido).',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    if (this.esEdicion) {
      this.usuarioService.actualizarUsuario(this.nuevoUsuario.dni, this.nuevoUsuario).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: 'Datos del personal actualizados correctamente.',
            timer: 2000,
            showConfirmButton: false
          });
          this.cargarUsuarios();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron actualizar los datos del usuario.',
            confirmButtonColor: '#dc2626'
          });
        }
      });
    } else {
      const primerBloqueDni = this.nuevoUsuario.dni.substring(0, 4);
      const contrasennaGenerada = `CG@${primerBloqueDni}`;
      this.nuevoUsuario.password = contrasennaGenerada;

      this.usuarioService.registrarUsuario(this.nuevoUsuario).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Registro Exitoso!',
            html: `Usuario registrado con éxito.<br><br>Contraseña autogenerada: <b style="color: #10b981; font-size: 18px;">${contrasennaGenerada}</b>`,
            confirmButtonColor: '#10b981',
            confirmButtonText: 'Entendido'
          });
          this.cargarUsuarios();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Error de registro',
            text: err.error?.message || 'El DNI ya se encuentra registrado en el sistema.',
            confirmButtonColor: '#dc2626'
          });
        }
      });
    }
  }

  obtenerIconoRol(rol: string): string {
    switch (rol) {
      case 'ADMINISTRADOR': return 'assets/icons/admin.png';
      case 'CAJA': return 'assets/icons/cajero.png';
      default: return 'assets/icons/mesero.png';
    }
  }

  obtenerClaseRol(rol: string): string {
    switch (rol) {
      case 'ADMINISTRADOR': return 'bg-[#FDFBF9] border border-purple-200 text-purple-700';
      case 'CAJA': return 'bg-[#FDFBF9] border border-amber-200 text-amber-700';
      default: return 'bg-[#FDFBF9] border border-blue-200 text-blue-700';
    }
  }
}