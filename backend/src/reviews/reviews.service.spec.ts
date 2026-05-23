import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  review: {
    findMany:  jest.fn(),
    create:    jest.fn(),
    aggregate: jest.fn(),
    groupBy:   jest.fn(),
  },
};

describe('ReviewsService', () => {
  let service: ReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});
