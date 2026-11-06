import { type INestApplication, ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { APP_CONFIG } from './config/app-config.token';
import type { AppConfig } from './config/configuration';

/**
 * Configuración HTTP común de la aplicación. Se reutiliza en `main.ts` y en
 * las pruebas E2E para que ambos entornos se comporten igual.
 */
export function configureApp(app: INestApplication): AppConfig {
  const config = app.get<AppConfig>(APP_CONFIG);

  // Detrás del proxy de la plataforma (Render): usa la IP real del cliente
  // para el rate limiting y los logs.
  (app as NestExpressApplication).set('trust proxy', 1);
  app.use(helmet());
  app.enableCors({
    origin: buildCorsOrigin(config.corsOrigins),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableShutdownHooks();

  if (config.nodeEnv !== 'production') setupSwagger(app);
  return config;
}

/**
 * Permite los orígenes configurados en `CORS_ORIGINS`. Acepta comodines de
 * subdominio (`https://*.vercel.app`) para los entornos de preview.
 */
export function buildCorsOrigin(allowed: readonly string[]) {
  const patterns = allowed.map(
    (origin) =>
      new RegExp(
        `^${origin.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[\\w-]+')}$`,
      ),
  );
  return (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void,
  ) =>
    callback(null, !origin || patterns.some((pattern) => pattern.test(origin)));
}

function setupSwagger(app: INestApplication): void {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('EcommerceLimo API')
      .setDescription('API REST de la tienda EcommerceLimo')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup('docs', app, document);
}
