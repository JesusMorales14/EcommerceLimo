import type { ApplicationConfig} from '@angular/core';
import { APP_INITIALIZER, ErrorHandler, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { GlobalErrorHandler } from './core/error-handler/global-error.handler';
import { AuthService } from './core/services/auth.service';
import { FavoritesService } from './core/services/favorites.service';
import { CategoryService } from './core/services/category.service';

function initApp(): () => void {
  const auth = inject(AuthService);
  const fav  = inject(FavoritesService);
  const cat  = inject(CategoryService);
  return () => {
    auth.initSession();
    fav.loadFavorites();
    cat.load();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: APP_INITIALIZER, useFactory: initApp, multi: true },
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      withPreloading(PreloadAllModules)
    ),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
  ]
};
