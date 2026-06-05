import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-admin-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-inicio.html',
  styleUrl: './admin-inicio.css'
})
export class AdminInicio implements OnInit {
  private dashboardService = inject(DashboardService);

  totalPersonal: number = 0;
  totalPlatos: number = 0;
  ventasDelDia: number = 0;

  ngOnInit(): void {
    this.cargarMetricas();
  }

  cargarMetricas(): void {
    this.dashboardService.getMetricas().subscribe({
      next: (data) => {
     
        this.totalPersonal = data.totalPersonal || 0;
        this.totalPlatos = data.totalPlatos || 0;
        this.ventasDelDia = data.ventasDelDia || 0;
      },
      error: (err) => {
        console.error('Error al conectar con el dashboard:', err);
      }
    });
  }
}