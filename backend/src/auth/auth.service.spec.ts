import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

const mockUser = {
  id: 1,
  name: 'Usuario Test',
  email: 'test@tienda.com',
  password: 'hashed_password',
  role: 'USER',
  phone: null,
  address: null,
  createdAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock } };
  let jwt: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create:     jest.fn(),
        update:     jest.fn(),
      },
    };
    jwt = { sign: jest.fn().mockReturnValue('jwt-token-mock') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService,    useValue: jwt   },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ── register ─────────────────────────────────────────────────────────────────

  describe('register', () => {
    it('registra un usuario nuevo y retorna token y datos del usuario', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register({
        name: 'Usuario Test',
        email: 'test@tienda.com',
        password: 'Password123',
      });

      expect(result.token).toBe('jwt-token-mock');
      expect(result.user.email).toBe('test@tienda.com');
      expect(result.user.role).toBe('USER');
    });

    it('hashea la contraseña antes de guardarla', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      await service.register({ name: 'Test', email: 'test@tienda.com', password: 'MiClave123' });

      const createCall = prisma.user.create.mock.calls[0][0];
      expect(createCall.data.password).not.toBe('MiClave123');
      expect(createCall.data.password).toMatch(/^\$2b\$/);
    });

    it('lanza ConflictException si el email ya está registrado', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({ name: 'Test', email: 'test@tienda.com', password: '123' }),
      ).rejects.toThrow(ConflictException);
    });

    it('no llama a create si el email ya existe', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({ name: 'Test', email: 'test@tienda.com', password: '123' }),
      ).rejects.toThrow();

      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  // ── login ────────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('retorna token con credenciales válidas', async () => {
      const hash = await bcrypt.hash('Password123', 10);
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, password: hash });

      const result = await service.login({ email: 'test@tienda.com', password: 'Password123' });

      expect(result.token).toBe('jwt-token-mock');
      expect(result.user.id).toBe(1);
    });

    it('lanza UnauthorizedException si el usuario no existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'noexiste@tienda.com', password: '123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si la contraseña es incorrecta', async () => {
      const hash = await bcrypt.hash('PasswordCorrecta', 10);
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, password: hash });

      await expect(
        service.login({ email: 'test@tienda.com', password: 'PasswordIncorrecta' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── getProfile ───────────────────────────────────────────────────────────────

  describe('getProfile', () => {
    it('consulta el usuario por su ID', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile(1);

      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
      expect(result).toEqual(mockUser);
    });
  });

  // ── updateProfile ────────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('actualiza nombre, teléfono y dirección del usuario', async () => {
      const updated = { ...mockUser, name: 'Nuevo Nombre', phone: '+51999999999', address: 'Av. Lima 123' };
      prisma.user.update.mockResolvedValue(updated);

      const result = await service.updateProfile(1, {
        name: 'Nuevo Nombre',
        phone: '+51999999999',
        address: 'Av. Lima 123',
      });

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
      expect(result.name).toBe('Nuevo Nombre');
    });
  });
});
