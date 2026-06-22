import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CajaService } from '../../services/caja.service';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Home,
  Banknote,
  History,
  PieChart,
  UtensilsCrossed,
  Users,
  LogOut,
  UserCircle,
  Menu,
  X
} from 'lucide-angular';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cajaService = inject(CajaService);

  usuarioRol: string = 'MESERO';
  usuarioNombre: string = 'Usuario';
  menuAbierto: boolean = false;

  readonly HomeIcon = Home;
  readonly BanknoteIcon = Banknote;
  readonly HistoryIcon = History;
  readonly ChartIcon = PieChart;
  readonly MenuIcon = UtensilsCrossed;
  readonly UsersIcon = Users;
  readonly LogoutIcon = LogOut;
  readonly UserCircleIcon = UserCircle;
  readonly HamburgerIcon = Menu;
  readonly XIcon = X;

  ngOnInit(): void {
    this.usuarioRol = this.authService.getRol() || 'MESERO';

    const nombreGuardado = sessionStorage.getItem('nombre_usuario');
    const dni = sessionStorage.getItem('dni_usuario');

    if (nombreGuardado && nombreGuardado !== 'undefined' && nombreGuardado !== 'null') {
      this.usuarioNombre = nombreGuardado;
    } else if (dni) {
      this.usuarioNombre = `Empleado (${dni})`;
    } else {
      this.usuarioNombre = 'Usuario Invitado';
    }

    if (this.usuarioRol === 'CAJA' || this.usuarioRol === 'ADMINISTRADOR') {
      this.cajaService.getEstadoCaja().subscribe({
        error: (err) => console.error('Error al verificar caja en dashboard:', err)
      });
    }
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  logout(): void {
    Swal.fire({
      title: '¿Cerrar Sesión?',
      text: "Tendrás que volver a ingresar para acceder al sistema.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D96C6B',
      cancelButtonColor: '#A39183',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  getRolClass(): string {
    switch (this.usuarioRol) {
      case 'ADMINISTRADOR': return 'bg-[#4A3525] text-white';
      case 'CAJA': return 'bg-[#A3B196] text-[#2C3B22]';
      case 'MESERO': return 'bg-[#D96C6B] text-white';
      default: return 'bg-[#E3D5CA] text-[#4A3525]';
    }
  }
}