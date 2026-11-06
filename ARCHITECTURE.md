# Arquitectura de EcommerceLimo

Este documento explica **cómo está organizado el código y por qué**, para que cualquier desarrollador pueda ubicar, extender y probar una funcionalidad sin romper las demás.

---

## 1. Visión general

```
┌──────────────────────────┐   HTTPS/JSON   ┌───────────────────────────┐    ┌────────────┐
│  SPA Angular (Vercel)    │ ─────────────▶ │  API NestJS (Render)      │ ─▶ │ PostgreSQL │
│  features → core → API   │ ◀───────────── │  controller→service→repo  │    └────────────┘
└──────────────────────────┘                │  ├─ Stripe (pagos)        │
                                            │  └─ SMTP (correos)        │
                                            └───────────────────────────┘
```

Monorepo con dos aplicaciones independientes (`frontend/`, `backend/`), cada una con sus dependencias, pruebas e imagen Docker. El CI detecta qué parte cambió y solo valida esa.

---

## 2. Backend — arquitectura en capas (Clean Architecture pragmática)

| Capa | Ubicación | Responsabilidad | Puede depender de |
|---|---|---|---|
| Presentación | `modules/*/*.controller.ts`, `dto/` | HTTP, validación de entrada, autorización, documentación Swagger | Servicio |
| Aplicación | `modules/*/*.service.ts` | Casos de uso: orquesta reglas, transacciones y notificaciones | Dominio, repositorios, infraestructura |
| Dominio | `modules/*/domain/*.ts` | Reglas puras (precio de líneas, descuento de cupón, estadísticas de reseñas). Sin Nest ni Prisma | Nada |
| Datos | `modules/*/*.repository.ts` | Consultas Prisma. **Único lugar con acceso a BD** | Prisma |
| Infraestructura | `infrastructure/` | Adaptadores externos: Prisma, correo, Stripe | Config |
| Transversal | `common/`, `config/` | Guards, decoradores, filtros, configuración tipada | — |

**Reglas:**

1. Un controlador nunca usa Prisma ni contiene `if` de negocio.
2. Un servicio nunca construye respuestas HTTP; lanza excepciones de Nest (`NotFoundException`, `ConflictException`…), que el `AllExceptionsFilter` traduce a un formato uniforme.
3. Toda entrada pasa por un DTO con `class-validator`; el `ValidationPipe` global rechaza propiedades no declaradas.
4. Las reglas de negocio calculables se extraen a `domain/` como funciones puras → se prueban sin mocks.

### Patrones aplicados

| Patrón | Dónde | Para qué |
|---|---|---|
| Repository | `*.repository.ts` | Aísla el ORM; los servicios se prueban con repositorios simulados |
| Unit of Work | `TransactionRunner` | Agrupa operaciones de varios repositorios en una transacción (pedido = líneas + stock + cupón) |
| Decorator / composición | `@Auth(Role.ADMIN)` | Une `@Roles`, guards y metadatos Swagger en un solo decorador |
| Strategy | `JwtStrategy`, guards | Autenticación intercambiable de Passport |
| Adapter | `MailService`, `PaymentsService` | Encapsulan SMTP y Stripe detrás de una interfaz propia |
| Template Method | `infrastructure/mail/templates` | Layout común + contenido específico por tipo de correo |
| Fail fast | `config/env.validation.ts` | La app no inicia con configuración inválida |

### Flujo de una petición (crear pedido)

```
POST /orders ─▶ ThrottlerGuard ─▶ JwtAuthGuard ─▶ ValidationPipe(CreateOrderDto)
   ─▶ OrdersController.create(@CurrentUser, dto)
   ─▶ OrdersService.create
        ├─ ProductsRepository.findByIds           (precios reales desde BD, nunca del cliente)
        ├─ domain/order-lines → calcula líneas y total
        └─ TransactionRunner.run(tx ⇒ decrementStock atómico + canje de cupón + insert)
   ─▶ MailService.sendOrderConfirmation (no bloqueante)
```

---

## 3. Frontend — arquitectura por features

