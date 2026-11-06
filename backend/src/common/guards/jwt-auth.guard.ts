import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Exige un JWT válido en la cabecera `Authorization: Bearer <token>`. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
