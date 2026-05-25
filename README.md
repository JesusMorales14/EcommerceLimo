# EcommerceLimo

Plataforma de e-commerce full-stack construida con Angular 17+ en el frontend y NestJS en el backend, con soporte completo de modo oscuro, carrito de compras, sistema de cupones y panel de administración.

---

## Tech Stack

| Capa | Tecnología |
|---|---|
| Frontend | Angular 17+, TypeScript, SCSS |
| Backend | NestJS, TypeScript |
| Base de datos | PostgreSQL + Prisma ORM |
| Autenticación | JWT (access + refresh tokens) |
| Pagos | Stripe |
| Testing | Vitest (frontend) · Jest (backend) |
| CI/CD | GitHub Actions |

---

## Funcionalidades

- **Catálogo de productos** con categorías dinámicas, filtros y paginación
- **Buscador con modal** — resultados agrupados por marcas y productos en tiempo real
- **Carrito de compras** con drawer lateral, control de cantidades y persistencia
- **Favoritos** con sincronización por usuario
- **Checkout** con integración de Stripe y sistema de cupones de descuento
- **Autenticación** — registro, login, refresh token y rutas protegidas
- **Panel de administración** — gestión de productos, cupones, pedidos y usuarios
- **Modo oscuro / claro** con detección automática del sistema
- **Diseño responsive** — mobile-first con bottom nav para móvil
- **Dark mode** completo con CSS custom properties

---

## Estructura del proyecto

```
EcommerceLimo/
├── frontend/          # Angular 17+ SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Header, Footer, BottomNav, ChatSupport…
│   │   │   ├── core/          # Services, Models, Guards, Interceptors
│   │   │   └── pages/         # Inicio, ProductList, ProductDetail, Cart…
│   │   └── styles.scss        # CSS variables (light/dark mode)
│   └── angular.json
├── backend/           # NestJS API REST
│   ├── src/
│   │   ├── auth/
│   │   ├── categories/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── coupons/
│   │   └── users/
│   └── prisma/
│       └── schema.prisma
└── .github/
    └── workflows/
        └── ci.yml
```

---

## Instalación local

### Requisitos previos

- Node.js 22+
- PostgreSQL
- Bun (opcional, para el frontend)

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

Variables de entorno requeridas (`.env`):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your@email.com
MAIL_PASS=your_password
MAIL_FROM=your@email.com
```

### Frontend

```bash
cd frontend
npm install
npx ng serve
```

La app estará disponible en `http://localhost:4200`.

---

## Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npx ng test --watch=false
```

**Resultados actuales:**
- Backend: 22 suites · 64 tests ✅
- Frontend: 10 suites · 35 tests ✅

---

## CI/CD

GitHub Actions ejecuta automáticamente en cada push a `main`:

1. **Backend · NestJS Unit Tests**
2. **Backend · Build**
3. **Frontend · Angular Unit Tests**
4. **Frontend · Production Build**

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run start:dev` | Backend en modo desarrollo |
| `npm run build` | Build de producción del backend |
| `npx ng serve` | Frontend en desarrollo |
| `npx ng build --configuration production` | Build de producción del frontend |
| `npx ng test --watch=false` | Tests del frontend |
| `npm test` | Tests del backend |
