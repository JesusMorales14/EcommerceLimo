import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const MAX_IMAGES = 20;
const MAX_PERCENT = 100;

export class CreateProductDto {
  @ApiProperty({ example: 'Smart TV 55" 4K' })
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  description!: string;

  @ApiProperty({ example: 1899.9 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiPropertyOptional({
    example: 15,
    description: 'Porcentaje de descuento (0-100)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_PERCENT)
  discount?: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiProperty({ example: 'Samsung' })
  @IsString()
  @MaxLength(80)
  brand!: string;

  @ApiProperty({ example: 'tecnologia' })
  @IsString()
  @MaxLength(60)
  category!: string;

  @ApiPropertyOptional({ example: 'televisores' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  subCategory?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isOffer?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(MAX_IMAGES)
  @IsString({ each: true })
  images!: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colors?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizes?: string[];

  @ApiPropertyOptional({ description: 'URLs de imágenes por color' })
  @IsOptional()
  @IsObject()
  colorImages?: Record<string, string[]>;
}
