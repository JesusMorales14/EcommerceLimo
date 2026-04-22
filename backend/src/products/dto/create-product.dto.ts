import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsString()
  description!: string;

  @IsNumber()
  price!: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsNumber()
  stock!: number;

  @IsArray()
  @ArrayNotEmpty()
  images!: string[];

  @IsArray()
  @ArrayNotEmpty()
  colors!: string[];

  @IsArray()
  @ArrayNotEmpty()
  sizes!: string[];

  @IsNumber()
  categoryId!: number;

  @IsOptional()
  @IsString()
  subCategory?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isOffer?: boolean;
}
