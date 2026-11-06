import type { Routes } from '@angular/router';
import type { RouteSeoData } from '@core/seo/seo.model';

export const SUPPORT_ROUTES: Routes = [
  {
    path: 'centro-ayuda',
    title: 'Centro de Ayuda',
    data: {
      seo: { description: 'Resuelve tus dudas sobre pedidos, envíos, pagos y devoluciones.' } satisfies RouteSeoData,
    },
    loadComponent: () => import('./pages/centro-ayuda/centro-ayuda').then((m) => m.CentroAyudaPage),
  },
  {
    path: 'politica-envio',
    title: 'Política de envío',
    data: {
      seo: { description: 'Conoce los plazos, costos y zonas de cobertura de nuestros envíos.' } satisfies RouteSeoData,
    },
    loadComponent: () =>
      import('./pages/politica-envio/politica-envio').then((m) => m.PoliticaEnvioPage),
  },
  {
    path: 'terminos',
    title: 'Términos y condiciones',
    data: {
      seo: { description: 'Términos y condiciones de uso y compra en EcommerceLimo.' } satisfies RouteSeoData,
    },
    loadComponent: () => import('./pages/terminos/terminos').then((m) => m.TerminosPage),
  },
  {
    path: 'privacidad',
    title: 'Política de privacidad',
    data: {
      seo: { description: 'Cómo protegemos y tratamos tus datos personales.' } satisfies RouteSeoData,
    },
    loadComponent: () =>
      import('./pages/politica-privacidad/politica-privacidad').then((m) => m.PoliticaPrivacidadPage),
  },
];
