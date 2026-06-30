import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('llama a authService.register con el DTO recibido', async () => {
    const dto = { name: 'Test', email: 'test@tienda.com', password: '123' };
    mockAuthService.register.mockResolvedValue({ token: 'jwt', user: {} });
    await controller.register(dto as any);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });

  it('llama a authService.login con el DTO recibido', async () => {
    const dto = { email: 'test@tienda.com', password: '123' };
    mockAuthService.login.mockResolvedValue({ token: 'jwt', user: {} });
    await controller.login(dto as any);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
  });
});
