# EcommerceLimo — Frontend

SPA en **Angular 21** (componentes standalone, signals, detección de cambios *zoneless*, `OnPush` en todos los componentes).

## Requisitos

- Node.js 22 y npm 10

## Comandos

```bash
npm ci                                  # instalar dependencias
npm start                               # desarrollo → http://localhost:4200
npm run build                           # build de producción (dist/frontend/browser)
npm test -- --watch=false --coverage    # pruebas unitarias (Vitest) + cobertura
npm run lint                            # ESLint (TS + plantillas + accesibilidad)
npm run e2e                             # Playwright (requiere API y SPA levantadas)
```

## Estructura

```
src/
├── app/
│   ├── core/            # Singleton: servicios, modelos, guards, interceptores, SEO, configuración
│   │   ├── config/      # SITE_CONFIG (marca, moneda, IGV) y navegación
│   │   ├── seo/         # SeoService + SeoTitleStrategy (título, meta, Open Graph, JSON-LD)
│   │   ├── routing/     # Estrategia de precarga selectiva
│   │   └── services/    # Estado global con signals (carrito, sesión, favoritos, búsqueda…)
│   ├── shared/          # Reutilizable y sin estado: componentes, pipes, utilidades puras
│   ├── layout/          # Shell: header, footer, carrito lateral, chat de ayuda, bottom-nav
│   └── features/        # Un directorio por dominio, cargado de forma diferida
│       └── <feature>/
│           ├── <feature>.routes.ts
│           ├── pages/        # Componentes contenedor (ruta): orquestan datos
│           ├── components/   # Componentes de presentación (inputs/outputs)
│           ├── data/         # Stores, modelos y lógica pura de la feature
│           └── services/     # Adaptadores específicos (p. ej. geocodificación)
├── styles/              # tokens, temas claro/oscuro, base y ajustes de modo oscuro
└── environments/
```

Alias de importación: `@core/*`, `@shared/*`, `@layout/*`, `@features/*`, `@env/*`.

## Variables por entorno

`src/environments/environment*.ts` define `apiUrl`, `siteUrl` y `stripePublicKey`. El build de producción reemplaza `environment.ts` por `environment.prod.ts`.

## Rendimiento

- Rutas diferidas por feature + precarga selectiva (el panel de administración no se precarga).
- `@defer` para secciones bajo el pliegue; Leaflet y Stripe se cargan solo al llegar al checkout.
- Imágenes fuera de pantalla con `loading="lazy"`; presupuestos de tamaño en `angular.json`.

## Accesibilidad

- Reglas `@angular-eslint/template/accessibility` en modo error.
- *Skip link*, foco visible, `aria-*` en componentes interactivos, soporte de `prefers-reduced-motion`.
- Pruebas automáticas con axe en `e2e/non-functional/accessibility.spec.ts`.

Más detalle en [ARCHITECTURE.md](../ARCHITECTURE.md).
