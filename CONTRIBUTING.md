# Guía de contribución

## Flujo de trabajo (GitHub Flow)

1. Crea una rama desde `develop` (o `main` si no existe): `feat/carrito-compartido`, `fix/total-con-cupon`, `refactor/...`, `chore/...`.
2. Haz commits pequeños con [Conventional Commits](https://www.conventionalcommits.org/es/) en español:
   - `feat(checkout): permite pago contra entrega`
   - `fix(orders): evita sobreventa con pedidos concurrentes`
   - `refactor(header): extrae menú de cuenta a subcomponente`
3. Antes de abrir el PR ejecuta en el proyecto que tocaste:
   ```bash
   npm run lint        # frontend      |  npm run lint:ci   # backend
   npm test -- --watch=false --coverage  |  npm run test:cov
   npm run build
   ```
4. Abre el Pull Request completando la plantilla. El CI (lint, pruebas, Sonar, e2e) debe estar en verde y requiere al menos una revisión.

## Convenciones de código

- **Idioma:** código (identificadores) en inglés; textos de UI, comentarios, mensajes de error y documentación en español.
- **Nombres:** `kebab-case` para archivos, `PascalCase` para clases/componentes, `camelCase` para funciones y variables, `UPPER_SNAKE_CASE` para constantes.
- **Tamaño:** si un archivo supera ~200 líneas o un componente hace más de una cosa, divídelo (subcomponente, store o función pura).
- **Sin números mágicos:** extrae constantes con nombre (`MAX_QTY`, `FREE_SHIPPING_THRESHOLD`).
- **Comentarios:** explica el *por qué*, no el *qué*. Documenta con JSDoc las APIs públicas.
- **Angular:** componentes standalone con `ChangeDetectionStrategy.OnPush`, `input()`/`output()`, `inject()`, control flow (`@if`, `@for`), signals para estado.
- **NestJS:** controlador → servicio → repositorio; DTO para cada entrada; nada de Prisma fuera de los repositorios.
- **Pruebas:** cada archivo de lógica tiene su `*.spec.ts` al lado. Nombra los casos describiendo el comportamiento esperado.
- **Accesibilidad:** todo elemento interactivo debe ser alcanzable por teclado y tener nombre accesible.

## Base de datos

- Cambia `prisma/schema.prisma` y genera la migración con `npm run db:migrate:dev -- --name descripcion_corta`.
- Nunca edites una migración ya aplicada en producción.

## Secretos

Nunca subas archivos `.env`. Usa `.env.example` como referencia y los *secrets* de GitHub para CI/CD.
