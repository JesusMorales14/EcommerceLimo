import type { EnvironmentVariables } from './env.validation';

/** Configuración tipada de la aplicación, derivada de las variables de entorno. */
export interface AppConfig {
  readonly nodeEnv: string;
  readonly port: number;
  readonly frontendUrl: string;
  readonly corsOrigins: readonly string[];
  readonly jwt: { readonly secret: string; readonly expiresIn: string };
  readonly stripe: {
    readonly secretKey?: string;
    readonly webhookSecret?: string;
  };
  readonly mail: {
    readonly host?: string;
    readonly port: number;
    readonly user?: string;
    readonly pass?: string;
    readonly from: string;
    readonly adminEmail?: string;
  };
}

const DEFAULT_MAIL_FROM = 'noreply@ecommercelimo.com';

export function buildAppConfig(env: EnvironmentVariables): AppConfig {
  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    frontendUrl: env.FRONTEND_URL,
    corsOrigins: env.CORS_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    jwt: { secret: env.JWT_SECRET, expiresIn: env.JWT_EXPIRES_IN },
    stripe: {
      secretKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    },
    mail: {
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      user: env.MAIL_USER,
      pass: env.MAIL_PASS,
      from: env.MAIL_FROM ?? env.MAIL_USER ?? DEFAULT_MAIL_FROM,
      adminEmail: env.ADMIN_EMAIL ?? env.MAIL_USER,
    },
  };
}
