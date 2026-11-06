import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Autenticación opcional: si el token es válido adjunta el usuario, si no continúa como anónimo. */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(
    _error: unknown,
    user: TUser | false,
  ): TUser | undefined {
    return user || undefined;
  }
}
