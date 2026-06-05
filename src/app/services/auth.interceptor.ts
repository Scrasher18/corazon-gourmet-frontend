import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment'; 

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token'); 
  let clonedReq = req;


  if (token) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }


  if (clonedReq.url.includes('http://localhost:8080')) {
    const secureUrl = clonedReq.url.replace('http://localhost:8080', environment.apiUrl);
    clonedReq = clonedReq.clone({ url: secureUrl });
  }


  console.log(`🛡️ Interceptor redirigiendo petición a: ${clonedReq.url}`);

  return next(clonedReq);
};