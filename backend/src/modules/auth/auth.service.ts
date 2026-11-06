import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { JwtPayload } from '../../common/interfaces/authenticated-user.interface';
import type { PublicUser } from '../users/user.select';
import { UsersRepository } from '../users/users.repository';
import { BCRYPT_SALT_ROUNDS } from './auth.constants';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

export interface AuthResponse {
  token: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'role'>;
}

/** Casos de uso de autenticación: registro, login y perfil. */
@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    if (await this.users.findByEmail(dto.email)) {
      throw new ConflictException('El correo ya está registrado');
    }
    const password = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const user = await this.users.create({ ...dto, password });
    return this.buildResponse(user);
  }

  async login({ email, password }: LoginDto): Promise<AuthResponse> {
    const user = await this.users.findByEmail(email);
    // Mismo mensaje en ambos casos para no revelar si el correo existe
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.buildResponse(user);
  }

  async getProfile(userId: number): Promise<PublicUser> {
    const user = await this.users.findPublicById(userId);
    if (!user) throw new UnauthorizedException('Sesión inválida');
    return user;
  }

  private buildResponse(user: User): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return {
      token: this.jwt.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
