import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

const mockProductsService = {
  findAll:  jest.fn(),
  findOne:  jest.fn(),
  create:   jest.fn(),
  update:   jest.fn(),
  remove:   jest.fn(),
  getStats: jest.fn(),
};

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockProductsService }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('getAll llama a findAll con los parámetros correctos', async () => {
    mockProductsService.findAll.mockResolvedValue({ items: [], total: 0, page: 1, pages: 1 });
    await controller.getAll('tecnologia', undefined, undefined, undefined, '1', '10');
    expect(mockProductsService.findAll).toHaveBeenCalledWith('tecnologia', undefined, undefined, undefined, 1, 10, undefined);
  });

  it('getById convierte el id a número antes de llamar a findOne', async () => {
    mockProductsService.findOne.mockResolvedValue({ id: 5 });
    await controller.getById('5');
    expect(mockProductsService.findOne).toHaveBeenCalledWith(5);
  });
});
