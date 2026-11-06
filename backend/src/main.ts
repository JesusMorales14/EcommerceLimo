import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap(): Promise<void> {
  // rawBody es necesario para verificar la firma de los webhooks de Stripe
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = configureApp(app);

  await app.listen(config.port);
  Logger.log(
    `🚀 API escuchando en el puerto ${config.port} (${config.nodeEnv})`,
    'Bootstrap',
  );
}

void bootstrap();
