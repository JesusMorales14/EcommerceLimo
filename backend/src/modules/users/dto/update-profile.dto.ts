import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Datos que un usuario puede modificar de su propio perfil.
 * Lista blanca explícita: impide la asignación masiva de campos como `role` o `email`.
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Ana García' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @ApiPropertyOptional({ example: '+51 987 654 321' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'Av. Larco 123, Miraflores' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;
}
