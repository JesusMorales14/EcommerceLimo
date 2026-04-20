import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string;

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
  images!: string[];

  @IsArray()
  colors!: string[];

  @IsArray()
  sizes!: string[];

  @IsNumber()
  categoryId!: number;
}
