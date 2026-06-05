import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuarioRol: string = 'MESERO'; 
  usuarioNombre: string = 'Usuario';

  ngOnInit(): void {

    const rol = this.authService.getRol();
    const nombreGuardado = localStorage.getItem('nombre_usuario');
    const dni = localStorage.getItem('dni_usuario');
    
    if (rol) {
      this.usuarioRol = rol;
    }

    if (nombreGuardado) {
      this.usuarioNombre = nombreGuardado;
    } else if (dni) {
      this.usuarioNombre = `Empleado (${dni})`;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}