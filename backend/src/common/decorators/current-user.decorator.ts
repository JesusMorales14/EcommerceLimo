import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * Inyecta el usuario autenticado (o `undefined` en rutas con autenticación opcional).
 * Uso: `handler(@CurrentUser() user: AuthenticatedUser)`.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined =>
    ctx.switchToHttp().getRequest<{ user?: AuthenticatedUser }>().user,
);
