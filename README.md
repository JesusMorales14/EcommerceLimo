# EcommerceLimo

Plataforma de e-commerce full-stack desarrollada por **Jesús Silva Morales**.

Construida con Angular 17+ en el frontend y NestJS en el backend, con modo oscuro, carrito de compras, sistema de cupones, buscador en tiempo real y panel de administración completo.

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
- **Favoritos** con sincronización por usuario autenticado
- **Checkout** con integración de Stripe y sistema de cupones de descuento
- **Autenticación completa** — registro, login, refresh token y rutas protegidas
- **Panel de administración** — gestión de productos, cupones, pedidos y usuarios
- **Modo oscuro / claro** con detección automática del sistema
- **Diseño responsive** — mobile-first con bottom nav para móvil

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

## Tests

- **Backend:** 22 suites · 64 tests
- **Frontend:** 10 suites · 35 tests

CI/CD con GitHub Actions ejecuta tests y build automáticamente en cada push a `main`.

---

## Desarrollador

**Jesús Silva Morales** — [@JesusMorales14](https://github.com/JesusMorales14)
