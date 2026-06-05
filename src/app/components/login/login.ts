import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule, LogIn, KeyRound, User, Shield, Check } from 'lucide-angular';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  dni:        string  = '';
  password:   string  = '';
  isLoading:  boolean = false;
  loginSuccess: boolean = false;
  showError:    boolean = false;

  readonly LogInIcon  = LogIn;
  readonly KeyIcon    = KeyRound;
  readonly UserIcon   = User;
  readonly ShieldIcon = Shield;
  readonly CheckIcon  = Check;

  onLogin(): void {
    if (!this.dni || !this.password) {
      this.triggerError();
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, ingresa tu DNI y contraseña.',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    const dniRegex = /^[0-9]{8}$/;
    if (!dniRegex.test(this.dni)) {
      this.triggerError();
      Swal.fire({
        icon: 'error',
        title: 'DNI Inválido',
        text: 'El número de DNI debe contener exactamente 8 dígitos numéricos.',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    this.isLoading = true;

    this.authService.login(this.dni, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.loginSuccess = true;

        const rol = this.authService.getRol();

        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Inicio de sesión correcto.',
          timer: 1300,
          showConfirmButton: false
        }).then(() => {
        
          if (rol === 'ADMINISTRADOR') {
            this.router.navigate(['/dashboard/admin-inicio']);
          } else if (rol === 'CAJA') {
            this.router.navigate(['/dashboard/caja-cobros']); 
          } else {
            this.router.navigate(['/dashboard/pedido-registro']); 
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.loginSuccess = false;
        this.triggerError();

        Swal.fire({
          icon: 'error',
          title: 'Error de acceso',
          text: err.error?.error || 'DNI o contraseña incorrectos.',
          confirmButtonColor: '#dc2626'
        });
      }
    });
  }

  private triggerError(): void {
    this.showError = true;
    setTimeout(() => (this.showError = false), 1200);
  }
}