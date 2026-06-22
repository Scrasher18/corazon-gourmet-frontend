import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; 

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);


  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }


  const rolUsuario = authService.getRol();


  const rolesPermitidos = route.data['roles'] as Array<string>;


  if (!rolesPermitidos || rolesPermitidos.length === 0) {
    return true;
  }

  
  if (rolesPermitidos.includes(rolUsuario || '')) {
    return true; 
  }


  
  router.navigate(['/login']);
  return false;
};