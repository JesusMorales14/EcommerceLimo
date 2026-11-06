import type { Prisma } from '@prisma/client';

/** Campos públicos del usuario: nunca se expone el hash de la contraseña. */
export const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  address: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof PUBLIC_USER_SELECT;
}>;
