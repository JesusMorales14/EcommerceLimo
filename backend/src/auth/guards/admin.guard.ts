import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const user = ctx.switchToHttp().getRequest().user;
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Acceso restringido a administradores');
    }
    return true;
  }
}
