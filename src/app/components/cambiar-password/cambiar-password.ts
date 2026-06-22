import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { LucideAngularModule, User, KeyRound, Eye, EyeOff } from 'lucide-angular';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './cambiar-password.html',
})
export class CambiarPassword {
  dto = { dni: '', passwordActual: '', nuevaPassword: '' };
  showPassActual = false;
  showPassNueva = false;

  readonly UserIcon = User;
  readonly KeyIcon = KeyRound;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

  constructor(private usuarioService: UsuarioService, private router: Router) {}

  actualizar() {
    if (!this.dto.dni || !this.dto.passwordActual || !this.dto.nuevaPassword) {
      this.mostrarAlerta('Campos incompletos', 'Por favor llena todos los campos', 'warning', false);
      return;
    }

    this.usuarioService.cambiarPassword(this.dto).subscribe({
      next: () => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Tu contraseña ha sido actualizada.',
          icon: 'success',
          confirmButtonColor: '#4A3525'
        }).then(() => this.router.navigate(['/login']));
      },
      error: (err) => {
        const mensaje = err.error?.message || err.error?.error || 'No se pudo actualizar la contraseña';
        this.mostrarAlerta('Error', mensaje, 'error', false);
      }
    });
  }

  private mostrarAlerta(titulo: string, texto: string, icono: any, redirigirAlCerrar: boolean) {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: icono,
      confirmButtonColor: '#D96C6B'
    }).then((result) => {
      if (redirigirAlCerrar && result.isConfirmed) {
        this.router.navigate(['/login']);
      }
    });
  }
}