import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReclamacionEstado } from '@prisma/client';

export class UpdateReclamacionDto {
  @IsEnum(ReclamacionEstado) estado: ReclamacionEstado;
  @IsOptional() @IsString() respuesta?: string;
}
