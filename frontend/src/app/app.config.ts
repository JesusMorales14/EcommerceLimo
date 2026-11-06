import type { ApplicationConfig } from '@angular/core';
import {
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
} from '@angular/router';
import { SelectivePreloadingStrategy } from '@core/routing/selective-preloading.strategy';
import { GlobalErrorHandler } from '@core/error-handler/global-error.handler';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { SeoTitleStrategy } from '@core/seo/seo-title.strategy';
import { AuthService } from '@core/services/auth.service';
import { CategoryService } from '@core/services/category.service';
import { routes } from './app.routes';

/**
 * Carga el estado global necesario al arrancar la aplicación.
 * Los favoritos se sincronizan solos con la sesión (ver FavoritesService).
 */
function initializeApp(): void {
  inject(AuthService).initSession();
  inject(CategoryService).load();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: TitleStrategy, useClass: SeoTitleStrategy },
    provideAppInitializer(initializeApp),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      withPreloading(SelectivePreloadingStrategy),
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
  ],
};
