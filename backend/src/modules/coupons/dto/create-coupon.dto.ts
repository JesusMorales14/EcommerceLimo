import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Matches,
  Min,
} from 'class-validator';

export class CreateCouponDto {
  @ApiProperty({ example: 'VERANO20' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @Matches(/^[A-Z0-9_-]{3,30}$/, {
    message: 'El código debe tener 3-30 caracteres (letras, números, - o _)',
  })
  code!: string;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @IsPositive()
  discount!: number;

  @ApiProperty({ default: true })
  @IsBoolean()
  isPercent = true;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount = 0;

  @ApiPropertyOptional({ default: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses = 100;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:00.000Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
