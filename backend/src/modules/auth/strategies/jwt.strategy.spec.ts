import { Role } from '@prisma/client';
import type { AppConfig } from '../../../config/configuration';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const config = { jwt: { secret: 'x'.repeat(32) } } as AppConfig;

  it('transforma el payload del token en el usuario autenticado', () => {
    const strategy = new JwtStrategy(config);
    expect(
      strategy.validate({ sub: 7, email: 'ana@limo.pe', role: Role.USER }),
    ).toEqual({ id: 7, email: 'ana@limo.pe', role: Role.USER });
  });
});
