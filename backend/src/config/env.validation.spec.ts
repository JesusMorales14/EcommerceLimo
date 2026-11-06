import { buildAppConfig } from './configuration';
import { validateEnv } from './env.validation';

const BASE = {
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  JWT_SECRET: 'x'.repeat(32),
};

describe('validateEnv / buildAppConfig', () => {
  it('aplica valores por defecto y convierte tipos', () => {
    const env = validateEnv({ ...BASE, PORT: '4000' });
    expect(env.PORT).toBe(4000);
    expect(env.JWT_EXPIRES_IN).toBe('7d');
  });

  it('falla si falta una variable obligatoria o el secreto es débil', () => {
    expect(() => validateEnv({ JWT_SECRET: 'corto' })).toThrow(
      /Configuración de entorno inválida/,
    );
  });

  it('separa los orígenes CORS', () => {
    const config = buildAppConfig(
      validateEnv({ ...BASE, CORS_ORIGINS: 'http://a.com, https://b.com' }),
    );
    expect(config.corsOrigins).toEqual(['http://a.com', 'https://b.com']);
  });
});
