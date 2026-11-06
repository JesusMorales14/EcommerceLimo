import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export const MIN_RATING = 1;
export const MAX_RATING = 5;

export class CreateReviewDto {
  @ApiProperty({ minimum: MIN_RATING, maximum: MAX_RATING, example: 5 })
  @IsInt()
  @Min(MIN_RATING, { message: 'Rating debe estar entre 1 y 5' })
  @Max(MAX_RATING, { message: 'Rating debe estar entre 1 y 5' })
  rating!: number;

  @ApiProperty({ example: 'Excelente producto, llegó rápido.' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  comment!: string;
}
