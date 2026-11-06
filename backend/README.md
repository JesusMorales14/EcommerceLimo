# EcommerceLimo — Backend

API REST en **NestJS 11** + **Prisma 5** (PostgreSQL).

## Comandos

```bash
npm ci                     # instala dependencias y genera el cliente de Prisma
cp .env.example .env       # configura DATABASE_URL y JWT_SECRET
npm run db:migrate         # aplica migraciones (prisma migrate deploy)
npm run seed               # datos de demostración (bloqueado en producción)
npm run start:dev          # http://localhost:3000 · Swagger en http://localhost:3000/docs
npm run test:cov           # pruebas unitarias + cobertura (umbral 85 % líneas)
npm run test:e2e           # pruebas de integración (requiere PostgreSQL)
npm run lint:ci            # ESLint
```

## Estructura

```
src/
├── main.ts / app.setup.ts     # arranque y configuración HTTP (Helmet, CORS, validación, Swagger)
├── app.module.ts              # composición de módulos + rate limiting + filtro de errores global
├── config/                    # variables de entorno validadas (fail fast) → AppConfig inyectable
├── common/                    # transversal, sin lógica de negocio
│   ├── decorators/            # @Auth(...roles), @CurrentUser(), @Roles()
│   ├── guards/                # JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard
│   ├── filters/               # AllExceptionsFilter (respuesta de error uniforme, errores de Prisma)
│   ├── interfaces/            # AuthenticatedUser, Paginated<T>
│   └── utils/                 # escapeHtml
├── infrastructure/            # adaptadores a servicios externos
│   ├── prisma/                # PrismaService + TransactionRunner (Unit of Work)
│   └── mail/                  # MailService + plantillas HTML
└── modules/<dominio>/
    ├── <dominio>.controller.ts   # HTTP: rutas, DTOs, autorización (sin lógica de negocio)
    ├── <dominio>.service.ts      # casos de uso / reglas de negocio
    ├── <dominio>.repository.ts   # acceso a datos (Prisma) — único lugar con consultas
    ├── domain/                   # funciones puras de dominio (precios, cupones, stock…)
    └── dto/                      # contratos de entrada validados con class-validator
```

Módulos: `auth`, `users`, `products`, `categories`, `orders`, `coupons`, `favorites`, `reviews`, `reclamaciones`, `deal-sessions`, `payments`, `dashboard`, `health`, `seo`.

## Seguridad

- Variables de entorno validadas al arrancar; `JWT_SECRET` de 32+ caracteres.
- `ValidationPipe` global con `whitelist` + `forbidNonWhitelisted` (evita *mass assignment*).
- Autorización declarativa con `@Auth(Role.ADMIN)`.
- Helmet, CORS por lista blanca, rate limiting global (120 req/min) y más estricto en login/registro.
- Escape de HTML en correos; errores internos sin filtrar detalles al cliente.
- Pedidos y cupones con operaciones atómicas en transacción (sin sobreventa ni doble canje).

## Endpoints de operación

| Ruta | Uso |
|---|---|
| `GET /health` | *Readiness*: verifica la conexión a la base de datos |
| `GET /health/live` | *Liveness*: el proceso responde |
| `GET /sitemap.xml` | Sitemap dinámico del catálogo |
| `GET /docs` | Swagger (solo fuera de producción) |

Más detalle en [ARCHITECTURE.md](../ARCHITECTURE.md).
