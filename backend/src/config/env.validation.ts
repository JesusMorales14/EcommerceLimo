import 'reflect-metadata';
import { plainToInstance, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

const MIN_JWT_SECRET_LENGTH = 32;
const MAX_PORT = 65535;

/**
 * Variables de entorno requeridas por la aplicación.
 * Se validan al arrancar: si falta alguna obligatoria la app no inicia
 * (principio "fail fast").
 */
export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsInt()
  @Min(1)
  @Max(MAX_PORT)
  @IsOptional()
  @Type(() => Number)
  PORT: number = 3000;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  @MinLength(MIN_JWT_SECRET_LENGTH, {
    message: `JWT_SECRET debe tener al menos ${MIN_JWT_SECRET_LENGTH} caracteres`,
  })
  JWT_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN = '7d';

  /** Orígenes permitidos por CORS, separados por coma. */
  @IsString()
  @IsOptional()
  CORS_ORIGINS = 'http://localhost:4200';

  @IsString()
  @IsOptional()
  FRONTEND_URL = 'http://localhost:4200';

  @IsString()
  @IsOptional()
  STRIPE_SECRET_KEY?: string;

  @IsString()
  @IsOptional()
  STRIPE_WEBHOOK_SECRET?: string;

  @IsString()
  @IsOptional()
  MAIL_HOST?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  MAIL_PORT: number = 587;

  @IsString()
  @IsOptional()
  MAIL_USER?: string;

  @IsString()
  @IsOptional()
  MAIL_PASS?: string;

  @IsString()
  @IsOptional()
  MAIL_FROM?: string;

  @IsString()
  @IsOptional()
  ADMIN_EMAIL?: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const details = errors
      .flatMap((error) => Object.values(error.constraints ?? {}))
      .join('\n - ');
    throw new Error(`Configuración de entorno inválida:\n - ${details}`);
  }
  return validated;
}
