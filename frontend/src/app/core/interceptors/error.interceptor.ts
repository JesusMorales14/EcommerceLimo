import type { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../logger/logger.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth   = inject(AuthService);
  const logger = inject(LoggerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = error.error?.message ?? error.message ?? 'Error desconocido';

      switch (error.status) {
        case 0:
          logger.error('Sin conexión al servidor', error);
          break;
        case 401:
          logger.warn('Sesión expirada', { url: req.url });
          auth.logout();
          void router.navigate(['/login']);
          break;
        case 403:
          logger.warn('Acceso denegado', { url: req.url });
          void router.navigate(['/']);
          break;
        case 404:
          logger.warn('Recurso no encontrado', { url: req.url });
          break;
        case 422:
          logger.warn('Datos inválidos', { url: req.url, message });
          break;
        default:
          if (error.status >= 500) {
            logger.error('Error del servidor', { status: error.status, url: req.url, message });
          }
      }

      return throwError(() => error);
    })
  );
};
