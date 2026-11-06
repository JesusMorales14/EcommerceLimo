import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class CreateDealSessionDto {
  @ApiProperty({
    example: '2026-12-01T23:00:00.000Z',
    description: 'Fin de la sesión de ofertas',
  })
  @IsDateString()
  endsAt!: string;

  @ApiPropertyOptional({ description: 'Inicio (por defecto: ahora)' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;
}
