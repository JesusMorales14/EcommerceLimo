import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReclamacionBien, ReclamacionTipo } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/** Registro en el Libro de Reclamaciones (Ley N° 29571). */
export class CreateReclamacionDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  nombre!: string;
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  apellidos!: string;

  @ApiProperty({
    example: '12345678',
    description: 'DNI o carné de extranjería',
  })
  @Transform(trim)
  @Matches(/^\d{7,12}$/, {
    message: 'El DNI/CE debe contener entre 7 y 12 dígitos',
  })
  dni!: string;

  @ApiProperty() @Transform(trim) @IsEmail() email!: string;

  @ApiProperty({ example: '+51 987 654 321' })
  @Transform(trim)
  @Matches(/^[\d\s+\-()]{7,15}$/, { message: 'Teléfono inválido' })
  telefono!: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  direccion?: string;
  @ApiProperty({ enum: ReclamacionTipo })
  @IsEnum(ReclamacionTipo)
  tipo!: ReclamacionTipo;
  @ApiProperty({ enum: ReclamacionBien })
  @IsEnum(ReclamacionBien)
  bien!: ReclamacionBien;
  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  pedidoNum?: string;
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(10)
  @MaxLength(3000)
  detalle!: string;
  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  accion?: string;
}
