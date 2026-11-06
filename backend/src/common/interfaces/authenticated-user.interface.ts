import type { Role } from '@prisma/client';

/** Contenido firmado dentro del JWT. */
export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
}

/** Usuario autenticado disponible en `request.user`. */
export interface AuthenticatedUser {
  id: number;
  email: string;
  role: Role;
}
