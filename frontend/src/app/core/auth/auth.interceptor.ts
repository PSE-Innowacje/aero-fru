import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  if (token && !req.url.includes('/api/auth/login')) {
    const isMultipart = req.body instanceof FormData;
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        ...(!isMultipart ? {} : {})
      }
    });
  }

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401 && !req.url.includes('/api/auth/login')) {
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
