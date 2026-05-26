# EcommerceLimo — Frontend

Aplicación de e-commerce construida con **Angular 21** (standalone components, signals, lazy loading). Incluye catálogo de productos, carrito, checkout con geolocalización, sistema de reseñas, favoritos, libro de reclamaciones y panel de administración completo.

**Demo en vivo:** [ecommerce-limo.vercel.app](https://ecommerce-limo.vercel.app)

---

## Tecnologías

| Categoría | Herramienta |
|---|---|
| Framework | Angular 21 (standalone) |
| Lenguaje | TypeScript 5.9 |
| Estilos | SCSS + CSS custom properties (dark/light mode) |
| Estado | Angular Signals + Computed |
| Tests | Vitest + Angular Testing Utilities |
| Linting | ESLint + @angular-eslint |
| Formateo | Prettier |
| Build | Angular CLI + esbuild |
| Deploy | Vercel |

---

## Estructura del proyecto

```
src/app/
├── core/
│   ├── config/          # Constantes globales (SITE_CONFIG)
│   ├── error-handler/   # GlobalErrorHandler (ChunkLoadError, errores no manejados)
│   ├── guards/          # authGuard, adminGuard
│   ├── interceptors/    # authInterceptor (JWT), errorInterceptor (401/403/500)
│   ├── logger/          # LoggerService (dev logs + hook para Sentry en prod)
│   ├── models/          # Interfaces TypeScript: User, Product, Order, Reclamacion
│   └── services/        # 14 servicios: Auth, Cart, Product, Search, Order, etc.
├── components/          # Componentes reutilizables: Header, Footer, BottomNav, etc.
├── pages/               # Vistas lazy-loaded: Inicio, ProductDetail, Checkout, Admin, etc.
└── shared/
    └── pipes/           # CurrencyPenPipe, TruncatePipe, OrderStatusPipe
```

---

## Requisitos previos

- **Node.js** 20+
- **Bun** 1.3+ (`npm install -g bun`)
- **Angular CLI** 21+ (`bun add -g @angular/cli`)

---

## Instalación y desarrollo

```bash
# Instalar dependencias
bun install

# Servidor de desarrollo (http://localhost:4200)
bun start

# Build de producción
bun run build

# Ejecutar tests unitarios
bun test

# Linting
bun run lint
bun run lint:fix
```

---

## Variables de entorno

El frontend consume la API a través de `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

Para producción se reemplaza por `environment.prod.ts` con la URL del backend en Railway/Render.

---

## Arquitectura destacada

### Manejo de errores
- **`GlobalErrorHandler`** — captura cualquier error no manejado; detecta `ChunkLoadError` (deploy nuevo) y redirige sin romper la app.
- **`errorInterceptor`** — intercepta respuestas HTTP: 401 cierra sesión, 403 redirige a inicio, 5xx logea el error.
- **`LoggerService`** — wrapper unificado; en producción es el punto de integración con Sentry/Datadog.

### Rendimiento
- Todas las rutas usan **lazy loading** + `PreloadAllModules` para precarga en background.
- Componentes con `ChangeDetectionStrategy.OnPush` para minimizar ciclos de detección de cambios.
- Pipes `pure: true` para evitar recalculaciones innecesarias.
- Suscripciones a observables de larga vida protegidas con `takeUntilDestroyed(DestroyRef)`.

### Estado reactivo
- Servicios con `signal()` y `computed()` — sin NgRx, apropiado para la escala del proyecto.
- `CartService`, `AuthService`, `SearchService`, `FavoritesService` son el source of truth de cada dominio.

---

## Tests

```bash
bun test                    # Ejecutar todos los tests
bun test --coverage         # Con reporte de cobertura
```

Cobertura objetivo: **≥ 70%** en servicios core y componentes principales.

Servicios con tests: `CartService`, `AuthService`, `ProductService`, `SearchService`  
Componentes con tests: `Header`, `Footer`, `ProductDetail`, `ProductList`, `Inicio`  
Pipes con tests: `CurrencyPenPipe`, `TruncatePipe`

---

## Panel de administración

Accesible en `/admin` (requiere rol `ADMIN`). Secciones:

- **Productos** — CRUD completo con imágenes y variantes por color
- **Pedidos** — visualización y cambio de estado con notificación por email
- **Usuarios** — listado de cuentas registradas
- **Cupones** — creación y gestión de descuentos
- **Ofertas del día** — configuración del banner con timer
- **Reclamaciones** — gestión del libro de reclamaciones con respuesta al cliente

---

## Contribuir

1. Crear rama desde `main`: `git checkout -b feat/nombre-feature`
2. Commits en español siguiendo el formato `tipo: descripción` (feat, fix, chore, refactor)
3. Asegurarse de que `bun run lint` y `bun test` pasen sin errores
4. Abrir Pull Request hacia `main`
