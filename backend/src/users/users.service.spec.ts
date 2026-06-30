import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('findAll retorna lista de usuarios', async () => {
    mockPrisma.user.findMany.mockResolvedValue([{ id: 1, name: 'Test' }]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });
});
