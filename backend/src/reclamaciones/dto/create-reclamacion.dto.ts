import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ReclamacionBien, ReclamacionTipo } from '@prisma/client';

export class CreateReclamacionDto {
  @IsString() nombre: string;
  @IsString() apellidos: string;
  @IsString() dni: string;
  @IsEmail() email: string;
  @IsString() telefono: string;
  @IsOptional() @IsString() direccion?: string;
  @IsEnum(ReclamacionTipo) tipo: ReclamacionTipo;
  @IsEnum(ReclamacionBien) bien: ReclamacionBien;
  @IsOptional() @IsString() pedidoNum?: string;
  @IsString() @MinLength(10) detalle: string;
  @IsOptional() @IsString() accion?: string;
}
