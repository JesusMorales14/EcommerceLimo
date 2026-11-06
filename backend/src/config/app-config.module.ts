import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_CONFIG } from './app-config.token';
import { buildAppConfig, type AppConfig } from './configuration';
import { validateEnv } from './env.validation';

/**
 * Carga y valida las variables de entorno una sola vez y expone
 * un objeto `AppConfig` inmutable inyectable con `@Inject(APP_CONFIG)`.
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
  ],
  providers: [
    {
      provide: APP_CONFIG,
      useFactory: (): AppConfig =>
        Object.freeze(buildAppConfig(validateEnv(process.env))),
    },
  ],
  exports: [APP_CONFIG],
})
export class AppConfigModule {}

export { APP_CONFIG };
