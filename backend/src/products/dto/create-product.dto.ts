import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsString() name!: string;
  @IsString() description!: string;
  @IsNumber() price!: number;
  @IsOptional() @IsNumber() discount?: number;
  @IsNumber() stock!: number;
  @IsString() brand!: string;
  @IsString() category!: string;
  @IsOptional() @IsString() subCategory?: string;
  @IsOptional() @IsBoolean() isOffer?: boolean;
  @IsArray() images!: string[];
  @IsOptional() @IsArray() colors?: string[];
  @IsOptional() @IsArray() sizes?: string[];
}
