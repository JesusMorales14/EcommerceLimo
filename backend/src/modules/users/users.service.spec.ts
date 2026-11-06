import { NotFoundException } from '@nestjs/common';
import type { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const repo = {
    findAllPublic: jest.fn(),
    findPublicById: jest.fn(),
    updateProfile: jest.fn(),
  };
  const service = new UsersService(repo as unknown as UsersRepository);

  beforeEach(() => jest.clearAllMocks());

  it('findAll delega en el repositorio', async () => {
    repo.findAllPublic.mockResolvedValue([{ id: 1 }]);
    await expect(service.findAll()).resolves.toEqual([{ id: 1 }]);
  });

  it('findOne lanza NotFound si no existe', async () => {
    repo.findPublicById.mockResolvedValue(null);
    await expect(service.findOne(9)).rejects.toThrow(NotFoundException);
  });

  it('updateProfile solo envía los campos permitidos del DTO', async () => {
    repo.updateProfile.mockResolvedValue({ id: 1, name: 'Ana' });
    await service.updateProfile(1, { name: 'Ana' });
    expect(repo.updateProfile).toHaveBeenCalledWith(1, { name: 'Ana' });
  });
});
