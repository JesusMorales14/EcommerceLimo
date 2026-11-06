import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReclamacionEstado } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateReclamacionDto {
  @ApiProperty({ enum: ReclamacionEstado })
  @IsEnum(ReclamacionEstado)
  estado!: ReclamacionEstado;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  respuesta?: string;
}
