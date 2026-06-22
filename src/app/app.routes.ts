import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { PedidoRegistroComponent } from './components/pedido-registro/pedido-registro';
import { PedidoReporte } from './components/pedido-reporte/pedido-reporte';
import { CajaCobrosComponent } from './components/caja-cobros/caja-cobros';
import { AdminInicio } from './components/admin-inicio/admin-inicio';
import { MenuGestion } from './components/menu-gestion/menu-gestion';
import { UsuarioGestion } from './components/usuario-gestion/usuario-gestion';
import { Login } from './components/login/login';
import { CambiarPassword } from './components/cambiar-password/cambiar-password';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'cambiar-password',
    component: CambiarPassword
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [adminGuard],
    children: [
      {
        path: 'pedido-registro',
        component: PedidoRegistroComponent,
        data: { roles: ['MESERO', 'ADMINISTRADOR'] }
      },
      {
        path: 'pedido-reporte',
        component: PedidoReporte,
        data: { roles: ['MESERO', 'ADMINISTRADOR'] }
      },
      {
        path: 'caja-cobros',
        component: CajaCobrosComponent,
        data: { roles: ['CAJA', 'ADMINISTRADOR'] }
      },
      {
        path: 'admin-inicio',
        component: AdminInicio,
        data: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'menu-gestion',
        component: MenuGestion,
        data: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'usuario-gestion',
        component: UsuarioGestion,
        data: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: '',
        redirectTo: 'pedido-registro',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];