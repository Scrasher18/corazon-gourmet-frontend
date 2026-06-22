import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { CajaService } from '../../services/caja.service';
import { LucideAngularModule, Users, UtensilsCrossed, CircleDollarSign, Activity, BarChart3, History } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

interface CierreCaja {
  id: number;
  fechaApertura: string;
  fechaCierre: string | null;
  montoInicial: number;
  ingresosDeclarados: number | null;
  ingresosSistema: number | null;
  diferencia: number | null;
  estado: string;
  cajero: {
    nombre: string;
    apellidos: string;
    dni: string;
  };
}

@Component({
  selector: 'app-admin-inicio',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BaseChartDirective],
  templateUrl: './admin-inicio.html'
})
export class AdminInicio implements OnInit {
  private dashboardService = inject(DashboardService);
  private cajaService = inject(CajaService);

  totalPersonal: number = 0;
  totalPlatos: number = 0;
  ventasDelDia: number = 0;

  cajaAbierta: boolean = false;
  ventasTurnoActual: number = 0;

  historialCajas: CierreCaja[] = [];
  cargandoHistorial: boolean = true;
  errorHistorial: string | null = null;

  readonly UsersIcon = Users;
  readonly MenuIcon = UtensilsCrossed;
  readonly MoneyIcon = CircleDollarSign;
  readonly ActivityIcon = Activity;
  readonly ChartIcon = BarChart3;
  readonly HistoryIcon = History;

  periodoSeleccionado: string = 'hoy';
  
  public chartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { 
        data: [], 
        label: 'Ingresos (S/)',
        backgroundColor: '#D96C6B',
        hoverBackgroundColor: '#C25857',
        borderRadius: 6,
      }
    ]
  };

  public chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, grid: { display: true, color: '#E3D5CA' } },
      x: { 
        grid: { display: false },
        ticks: { autoSkip: false }
      }
    }
  };

  ngOnInit(): void {
    this.cargarMetricas();
    this.cargarGrafico(this.periodoSeleccionado);
    this.cargarHistorialCajas();
    
    this.cajaService.cajaAbierta$.subscribe(estado => this.cajaAbierta = estado);
    this.cajaService.ventasActuales$.subscribe(monto => this.ventasTurnoActual = monto);
    
    if (this.cajaService.valorActual === 0 && !this.cajaAbierta) {
      this.cajaService.getEstadoCaja().subscribe();
    }
  }

  cargarMetricas(): void {
    this.dashboardService.getMetricas().subscribe({
      next: (data) => {
        this.totalPersonal = data.totalPersonal || 0;
        this.totalPlatos = data.totalPlatos || 0;
        this.ventasDelDia = data.ventasDelDia || 0;
      },
      error: (err) => console.error(err)
    });
  }

  cargarHistorialCajas(): void {
    this.cargandoHistorial = true;
    this.errorHistorial = null;
    this.cajaService.obtenerHistorialCajas().subscribe({
      next: (data) => {
        this.historialCajas = data;
        this.cargandoHistorial = false;
      },
      error: (err) => {
        console.error('Error al cargar historial', err);
        this.errorHistorial = 'No se pudo cargar el historial de cajas.';
        this.cargandoHistorial = false;
      }
    });
  }

  cargarGrafico(periodo: string): void {
    this.periodoSeleccionado = periodo;
    this.dashboardService.getGraficoVentas(periodo).subscribe({
      next: (data) => {
        const chartFormattedData = data.map(item => ({
          name: this.formatearEtiqueta(item.etiqueta, periodo),
          value: item.total
        }));

        this.chartData = {
          labels: chartFormattedData.map(item => item.name),
          datasets: [{ ...this.chartData.datasets[0], data: chartFormattedData.map(item => item.value) }]
        };
      },
      error: (err) => console.error(err)
    });
  }

  private formatearEtiqueta(valor: string, periodo: string): string {
    if (periodo === 'hoy') return `${valor}:00`;
    if (periodo === 'mes') return `Día ${valor}`;
    if (periodo === 'anio') {
      const meses: { [key: string]: string } = {
        '1': 'Ene', '2': 'Feb', '3': 'Mar', '4': 'Abr', 
        '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Ago', 
        '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic'
      };
      return meses[valor] || valor;
    }
    return valor;
  }
}