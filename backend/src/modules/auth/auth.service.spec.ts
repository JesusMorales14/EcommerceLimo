import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { UsersRepository } from '../users/users.repository';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

const USER = {
  id: 1,
  name: 'Ana',
  email: 'ana@test.com',
  role: 'USER',
  password: 'hash',
};

describe('AuthService', () => {
  const users = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findPublicById: jest.fn(),
  };
  const jwt = { sign: jest.fn(() => 'jwt-token') };
  const service = new AuthService(
    users as unknown as UsersRepository,
    jwt as unknown as JwtService,
  );

  beforeEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('crea el usuario con la contraseña hasheada y devuelve el token', async () => {
      users.findByEmail.mockResolvedValue(null);
      users.create.mockResolvedValue(USER);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash');

      const result = await service.register({
        name: 'Ana',
        email: 'ana@test.com',
        password: 'secreta1',
      });

      expect(users.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hash' }),
      );
      expect(result).toEqual({
        token: 'jwt-token',
        user: { id: 1, name: 'Ana', email: 'ana@test.com', role: 'USER' },
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('rechaza correos duplicados', async () => {
      users.findByEmail.mockResolvedValue(USER);
      await expect(
        service.register({ name: 'A', email: 'ana@test.com', password: 'x' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('devuelve el token con credenciales válidas', async () => {
      users.findByEmail.mockResolvedValue(USER);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      await expect(
        service.login({ email: 'ana@test.com', password: 'ok' }),
      ).resolves.toHaveProperty('token');
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'ana@test.com',
        role: 'USER',
      });
    });

    it.each([
      ['usuario inexistente', null, false],
      ['contraseña incorrecta', USER, false],
    ])('rechaza %s con el mismo mensaje', async (_case, user, valid) => {
      users.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(valid);
      await expect(
        service.login({ email: 'x@x.com', password: 'x' }),
      ).rejects.toThrow('Credenciales inválidas');
    });
  });

  it('getProfile invalida la sesión si el usuario ya no existe', async () => {
    users.findPublicById.mockResolvedValue(null);
    await expect(service.getProfile(1)).rejects.toThrow(UnauthorizedException);
  });
});