```
app/
├── core/       Singleton (providedIn: 'root'): servicios de estado, HTTP, guards, interceptores, SEO
├── shared/     Piezas reutilizables y sin estado: componentes "tontos", pipes, utilidades puras
├── layout/     Shell de la aplicación (header, footer, drawer del carrito, chat, bottom-nav)
└── features/   Un directorio por dominio de negocio, cargado de forma diferida
```

**Reglas de dependencia:** `features → shared/core`, `layout → shared/core`, `shared → (nada de features)`. Una feature nunca importa otra feature; si dos la necesitan, la pieza sube a `shared/` o `core/`.

### Contenedor / presentación

- **Páginas** (`features/*/pages/`): componentes de ruta. Obtienen datos (stores/servicios), manejan navegación y pasan datos hacia abajo.
- **Componentes** (`features/*/components/`, `shared/components/`): reciben `input()`, emiten `output()`, sin acceso a HTTP. Son fáciles de reutilizar y probar.
- Un componente que supera ~150 líneas de plantilla o mezcla responsabilidades se divide en subcomponentes (p. ej. `checkout` → `delivery-step`, `payment-step`, `confirm-step`, `order-summary`, `coupon-form`…).

### Estado

- **Signals** (`signal`, `computed`, `linkedSignal`, `rxResource`) como fuente de verdad, sin librerías externas.
- **Stores por página** (`CheckoutStore`, `ProductDetailStore`, `DealsStore`): patrón *Facade*; se proveen en el componente para que su vida coincida con la de la página.
- Servicios globales en `core/services` (carrito persistente, sesión, favoritos, tema, búsqueda).
- Lógica pura (precios, paginación, ordenamiento, validadores) en archivos `*.ts` sin Angular → pruebas unitarias directas.

### Estilos

- Tokens de diseño (`styles/_tokens.scss`) y temas claro/oscuro con variables CSS.
- Cada componente tiene su propio `.scss`; los parciales compartidos de una feature viven en `features/<x>/styles/`.

---

## 4. Calidad, SEO, rendimiento y accesibilidad

| Área | Medidas |
|---|---|
| Calidad | ESLint estricto (TS + plantillas), Prettier, pruebas con umbral de cobertura, SonarQube con Quality Gate, CodeQL, plantillas de PR |
| SEO | `SeoTitleStrategy` + `SeoService` por ruta (título, descripción, canonical, Open Graph/Twitter, `noindex` en áreas privadas), JSON-LD de producto, `robots.txt`, sitemap dinámico (`/sitemap.xml`) |
| Rendimiento | Lazy loading por feature, precarga selectiva, `@defer`, `OnPush` + zoneless, carga diferida de Leaflet/Stripe, presupuestos de bundle, índices de BD, caché HTTP en categorías, imágenes optimizadas |
| Accesibilidad | Reglas a11y de angular-eslint en error, HTML semántico, *skip link*, foco visible, `aria-*`, diálogos accesibles, `prefers-reduced-motion`, pruebas automáticas con axe |
| Seguridad | Ver `backend/README.md` (validación, roles, rate limiting, Helmet, transacciones atómicas, escape de HTML) |

---

## 5. Cómo agregar una funcionalidad

**Backend (nuevo módulo `wishlists`, por ejemplo):**

1. `modules/wishlists/dto/*.dto.ts` con validaciones.
2. `wishlists.repository.ts` con las consultas Prisma.
3. `wishlists.service.ts` con los casos de uso (y `domain/` si hay reglas puras).
4. `wishlists.controller.ts` con `@Auth()` donde aplique.
5. `wishlists.module.ts` y registrarlo en `app.module.ts`.
6. Pruebas `*.spec.ts` para servicio, dominio y controlador; si cambia el esquema, `npm run db:migrate:dev`.

**Frontend (nueva sección):**

1. `features/<x>/<x>.routes.ts` y registrarlo en `app.routes.ts` con `loadChildren`.
2. Página en `pages/`, subcomponentes en `components/`, lógica en `data/`.
3. Título y metadatos en la ruta (`title` + `data.seo`).
4. Pruebas `*.spec.ts` junto a cada archivo.
