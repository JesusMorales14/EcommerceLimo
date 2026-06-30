import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody: true es necesario para verificar la firma del webhook de Stripe
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.enableCors({
    origin: (origin, callback) => {
      const allowed =
        !origin ||
        origin === 'http://localhost:4200' ||
        /\.netlify\.app$/.test(origin) ||
        /\.vercel\.app$/.test(origin);
      callback(null, allowed ? origin : false);
    },
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `🚀 Backend corriendo en http://localhost:${process.env.PORT ?? 3000}`,
  );
}

bootstrap();
