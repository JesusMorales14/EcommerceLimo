import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_dummy_key_for_testing';

    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentsService],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});
