# EcommerceLimo

Plataforma de comercio electrónico full-stack para el mercado peruano (precios en soles, IGV, Libro de Reclamaciones), desarrollada por **Jesús Silva Morales**.

[![CI](https://github.com/JesusMorales14/EcommerceLimo/actions/workflows/ci.yml/badge.svg)](https://github.com/JesusMorales14/EcommerceLimo/actions/workflows/ci.yml)
[![CodeQL](https://github.com/JesusMorales14/EcommerceLimo/actions/workflows/codeql.yml/badge.svg)](https://github.com/JesusMorales14/EcommerceLimo/actions/workflows/codeql.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=JesusMorales14_EcommerceLimo&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=JesusMorales14_EcommerceLimo)

**Demo:** [ecommerce-limo.vercel.app](https://ecommerce-limo.vercel.app)

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Angular 21 (standalone, signals, zoneless, control flow, `@defer`), SCSS |
| Backend | NestJS 11, class-validator, Swagger, Helmet, Throttler |
| Base de datos | PostgreSQL + Prisma 5 |
| Autenticación | JWT (Bearer) con roles `USER` / `ADMIN` |
| Pagos | Stripe (Payment Intents, en soles) |
| Mapas | Leaflet + OpenStreetMap (carga diferida) |
| Pruebas | Vitest (frontend) · Jest + Supertest (backend) · Playwright + axe (e2e) |
| Calidad | ESLint (reglas de accesibilidad), Prettier, SonarQube/SonarCloud, CodeQL |
| CI/CD | GitHub Actions · Docker (GHCR) · Render (API) · Vercel (SPA) |

## Funcionalidades

- Catálogo con categorías, filtros, ordenamiento y paginación; ficha de producto con galería por color y reseñas.
- Buscador en tiempo real agrupado por marcas y productos.
- Carrito persistente (drawer lateral y página), favoritos sincronizados por usuario.
- Checkout en 3 pasos: entrega (mapa + geocodificación), pago (tarjeta/Stripe o efectivo) y confirmación; cupones de descuento.
- Ofertas por tiempo limitado con cuenta regresiva.
- Cuenta de usuario: perfil, historial y seguimiento de pedidos, reclamos.
- Libro de Reclamaciones (normativa peruana) con seguimiento y notificaciones por correo.
- Panel de administración: métricas, productos, pedidos, usuarios, cupones, ofertas y reclamos.
- Modo claro/oscuro, diseño responsive, SEO (títulos, metadatos Open Graph, datos estructurados, sitemap) y accesibilidad WCAG 2.1 AA.

## Estructura

```
EcommerceLimo/
├── frontend/                 SPA Angular  → ver frontend/README.md
│   └── src/app/
│       ├── core/             servicios singleton, modelos, guards, interceptores, SEO
│       ├── shared/           componentes, pipes y utilidades reutilizables
│       ├── layout/           header, footer, carrito lateral, chat, navegación móvil
│       └── features/         home, catalog, cart, checkout, auth, account, claims, support, admin
├── backend/                  API REST NestJS → ver backend/README.md
│   ├── src/
│   │   ├── config/           variables de entorno validadas y tipadas
│   │   ├── common/           decoradores, guards, filtros, utilidades transversales
│   │   ├── infrastructure/   Prisma (BD) y correo
│   │   └── modules/          un módulo por dominio (controller → service → repository)
│   └── prisma/               esquema, migraciones y seed
├── .github/                  workflows de CI/CD, Dependabot y plantillas
├── docker-compose.yml        entorno local completo (PostgreSQL + API + SPA)
└── sonar-project.properties  configuración de SonarQube
```

La arquitectura, los patrones aplicados y las convenciones están documentados en **[ARCHITECTURE.md](ARCHITECTURE.md)**. Para contribuir, ver **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## Puesta en marcha

### Opción A — Docker (todo en uno)

```bash
cp backend/.env.example backend/.env   # completa JWT_SECRET (mín. 32 caracteres)
docker compose up --build
docker compose exec api npm run seed   # datos de demostración (opcional)
```

SPA en http://localhost:8080 · API en http://localhost:3000.

### Opción B — Local

Requisitos: Node.js 22 y PostgreSQL 16.

```bash
# Backend
cd backend
cp .env.example .env        # configura DATABASE_URL y JWT_SECRET
npm ci
npm run db:migrate
npm run seed
npm run start:dev           # http://localhost:3000 · Swagger en /docs

# Frontend (otra terminal)
cd frontend
npm ci
npm start                   # http://localhost:4200
```

Usuarios de demostración (entorno local): `admin@tienda.com` / `Admin123456` y `usuario@tienda.com` / `Usuario123` (configurables con `SEED_ADMIN_PASSWORD` y `SEED_USER_PASSWORD`).

## Scripts principales

| Proyecto | Comando | Descripción |
|---|---|---|
| frontend | `npm test -- --watch=false --coverage` | Pruebas unitarias con cobertura (umbral 80 %) |
| frontend | `npm run lint` | ESLint (TypeScript + plantillas + accesibilidad) |
| frontend | `npm run e2e` | Pruebas Playwright (requiere API y SPA levantadas) |
| backend | `npm run test:cov` | Pruebas unitarias con cobertura (umbral 85 %) |
| backend | `npm run test:e2e` | Pruebas de integración contra PostgreSQL |
| backend | `npm run lint:ci` | ESLint sin autocorrección |

## CI/CD

| Workflow | Disparador | Qué hace |
|---|---|---|
| `ci.yml` | push / PR a `main` y `develop` | Detecta cambios por proyecto; lint, pruebas con cobertura y build; integración con PostgreSQL; Playwright (funcional, accesibilidad, rendimiento); SonarQube con Quality Gate; build de imágenes Docker en PR |
| `cd.yml` | CI verde en `main` | Publica imágenes en GHCR, despliega la API en Render (con smoke test a `/health`) y la SPA en Vercel |
| `codeql.yml` | push / PR / semanal | Análisis de seguridad SAST |
| `ai-review.yml` | PR | Revisión automática del diff con IA |

Secretos necesarios: `SONAR_TOKEN` (y `SONAR_HOST_URL` si usas un SonarQube propio), `RENDER_DEPLOY_HOOK_URL`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `GEMINI_API_KEY`. Los pasos sin secreto se omiten con un aviso.

## Desarrollador

**Jesús Silva Morales** — [@JesusMorales14](https://github.com/JesusMorales14)
